'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Navbar from '@/components/layout/Navbar';

type Tab = 'upload' | 'quiz' | 'progress';
type QuizState = 'idle' | 'loading' | 'active' | 'submitted';

interface QuizQuestion {
  index: number;
  question: string;
  options: string[];
  topic: string;
}

interface QuizResult {
  question: string;
  userAnswer: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
  topic: string;
}

function IconUpload() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );
}

function IconBrain() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function IconFile() {
  return (
    <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconX() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconArrowLeft() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200";
const selectClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 appearance-none pr-9";

export default function AiStudyCoachPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<Tab>('upload');

  const [documents, setDocuments] = useState<Record<string, unknown>[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSubject, setUploadSubject] = useState('');

  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [quizTopic, setQuizTopic] = useState('');
  const [quizDocId, setQuizDocId] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [quizId, setQuizId] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [results, setResults] = useState<Record<string, unknown> | null>(null);

  const [progress, setProgress] = useState<Record<string, unknown> | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/'); return; }
    loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    try {
      const docs = await api.getStudyDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const loadProgress = async () => {
    setLoadingProgress(true);
    try {
      const data = await api.getStudyProgress();
      setProgress(data);
    } catch (err) {
      console.error('Failed to load progress:', err);
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.uploadStudyDocument(file, uploadSubject || undefined);
      setUploadSubject('');
      setTimeout(() => loadDocuments(), 2000);
      setTimeout(() => loadDocuments(), 5000);
      setTimeout(() => loadDocuments(), 10000);
      loadDocuments();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleGenerateQuiz = async () => {
    setQuizState('loading');
    try {
      const data = await api.generateQuiz({
        topic: quizTopic || undefined,
        documentId: quizDocId || undefined,
        numQuestions,
        difficulty: quizDifficulty,
      });
      setQuizId(data.quizId);
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(-1));
      setCurrentQ(0);
      setResults(null);
      setQuizState('active');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to generate quiz');
      setQuizState('idle');
    }
  };

  const selectAnswer = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmitQuiz = async () => {
    if (answers.some((a) => a === -1)) {
      alert('Please answer all questions before submitting');
      return;
    }
    setQuizState('loading');
    try {
      const data = await api.submitQuiz(quizId, answers);
      setResults(data);
      setQuizState('submitted');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to submit quiz');
      setQuizState('active');
    }
  };

  const resetQuiz = () => {
    setQuizState('idle');
    setQuestions([]);
    setAnswers([]);
    setResults(null);
    setQuizId('');
    setCurrentQ(0);
  };

  const readyDocs = documents.filter((d) => d.status === 'ready');

  const tabs = [
    { key: 'upload' as Tab, label: 'Documents', Icon: IconUpload },
    { key: 'quiz' as Tab, label: 'Quiz', Icon: IconBrain },
    { key: 'progress' as Tab, label: 'Progress', Icon: IconChart },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Study Coach</h1>
          <p className="text-gray-400 mt-1">Upload your notes, generate quizzes, and track your mastery.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 w-fit mb-8">
          {tabs.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key);
                if (key === 'progress') loadProgress();
              }}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === key
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Icon />
              {label}
            </button>
          ))}
        </div>

        {/* ── UPLOAD TAB ── */}
        {activeTab === 'upload' && (
          <div className="space-y-5">

            {/* Upload Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-1">Upload Study Material</h2>
              <p className="text-gray-400 text-sm mb-5">Upload PDF or text files. The AI will index them for quiz generation.</p>

              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Subject (optional)</label>
                  <input
                    type="text"
                    value={uploadSubject}
                    onChange={(e) => setUploadSubject(e.target.value)}
                    placeholder="e.g. Mathematics, ICT, Science"
                    className={inputClass}
                  />
                </div>
                <label className={`inline-flex items-center gap-2 cursor-pointer bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <IconUpload />
                  {uploading ? 'Uploading...' : 'Upload File'}
                  <input
                    type="file"
                    onChange={handleUpload}
                    accept=".pdf,.txt,.md"
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {/* Documents List */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-5">
                Your Documents
                <span className="ml-2 text-sm font-normal text-gray-400">({documents.length})</span>
              </h2>

              {documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <IconFile />
                  </div>
                  <p className="text-gray-500 font-medium text-sm">No documents yet</p>
                  <p className="text-gray-400 text-xs mt-1">Upload your study notes to get started.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id as string} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <IconFile />
                        </div>
                        <div>
                          <p className="text-gray-900 text-sm font-semibold">{doc.fileName as string}</p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {doc.subject ? `${doc.subject as string} · ` : ''}
                            {doc.totalChunks as number} chunks · {new Date(doc.createdAt as string).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold flex-shrink-0 ${
                        doc.status === 'ready'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : doc.status === 'processing'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}>
                        {doc.status === 'ready' && 'Ready'}
                        {doc.status === 'processing' && 'Processing...'}
                        {doc.status === 'failed' && 'Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── QUIZ TAB ── */}
        {activeTab === 'quiz' && (
          <div className="space-y-5">

            {quizState === 'idle' && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 mb-5">Generate Quiz</h2>

                {readyDocs.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <IconBrain />
                    </div>
                    <p className="text-gray-500 font-medium text-sm mb-2">No documents ready</p>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="text-violet-600 hover:text-violet-700 text-sm font-semibold"
                    >
                      Upload study materials first
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Select Document</label>
                      <div className="relative">
                        <select value={quizDocId} onChange={(e) => setQuizDocId(e.target.value)} className={selectClass}>
                          <option value="">All documents</option>
                          {readyDocs.map((doc) => (
                            <option key={doc.id as string} value={doc.id as string}>
                              {doc.fileName as string}{doc.subject ? ` (${doc.subject as string})` : ''}
                            </option>
                          ))}
                        </select>
                        <IconChevron />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Topic (optional)</label>
                      <input
                        type="text"
                        value={quizTopic}
                        onChange={(e) => setQuizTopic(e.target.value)}
                        placeholder="e.g. Algebra, Networking, Data Types"
                        className={inputClass}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Difficulty</label>
                        <div className="relative">
                          <select value={quizDifficulty} onChange={(e) => setQuizDifficulty(e.target.value)} className={selectClass}>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                          <IconChevron />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Questions</label>
                        <div className="relative">
                          <select value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value))} className={selectClass}>
                            <option value={3}>3 questions</option>
                            <option value={5}>5 questions</option>
                            <option value={10}>10 questions</option>
                          </select>
                          <IconChevron />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleGenerateQuiz}
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-violet-200 active:scale-[0.98]"
                    >
                      Generate Quiz
                    </button>
                  </div>
                )}
              </div>
            )}

            {quizState === 'loading' && (
              <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
                <div className="w-12 h-12 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-700 font-semibold">Generating your quiz...</p>
                <p className="text-gray-400 text-xs mt-1">This may take 10–15 seconds</p>
              </div>
            )}

            {quizState === 'active' && questions.length > 0 && (
              <div className="space-y-4">

                {/* Progress */}
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span className="font-semibold text-gray-600">Question {currentQ + 1} of {questions.length}</span>
                    <span>{answers.filter((a) => a !== -1).length}/{questions.length} answered</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-violet-600 rounded-full h-2 transition-all duration-300"
                      style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  {questions[currentQ].topic && (
                    <span className="inline-block text-xs font-semibold text-violet-600 bg-violet-50 px-3 py-1 rounded-full mb-4">
                      {questions[currentQ].topic}
                    </span>
                  )}
                  <h3 className="text-gray-900 text-base font-bold mb-6 leading-relaxed">
                    {questions[currentQ].question}
                  </h3>

                  <div className="space-y-2.5">
                    {questions[currentQ].options.map((option, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => selectAnswer(currentQ, optIdx)}
                        className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all duration-150 ${
                          answers[currentQ] === optIdx
                            ? 'border-violet-500 bg-violet-50 text-violet-800'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-violet-300 hover:bg-violet-50/50'
                        }`}
                      >
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold mr-3 ${
                          answers[currentQ] === optIdx ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between gap-3">
                  <button
                    onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                    disabled={currentQ === 0}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold disabled:opacity-30 hover:bg-gray-50 transition-all duration-150"
                  >
                    <IconArrowLeft />
                    Previous
                  </button>

                  {currentQ < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQ(currentQ + 1)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all duration-150"
                    >
                      Next
                      <IconArrowRight />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={answers.some((a) => a === -1)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all duration-150 active:scale-95"
                    >
                      <IconCheck />
                      Submit Quiz
                    </button>
                  )}
                </div>
              </div>
            )}

            {quizState === 'submitted' && results && (
              <div className="space-y-5">

                {/* Score */}
                <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
                  <div className={`text-7xl font-extrabold mb-2 tracking-tight ${
                    (results.percentage as number) >= 80 ? 'text-emerald-500' :
                    (results.percentage as number) >= 50 ? 'text-amber-500' : 'text-rose-500'
                  }`}>
                    {results.percentage as number}%
                  </div>
                  <p className="text-gray-500 text-sm">
                    You got <span className="font-bold text-gray-900">{results.score as number}</span> out of <span className="font-bold text-gray-900">{results.totalQuestions as number}</span> correct
                  </p>
                  <div className="flex gap-3 justify-center mt-8">
                    <button
                      onClick={resetQuiz}
                      className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold transition-all duration-200 active:scale-95"
                    >
                      New Quiz
                    </button>
                    <button
                      onClick={() => { setActiveTab('progress'); loadProgress(); }}
                      className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-all duration-200"
                    >
                      View Progress
                    </button>
                  </div>
                </div>

                {/* Detailed Results */}
                <div className="space-y-3">
                  {(results.results as QuizResult[]).map((r, i) => (
                    <div
                      key={i}
                      className={`bg-white border rounded-2xl p-5 shadow-sm ${
                        r.isCorrect ? 'border-emerald-200' : 'border-rose-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          r.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                        }`}>
                          {r.isCorrect ? <IconCheck /> : <IconX />}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 text-sm font-semibold mb-2">{r.question}</p>
                          {!r.isCorrect && (
                            <p className="text-rose-500 text-xs mb-1">
                              Your answer: <span className="font-bold">{String.fromCharCode(65 + r.userAnswer)}</span>
                            </p>
                          )}
                          <p className="text-emerald-600 text-xs mb-2 font-medium">
                            Correct: <span className="font-bold">{String.fromCharCode(65 + r.correctIndex)}</span>
                          </p>
                          <p className="text-gray-400 text-xs leading-relaxed">{r.explanation}</p>
                          {r.topic && (
                            <span className="inline-block mt-2 text-xs bg-violet-50 text-violet-600 border border-violet-100 px-2.5 py-0.5 rounded-full font-medium">
                              {r.topic}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PROGRESS TAB ── */}
        {activeTab === 'progress' && (
          <div className="space-y-5">
            {loadingProgress ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              </div>
            ) : !progress ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <IconChart />
                </div>
                <p className="text-gray-500 font-medium text-sm">No progress data yet</p>
                <p className="text-gray-400 text-xs mt-1">Take a quiz to start tracking your mastery.</p>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { value: progress.totalDocuments as number, label: 'Documents', color: 'text-gray-900' },
                    { value: progress.totalQuizzes as number, label: 'Quizzes Taken', color: 'text-gray-900' },
                    { value: `${progress.averageScore as number}%`, label: 'Avg Score', color: 'text-violet-600' },
                    { value: (progress.dueForReview as unknown[])?.length || 0, label: 'Due for Review', color: 'text-amber-500' },
                  ].map((s) => (
                    <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm">
                      <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
                      <div className="text-gray-400 text-xs mt-1 font-medium">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Due for Review */}
                {(progress.dueForReview as unknown[])?.length > 0 && (
                  <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-4">Due for Review</h2>
                    <div className="flex flex-wrap gap-2">
                      {(progress.dueForReview as { topic: string; accuracy: number }[]).map((t, i) => (
                        <button
                          key={i}
                          onClick={() => { setQuizTopic(t.topic); setActiveTab('quiz'); }}
                          className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-xl text-sm font-semibold hover:bg-amber-100 transition-all duration-150"
                        >
                          {t.topic} — {t.accuracy}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weak Topics */}
                {(progress.weakTopics as unknown[])?.length > 0 && (
                  <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-rose-500 uppercase tracking-widest mb-4">Needs Work</h2>
                    <div className="space-y-2.5">
                      {(progress.weakTopics as { topic: string; accuracy: number }[]).map((t, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-gray-700 text-sm font-medium">{t.topic}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-28 bg-gray-100 rounded-full h-2">
                              <div className="bg-rose-400 rounded-full h-2 transition-all" style={{ width: `${t.accuracy}%` }} />
                            </div>
                            <span className="text-rose-500 text-xs font-bold w-10 text-right">{t.accuracy}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strong Topics */}
                {(progress.strongTopics as unknown[])?.length > 0 && (
                  <div className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4">Strong Topics</h2>
                    <div className="space-y-2.5">
                      {(progress.strongTopics as { topic: string; accuracy: number }[]).map((t, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-gray-700 text-sm font-medium">{t.topic}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-28 bg-gray-100 rounded-full h-2">
                              <div className="bg-emerald-400 rounded-full h-2 transition-all" style={{ width: `${t.accuracy}%` }} />
                            </div>
                            <span className="text-emerald-600 text-xs font-bold w-10 text-right">{t.accuracy}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Quizzes */}
                {(progress.recentQuizzes as unknown[])?.length > 0 && (
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Recent Quizzes</h2>
                    <div className="space-y-2">
                      {(progress.recentQuizzes as { id: string; topic: string; createdAt: string; score: number; totalQuestions: number }[]).map((q) => (
                        <div key={q.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                          <div>
                            <p className="text-gray-900 text-sm font-semibold">{q.topic || 'General'}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{new Date(q.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`text-sm font-extrabold ${
                            (q.score / q.totalQuestions) >= 0.8 ? 'text-emerald-500' :
                            (q.score / q.totalQuestions) >= 0.5 ? 'text-amber-500' : 'text-rose-500'
                          }`}>
                            {q.score}/{q.totalQuestions}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}