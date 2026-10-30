import React, { useState } from 'react';
import { X, CheckCircle, HelpCircle, ArrowRight, Award, AlertCircle } from 'lucide-react';
import { Lesson } from '../types';
import { gradeQuiz } from '../utils/ecoLogic';

interface LessonQuizModalProps {
  lesson: Lesson | null;
  onClose: () => void;
  onCompleteQuiz: (lesson: Lesson, score: number, pointsAwarded: number, answers?: number[]) => void;
}

export const LessonQuizModal: React.FC<LessonQuizModalProps> = ({
  lesson,
  onClose,
  onCompleteQuiz,
}) => {
  const [viewState, setViewState] = useState<'reading' | 'quiz' | 'result'>('reading');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizScoreResult, setQuizScoreResult] = useState<{
    score: number;
    passed: boolean;
    correctCount: number;
    total: number;
  } | null>(null);

  if (!lesson) return null;

  const handleSelectOption = (optionIdx: number) => {
    const updated = [...selectedAnswers];
    updated[currentQuestionIdx] = optionIdx;
    setSelectedAnswers(updated);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < lesson.quiz.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      // Evaluate quiz
      const res = gradeQuiz(selectedAnswers, lesson.quiz);
      setQuizScoreResult(res);
      setViewState('result');
      if (res.passed) {
        onCompleteQuiz(lesson, res.score, lesson.bonusPoints, selectedAnswers);
      }
    }
  };

  const resetQuiz = () => {
    setSelectedAnswers([]);
    setCurrentQuestionIdx(0);
    setViewState('quiz');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lesson-title"
    >
      <div className="bg-[#FFF9EC] border border-[#E3DCBA] rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EAE3CE] flex items-center justify-between bg-[#F8F2DF]">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#738262]">
              {lesson.category} • {lesson.readTimeMinutes} min read
            </span>
            <h2 id="lesson-title" className="text-base sm:text-lg font-bold text-[#243428]">
              {lesson.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-[#55644C] transition-colors cursor-pointer"
            aria-label="Close lesson modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-[#344437]">
          {viewState === 'reading' && (
            <>
              {/* Summary box */}
              <div className="p-3.5 rounded-2xl bg-[#F0F3DF] border border-[#DFE5CC] text-xs text-[#45553E] leading-relaxed">
                <span className="font-bold text-[#28382B] block mb-1">Executive Summary:</span>
                {lesson.summary}
              </div>

              {/* Key Takeaways */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#697A5E]">
                  Key Principles
                </h3>
                <ul className="space-y-1.5">
                  {lesson.keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#3E4F39] leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#879B68] mt-1.5 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Paragraphs */}
              <div className="space-y-3 pt-2">
                {lesson.content.map((para, i) => (
                  <p key={i} className="text-xs sm:text-sm text-[#4E5E48] leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </>
          )}

          {viewState === 'quiz' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-[#6D7D62]">
                <span>Question {currentQuestionIdx + 1} of {lesson.quiz.length}</span>
                <span>+{lesson.bonusPoints} pts reward</span>
              </div>

              {/* Question title */}
              <h3 className="text-sm sm:text-base font-bold text-[#243428] leading-snug">
                {lesson.quiz[currentQuestionIdx].question}
              </h3>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {lesson.quiz[currentQuestionIdx].options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQuestionIdx] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#879B68] text-white border-[#879B68] shadow-xs'
                          : 'bg-white/80 border-[#DFD9C5] text-[#344437] hover:bg-[#F3EDE0]'
                      }`}
                    >
                      <span className="font-medium">{opt}</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                        isSelected ? 'border-white bg-white text-[#879B68]' : 'border-[#C2BAA6]'
                      }`}>
                        {isSelected ? '✓' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {viewState === 'result' && quizScoreResult && (
            <div className="py-6 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#F0F3DF] border-4 border-[#879B68] flex items-center justify-center text-3xl">
                {quizScoreResult.passed ? '🎉' : '🌱'}
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#243428]">
                  {quizScoreResult.passed ? 'Quiz Mastered!' : 'Keep Learning!'}
                </h3>
                <p className="text-xs sm:text-sm text-[#55644C] mt-1">
                  You scored {quizScoreResult.correctCount} out of {quizScoreResult.total} ({quizScoreResult.score}%)
                </p>
              </div>

              {quizScoreResult.passed ? (
                <div className="p-3.5 rounded-2xl bg-[#D9E5C3] text-xs font-bold text-[#28382B] inline-flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#879B68]" />
                  <span>+{lesson.bonusPoints} Green Points Awarded to your profile!</span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-[#F0EBE0] text-xs text-[#55644C]">
                  Score at least 60% to earn green points. Review the key points and try again!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-[#EAE3CE] bg-[#F8F2DF] flex items-center justify-between gap-3">
          {viewState === 'reading' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#55644C] hover:text-[#28382B] cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => setViewState('quiz')}
                className="px-6 py-2.5 rounded-full bg-[#879B68] hover:bg-[#788C5A] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Take Quick Quiz (+{lesson.bonusPoints} pts)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {viewState === 'quiz' && (
            <>
              <button
                type="button"
                onClick={() => setViewState('reading')}
                className="px-4 py-2 text-xs font-semibold text-[#55644C] hover:text-[#28382B] cursor-pointer"
              >
                Back to Reading
              </button>
              <button
                type="button"
                disabled={selectedAnswers[currentQuestionIdx] === undefined}
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-full bg-[#879B68] hover:bg-[#788C5A] disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>
                  {currentQuestionIdx < lesson.quiz.length - 1 ? 'Next Question' : 'Submit Answers'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {viewState === 'result' && (
            <div className="w-full flex justify-end gap-2">
              {!quizScoreResult?.passed && (
                <button
                  type="button"
                  onClick={resetQuiz}
                  className="px-4 py-2 text-xs font-semibold text-[#55644C] hover:text-[#28382B] cursor-pointer"
                >
                  Retake Quiz
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-[#879B68] hover:bg-[#788C5A] text-white text-xs sm:text-sm font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
