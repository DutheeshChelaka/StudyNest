import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import OpenAI from 'openai';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey !== 'your-key-here') {
      this.openai = new OpenAI({ apiKey });
      console.log('🤖 OpenAI connected');
    } else {
      this.openai = new OpenAI({ apiKey: 'sk-placeholder' });
      console.log('⚠️ OpenAI API key not configured — AI features disabled');
    }
  }

  private checkAiAvailable() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your-key-here') {
      throw new Error('AI features are not available. Please configure OPENAI_API_KEY in .env');
    }
  }

  // ==================== DOCUMENT PROCESSING ====================

  async uploadDocument(userId: string, file: Express.Multer.File, subject?: string) {
    this.checkAiAvailable();

    const document = await this.prisma.document.create({
      data: {
        userId,
        fileName: file.originalname,
        subject: subject || null,
        status: 'processing',
      },
    });

    this.processDocument(document.id, file).catch((err) => {
      console.error(`❌ Document processing failed: ${err.message}`);
      this.prisma.document.update({
        where: { id: document.id },
        data: { status: 'failed' },
      });
    });

    return { documentId: document.id, status: 'processing', fileName: file.originalname };
  }

  private async processDocument(documentId: string, file: Express.Multer.File) {
    this.checkAiAvailable();

    console.log(`📄 Processing document: ${file.originalname}`);

    let text: string;
    if (file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(file.buffer);
      text = pdfData.text;
    } else {
      text = file.buffer.toString('utf-8');
    }

    if (!text || text.trim().length < 50) {
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: 'failed' },
      });
      throw new Error('Document has insufficient text content');
    }

    const chunks = this.chunkText(text, 2000, 200);

    console.log(`📝 Created ${chunks.length} chunks from ${text.length} characters`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      const embedding = await this.generateEmbedding(chunk.content);

      await this.prisma.$executeRawUnsafe(
        `INSERT INTO "DocumentChunk" (id, "documentId", content, "pageNumber", "chunkIndex", embedding)
         VALUES ($1, $2, $3, $4, $5, $6::vector)`,
        `chunk_${documentId}_${i}`,
        documentId,
        chunk.content,
        chunk.pageNumber,
        i,
        `[${embedding.join(',')}]`,
      );

      if (i % 10 === 0 && i > 0) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    await this.prisma.document.update({
      where: { id: documentId },
      data: { status: 'ready', totalChunks: chunks.length },
    });

    console.log(`✅ Document processed: ${chunks.length} chunks embedded`);
  }

  private chunkText(text: string, chunkSize: number, overlap: number): { content: string; pageNumber: number }[] {
    const chunks: { content: string; pageNumber: number }[] = [];
    const sentences = text.split(/(?<=[.!?])\s+/);

    let currentChunk = '';
    let pageNumber = 1;

    for (const sentence of sentences) {
      if (sentence.includes('\f') || sentence.includes('\n\n\n')) {
        pageNumber++;
      }

      if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
        chunks.push({ content: currentChunk.trim(), pageNumber });

        const words = currentChunk.split(' ');
        const overlapWords = words.slice(-Math.floor(overlap / 5));
        currentChunk = overlapWords.join(' ') + ' ' + sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }

    if (currentChunk.trim().length > 50) {
      chunks.push({ content: currentChunk.trim(), pageNumber });
    }

    return chunks;
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000),
    });
    return response.data[0].embedding;
  }

  // ==================== SEMANTIC SEARCH ====================

  async searchChunks(userId: string, query: string, limit: number = 5, documentId?: string): Promise<any[]> {
    this.checkAiAvailable();

    const queryEmbedding = await this.generateEmbedding(query);
    const embeddingStr = `[${queryEmbedding.join(',')}]`;

    let results: any[];
    if (documentId) {
      results = await this.prisma.$queryRawUnsafe(
        `SELECT dc.id, dc.content, dc."pageNumber", dc."chunkIndex", dc."documentId",
                d."fileName", d.subject,
                1 - (dc.embedding <=> $1::vector) as similarity
         FROM "DocumentChunk" dc
         JOIN "Document" d ON dc."documentId" = d.id
         WHERE d."userId" = $2 AND d.id = $3 AND dc.embedding IS NOT NULL
         ORDER BY dc.embedding <=> $1::vector
         LIMIT $4`,
        embeddingStr, userId, documentId, limit,
      );
    } else {
      results = await this.prisma.$queryRawUnsafe(
        `SELECT dc.id, dc.content, dc."pageNumber", dc."chunkIndex", dc."documentId",
                d."fileName", d.subject,
                1 - (dc.embedding <=> $1::vector) as similarity
         FROM "DocumentChunk" dc
         JOIN "Document" d ON dc."documentId" = d.id
         WHERE d."userId" = $2 AND dc.embedding IS NOT NULL
         ORDER BY dc.embedding <=> $1::vector
         LIMIT $3`,
        embeddingStr, userId, limit,
      );
    }

    return results;
  }

  // ==================== QUIZ GENERATION ====================

  async generateQuiz(userId: string, options: {
    topic?: string;
    documentId?: string;
    numQuestions?: number;
    difficulty?: string;
  }) {
    this.checkAiAvailable();

    const { topic, documentId, numQuestions = 5, difficulty = 'medium' } = options;

    const query = topic || 'key concepts and important topics';
    const relevantChunks = await this.searchChunks(userId, query, 5, documentId);

    if (relevantChunks.length === 0) {
      throw new Error('No study materials found. Please upload some documents first.');
    }

    const context = relevantChunks
      .map((chunk: any, i: number) => `[Source: ${chunk.fileName}, Page ${chunk.pageNumber || 'N/A'}]\n${chunk.content}`)
      .join('\n\n---\n\n');

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a quiz generator for students. Generate exactly ${numQuestions} multiple-choice questions based STRICTLY on the provided study material. Each question should test understanding, not just memorization. Difficulty level: ${difficulty}.

You MUST respond with ONLY valid JSON in this exact format, no markdown, no backticks:
[
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Why this answer is correct, referencing the source material",
    "topic": "The specific topic this question covers"
  }
]`,
        },
        {
          role: 'user',
          content: `Generate ${numQuestions} ${difficulty} difficulty multiple-choice questions from this study material:\n\n${context}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = response.choices[0].message.content || '[]';
    let questions;
    try {
      const cleaned = content.replace(/```json|```/g, '').trim();
      questions = JSON.parse(cleaned);
    } catch {
      throw new Error('Failed to generate valid quiz questions. Please try again.');
    }

    const quizAttempt = await this.prisma.quizAttempt.create({
      data: {
        userId,
        documentId: documentId || null,
        topic: topic || null,
        questions: questions,
        totalQuestions: questions.length,
      },
    });

    return {
      quizId: quizAttempt.id,
      questions: questions.map((q: any, i: number) => ({
        index: i,
        question: q.question,
        options: q.options,
        topic: q.topic,
      })),
      totalQuestions: questions.length,
      sources: relevantChunks.map((c: any) => ({
        fileName: c.fileName,
        page: c.pageNumber,
        similarity: parseFloat(c.similarity).toFixed(3),
      })),
    };
  }

  // ==================== QUIZ SUBMISSION & SPACED REPETITION ====================

  async submitQuiz(userId: string, quizId: string, answers: number[]) {
    const quiz = await this.prisma.quizAttempt.findUnique({
      where: { id: quizId },
    });

    if (!quiz || quiz.userId !== userId) {
      throw new Error('Quiz not found');
    }

    const questions = quiz.questions as any[];
    let score = 0;
    const results: any[] = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const userAnswer = answers[i] ?? -1;
      const isCorrect = userAnswer === q.correctIndex;
      if (isCorrect) score++;

      results.push({
        question: q.question,
        userAnswer,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation,
        topic: q.topic,
      });

      if (q.topic) {
        await this.updateTopicMastery(userId, q.topic, isCorrect, quiz.documentId);
      }
    }

    await this.prisma.quizAttempt.update({
      where: { id: quizId },
      data: {
        answers: answers,
        score,
      },
    });

    return {
      score,
      totalQuestions: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      results,
    };
  }

  private async updateTopicMastery(userId: string, topic: string, isCorrect: boolean, documentId?: string | null) {
    let mastery = await this.prisma.topicMastery.findUnique({
      where: { userId_topic: { userId, topic } },
    });

    if (!mastery) {
      mastery = await this.prisma.topicMastery.create({
        data: { userId, topic },
      });
    }

    const quality = isCorrect ? 5 : 1;

    let newEaseFactor = mastery.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEaseFactor = Math.max(1.3, newEaseFactor);

    let newInterval: number;
    if (!isCorrect) {
      newInterval = 1;
    } else if (mastery.intervalDays === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(mastery.intervalDays * newEaseFactor);
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    await this.prisma.topicMastery.update({
      where: { userId_topic: { userId, topic } },
      data: {
        easeFactor: newEaseFactor,
        intervalDays: newInterval,
        nextReview,
        totalAttempts: mastery.totalAttempts + 1,
        correctCount: mastery.correctCount + (isCorrect ? 1 : 0),
        lastReviewed: new Date(),
      },
    });
  }

  // ==================== PROGRESS & ANALYTICS ====================

  async getProgress(userId: string) {
    const documents = await this.prisma.document.findMany({
      where: { userId },
      select: { id: true, fileName: true, subject: true, status: true, totalChunks: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const topicMasteries = await this.prisma.topicMastery.findMany({
      where: { userId },
      orderBy: { nextReview: 'asc' },
    });

    const quizHistory = await this.prisma.quizAttempt.findMany({
      where: { userId, score: { not: null } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        topic: true,
        score: true,
        totalQuestions: true,
        createdAt: true,
      },
    });

    const now = new Date();
    const dueForReview = topicMasteries.filter((t) => t.nextReview <= now);
    const upcoming = topicMasteries.filter((t) => t.nextReview > now).slice(0, 5);

    const totalQuizzes = await this.prisma.quizAttempt.count({
      where: { userId, score: { not: null } },
    });

    const avgScore = await this.prisma.quizAttempt.aggregate({
      where: { userId, score: { not: null } },
      _avg: { score: true },
    });

    const weakTopics = topicMasteries
      .filter((t) => t.totalAttempts >= 2 && (t.correctCount / t.totalAttempts) < 0.6)
      .map((t) => ({
        topic: t.topic,
        accuracy: Math.round((t.correctCount / t.totalAttempts) * 100),
        totalAttempts: t.totalAttempts,
      }));

    const strongTopics = topicMasteries
      .filter((t) => t.totalAttempts >= 2 && (t.correctCount / t.totalAttempts) >= 0.8)
      .map((t) => ({
        topic: t.topic,
        accuracy: Math.round((t.correctCount / t.totalAttempts) * 100),
        totalAttempts: t.totalAttempts,
      }));

    return {
      documents,
      totalDocuments: documents.length,
      totalQuizzes,
      averageScore: Math.round(avgScore._avg.score || 0),
      dueForReview: dueForReview.map((t) => ({ topic: t.topic, accuracy: t.totalAttempts > 0 ? Math.round((t.correctCount / t.totalAttempts) * 100) : 0 })),
      upcoming: upcoming.map((t) => ({ topic: t.topic, nextReview: t.nextReview })),
      weakTopics,
      strongTopics,
      recentQuizzes: quizHistory,
    };
  }

  async getDocuments(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        subject: true,
        status: true,
        totalChunks: true,
        createdAt: true,
      },
    });
  }
}