import React from 'react';
import { BookOpen, CheckCircle, Clock, Award, ArrowRight } from 'lucide-react';
import { Lesson, UserState } from '../types';

interface LearnScreenProps {
  lessons: Lesson[];
  userState: UserState;
  onOpenLesson: (lesson: Lesson) => void;
}

export const LearnScreen: React.FC<LearnScreenProps> = ({
  lessons,
  userState,
  onOpenLesson,
}) => {
  const completedCount = lessons.filter(l => userState.completedLessonIds.includes(l.id)).length;

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-lg mx-auto space-y-4 text-[#344437]">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#F0F3DF] border border-[#DFE5CC] shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#68795A] block">
            Grid & Eco Literacy
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#243428] mt-0.5">
            Micro Learning
          </h1>
          <p className="text-xs text-[#55644C] mt-1">
            Read 3-minute guides and test your knowledge to earn green bonus points.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/80 border border-[#D5DEBF] flex items-center justify-center text-2xl shadow-xs shrink-0">
          📚
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-bold text-[#6D7D64] px-1">
        <span>Available Modules</span>
        <span>{completedCount} of {lessons.length} Completed</span>
      </div>

      {/* Lessons List */}
      <div className="space-y-3">
        {lessons.map((lesson) => {
          const isDone = userState.completedLessonIds.includes(lesson.id);
          return (
            <div
              key={lesson.id}
              onClick={() => onOpenLesson(lesson)}
              className="p-4 rounded-3xl bg-white border border-[#EBE4D2] hover:border-[#CCD8B8] shadow-2xs transition-all space-y-3 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#F0F3DF] text-[#55644C]">
                      {lesson.category}
                    </span>
                    <span className="text-[10px] text-[#7A8A72] flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" />
                      {lesson.readTimeMinutes} min read
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[#243428]">
                    {lesson.title}
                  </h3>
                </div>

                <div className="shrink-0 px-2.5 py-1 rounded-full bg-[#D9E5C3] text-[#28382B] text-xs font-bold">
                  +{lesson.bonusPoints} pts
                </div>
              </div>

              <p className="text-xs text-[#52634A] leading-relaxed line-clamp-2">
                {lesson.summary}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-[#F5EFE0]">
                {isDone ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#879B68]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Quiz Mastered
                  </span>
                ) : (
                  <span className="text-xs font-medium text-[#7A8A72]">
                    3 questions quiz included
                  </span>
                )}

                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#879B68]">
                  <span>{isDone ? 'Review' : 'Start Lesson'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
