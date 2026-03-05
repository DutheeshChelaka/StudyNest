import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  // POST /ai/upload — Upload a study document for RAG processing
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
      fileFilter: (req, file, callback) => {
        const allowed = [
          'application/pdf',
          'text/plain',
          'text/markdown',
        ];
        if (allowed.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('Only PDF and text files are accepted'), false);
        }
      },
    }),
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
    @Body('subject') subject?: string,
  ) {
    if (!file) {
      return { error: 'No file uploaded' };
    }
    return this.aiService.uploadDocument(req.user.id, file, subject);
  }

  // GET /ai/documents — List user's uploaded documents
  @Get('documents')
  async getDocuments(@Req() req: any) {
    return this.aiService.getDocuments(req.user.id);
  }

  // POST /ai/quiz — Generate a quiz from knowledge base
  @Post('quiz')
  async generateQuiz(
    @Req() req: any,
    @Body() body: { topic?: string; documentId?: string; numQuestions?: number; difficulty?: string },
  ) {
    return this.aiService.generateQuiz(req.user.id, body);
  }

  // POST /ai/quiz/submit — Submit quiz answers
  @Post('quiz/submit')
  async submitQuiz(
    @Req() req: any,
    @Body() body: { quizId: string; answers: number[] },
  ) {
    return this.aiService.submitQuiz(req.user.id, body.quizId, body.answers);
  }

  // GET /ai/progress — Get study progress and spaced repetition data
  @Get('progress')
  async getProgress(@Req() req: any) {
    return this.aiService.getProgress(req.user.id);
  }
}