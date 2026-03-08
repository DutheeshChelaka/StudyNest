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

export default function AiStudyCoachPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<Tab>('upload');

  // Upload state
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSubject, setUploadSubject] = useState('');

  // Quiz state
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [quizTopic, setQuizTopic] = useState('');
  const [quizDocId, setQuizDocId] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [quizId, setQuizId] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [results, setResults] = useState<any>(null);

  // Progress state
  const [progress, setProgress] = useState<any>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
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

  // Handle file upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await api.uploadStudyDocument(file, uploadSubject || undefined);
      setUploadSubject('');
      // Poll for processing status
      setTimeout(() => loadDocuments(), 2000);
      setTimeout(() => loadDocuments(), 5000);
      setTimeout(() => loadDocuments(), 10000);
      loadDocuments();
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  // Generate quiz
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
    } catch (err: any) {
      alert(err.message || 'Failed to generate quiz');
      setQuizState('idle');
    }
  };

  // Select answer
  const selectAnswer = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  // Submit quiz
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
    } catch (err: any) {
      alert(err.message || 'Failed to submit quiz');
      setQuizState('active');
    }
  };

  // Reset quiz
  const resetQuiz = () => {
    setQuizState('idle');
    setQuestions([]);
    setAnswers([]);
    setResults(null);
    setQuizId('');
    setCurrentQ(0);
  };

  const readyDocs = documents.filter((d) => d.status === 'ready');

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">AI Study Coach</h1>
          <p className="text-gray-400 mt-1">Upload your notes, generate quizzes, and track your mastery</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(['upload', 'quiz', 'progress'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'progress') loadProgress();
              }}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab === 'upload' && '📄 Documents'}
              {tab === 'quiz' && '🧠 Quiz'}
              {tab === 'progress' && '📊 Progress'}
            </button>
          ))}
        </div>

        {/* ==================== UPLOAD TAB ==================== */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Upload Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Upload Study Material</h2>
              <p className="text-gray-400 text-sm mb-4">
                Upload PDF or text files. The AI will process and index them for quiz generation.
              </p>

              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-gray-400 text-xs mb-1 block">Subject (optional)</label>
                  <input
                    type="text"
                    value={uploadSubject}
                    onChange={(e) => setUploadSubject(e.target.value)}
                    placeholder="e.g. Mathematics, ICT, Science"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <label className={`cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {uploading ? 'Uploading...' : '📎 Upload File'}
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
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Your Documents ({documents.length})</h2>

              {documents.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No documents uploaded yet. Upload your study notes to get started!</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{doc.fileName?.endsWith('.pdf') ? '📕' : '📄'}</span>
                        <div>
                          <p className="text-white text-sm font-medium">{doc.fileName}</p>
                          <p className="text-gray-500 text-xs">
                            {doc.subject && `${doc.subject} · `}
                            {doc.totalChunks} chunks · {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        doc.status === 'ready' ? 'bg-green-900/50 text-green-400' :
                        doc.status === 'processing' ? 'bg-yellow-900/50 text-yellow-400' :
                        'bg-red-900/50 text-red-400'
                      }`}>
                        {doc.status === 'ready' && '✅ Ready'}
                        {doc.status === 'processing' && '⏳ Processing'}
                        {doc.status === 'failed' && '❌ Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== QUIZ TAB ==================== */}
        {activeTab === 'quiz' && (
          <div className="space-y-6">
            {quizState === 'idle' && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Generate Quiz</h2>

                {readyDocs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-3">No documents ready for quizzing.</p>
                    <button onClick={() => setActiveTab('upload')} className="text-indigo-400 hover:text-indigo-300 text-sm">
                      → Upload study materials first
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Select Document</label>
                      <select
                        value={quizDocId}
                        onChange={(e) => setQuizDocId(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
                      >
                        <option value="">All documents</option>
                        {readyDocs.map((doc) => (
                          <option key={doc.id} value={doc.id}>{doc.fileName} {doc.subject ? `(${doc.subject})` : ''}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Topic (optional)</label>
                      <input
                        type="text"
                        value={quizTopic}
                        onChange={(e) => setQuizTopic(e.target.value)}
                        placeholder="e.g. Algebra, Networking, Data Types"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">Difficulty</label>
                        <select
                          value={quizDifficulty}
                          onChange={(e) => setQuizDifficulty(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">Questions</label>
                        <select
                          value={numQuestions}
                          onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
                        >
                          <option value={3}>3 questions</option>
                          <option value={5}>5 questions</option>
                          <option value={10}>10 questions</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleGenerateQuiz}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition"
                    >
                      🧠 Generate Quiz
                    </button>
                  </div>
                )}
              </div>
            )}

            {quizState === 'loading' && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-gray-400">AI is generating your quiz...</p>
                <p className="text-gray-600 text-xs mt-1">This may take 10-15 seconds</p>
              </div>
            )}

            {quizState === 'active' && questions.length > 0 && (
              <div className="space-y-4">
                {/* Progress bar */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Question {currentQ + 1} of {questions.length}</span>
                    <span>{answers.filter((a) => a !== -1).length}/{questions.length} answered</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-indigo-600 rounded-full h-2 transition-all"
                      style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Question Card */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  {questions[currentQ].topic && (
                    <span className="text-indigo-400 text-xs font-medium mb-2 block">{questions[currentQ].topic}</span>
                  )}
                  <h3 className="text-white text-lg font-medium mb-6">{questions[currentQ].question}</h3>

                  <div className="space-y-3">
                    {questions[currentQ].options.map((option, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => selectAnswer(currentQ, optIdx)}
                        className={`w-full text-left px-5 py-3.5 rounded-lg border transition text-sm ${
                          answers[currentQ] === optIdx
                            ? 'border-indigo-500 bg-indigo-600/20 text-white'
                            : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600 hover:bg-gray-750'
                        }`}
                      >
                        <span className="font-medium mr-3 text-gray-500">{String.fromCharCode(65 + optIdx)}.</span>
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
                    className="px-5 py-2.5 bg-gray-800 text-gray-300 rounded-lg text-sm disabled:opacity-30 hover:bg-gray-700 transition"
                  >
                    ← Previous
                  </button>

                  {currentQ < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQ(currentQ + 1)}
                      className="px-5 py-2.5 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={answers.some((a) => a === -1)}
                      className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition"
                    >
                      ✅ Submit Quiz
                    </button>
                  )}
                </div>
              </div>
            )}

            {quizState === 'submitted' && results && (
              <div className="space-y-6">
                {/* Score Card */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
                  <div className={`text-6xl font-bold mb-2 ${
                    results.percentage >= 80 ? 'text-green-400' :
                    results.percentage >= 50 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {results.percentage}%
                  </div>
                  <p className="text-gray-400">
                    You got {results.score} out of {results.totalQuestions} correct
                  </p>
                  <div className="flex gap-3 justify-center mt-6">
                    <button
                      onClick={resetQuiz}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition"
                    >
                      🔄 New Quiz
                    </button>
                    <button
                      onClick={() => { setActiveTab('progress'); loadProgress(); }}
                      className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition"
                    >
                      📊 View Progress
                    </button>
                  </div>
                </div>

                {/* Detailed Results */}
                <div className="space-y-3">
                  {results.results.map((r: QuizResult, i: number) => (
                    <div key={i} className={`bg-gray-900 border rounded-xl p-5 ${r.isCorrect ? 'border-green-800' : 'border-red-800'}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">{r.isCorrect ? '✅' : '❌'}</span>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium mb-2">{r.question}</p>
                          {!r.isCorrect && (
                            <p className="text-red-400 text-xs mb-1">
                              Your answer: {String.fromCharCode(65 + r.userAnswer)}
                            </p>
                          )}
                          <p className="text-green-400 text-xs mb-2">
                            Correct: {String.fromCharCode(65 + r.correctIndex)}
                          </p>
                          <p className="text-gray-400 text-xs">{r.explanation}</p>
                          {r.topic && (
                            <span className="inline-block mt-2 text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{r.topic}</span>
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

        {/* ==================== PROGRESS TAB ==================== */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            {loadingProgress ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              </div>
            ) : !progress ? (
              <div className="text-center py-12 text-gray-500">No progress data yet. Take a quiz to get started!</div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
                    <div className="text-3xl font-bold text-white">{progress.totalDocuments}</div>
                    <div className="text-gray-500 text-xs mt-1">Documents</div>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
                    <div className="text-3xl font-bold text-white">{progress.totalQuizzes}</div>
                    <div className="text-gray-500 text-xs mt-1">Quizzes Taken</div>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
                    <div className="text-3xl font-bold text-indigo-400">{progress.averageScore}%</div>
                    <div className="text-gray-500 text-xs mt-1">Avg Score</div>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
                    <div className="text-3xl font-bold text-yellow-400">{progress.dueForReview?.length || 0}</div>
                    <div className="text-gray-500 text-xs mt-1">Due for Review</div>
                  </div>
                </div>

                {/* Due for Review */}
                {progress.dueForReview?.length > 0 && (
                  <div className="bg-gray-900 border border-yellow-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-yellow-400 mb-3">⚠️ Topics Due for Review</h2>
                    <div className="flex flex-wrap gap-2">
                      {progress.dueForReview.map((t: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => {
                            setQuizTopic(t.topic);
                            setActiveTab('quiz');
                          }}
                          className="bg-yellow-900/30 border border-yellow-800 text-yellow-300 px-3 py-1.5 rounded-lg text-sm hover:bg-yellow-900/50 transition"
                        >
                          {t.topic} ({t.accuracy}%)
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weak Topics */}
                {progress.weakTopics?.length > 0 && (
                  <div className="bg-gray-900 border border-red-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-red-400 mb-3">🔴 Weak Topics (needs work)</h2>
                    <div className="space-y-2">
                      {progress.weakTopics.map((t: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2.5">
                          <span className="text-white text-sm">{t.topic}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-gray-700 rounded-full h-2">
                              <div className="bg-red-500 rounded-full h-2" style={{ width: `${t.accuracy}%` }}></div>
                            </div>
                            <span className="text-red-400 text-xs w-10 text-right">{t.accuracy}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strong Topics */}
                {progress.strongTopics?.length > 0 && (
                  <div className="bg-gray-900 border border-green-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-green-400 mb-3">🟢 Strong Topics</h2>
                    <div className="space-y-2">
                      {progress.strongTopics.map((t: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2.5">
                          <span className="text-white text-sm">{t.topic}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-gray-700 rounded-full h-2">
                              <div className="bg-green-500 rounded-full h-2" style={{ width: `${t.accuracy}%` }}></div>
                            </div>
                            <span className="text-green-400 text-xs w-10 text-right">{t.accuracy}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Quizzes */}
                {progress.recentQuizzes?.length > 0 && (
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-3">Recent Quizzes</h2>
                    <div className="space-y-2">
                      {progress.recentQuizzes.map((q: any) => (
                        <div key={q.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                          <div>
                            <p className="text-white text-sm">{q.topic || 'General'}</p>
                            <p className="text-gray-500 text-xs">{new Date(q.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`text-sm font-bold ${
                            (q.score / q.totalQuestions) >= 0.8 ? 'text-green-400' :
                            (q.score / q.totalQuestions) >= 0.5 ? 'text-yellow-400' :
                            'text-red-400'
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