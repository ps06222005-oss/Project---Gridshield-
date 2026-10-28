import React, { useState } from 'react';
import { CheckCircle2, Zap, Droplets, Trash2, Utensils, Bike, Sparkles, Filter, Check } from 'lucide-react';
import { Task, TaskCategory, UserState } from '../types';

interface TasksScreenProps {
  tasks: Task[];
  userState: UserState;
  onOpenTask: (task: Task) => void;
  onQuickCompleteTask: (task: Task) => void;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({
  tasks,
  userState,
  onOpenTask,
  onQuickCompleteTask,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterTab, setFilterTab] = useState<'todo' | 'completed'>('todo');

  const categories = [
    { id: 'all', label: 'All Quests' },
    { id: 'energy', label: '⚡ Energy' },
    { id: 'water', label: '💧 Water' },
    { id: 'waste', label: '♻️ Waste' },
    { id: 'food', label: '🥗 Food' },
    { id: 'commute', label: '🚲 Commute' },
    { id: 'habits', label: '🌱 Habits' },
  ];

  const filteredTasks = tasks.filter((t) => {
    const isCompleted = userState.completedTaskIds.includes(t.id);
    if (filterTab === 'todo' && isCompleted) return false;
    if (filterTab === 'completed' && !isCompleted) return false;

    if (selectedCategory !== 'all' && t.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const completedCount = tasks.filter(t => userState.completedTaskIds.includes(t.id)).length;
  const todoCount = tasks.length - completedCount;

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-lg mx-auto space-y-4 text-[#344437]">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#243428]">
          Eco Habit Quests
        </h1>
        <p className="text-xs text-[#5D6E54] mt-0.5">
          Take small, repeatable actions to reinforce the local power and resource grid.
        </p>
      </div>

      {/* Tabs: To-Do vs Completed */}
      <div className="flex p-1 bg-[#F0ECE0] rounded-2xl border border-[#DFD8C4]">
        <button
          type="button"
          onClick={() => setFilterTab('todo')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            filterTab === 'todo'
              ? 'bg-white text-[#243428] shadow-xs'
              : 'text-[#63725A] hover:text-[#243428]'
          }`}
        >
          To Do ({todoCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('completed')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            filterTab === 'completed'
              ? 'bg-white text-[#243428] shadow-xs'
              : 'text-[#63725A] hover:text-[#243428]'
          }`}
        >
          Completed Today ({completedCount})
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-[#879B68] text-white shadow-2xs'
                : 'bg-white border border-[#EBE4D2] text-[#55644C] hover:bg-[#F2ECE0]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center p-6 bg-white/70 rounded-3xl border border-[#EBE4D2] space-y-2">
            <span className="text-3xl block">🌿</span>
            <h3 className="text-sm font-bold text-[#243428]">
              {filterTab === 'completed'
                ? 'No habits logged yet today'
                : 'All habits in this category completed!'}
            </h3>
            <p className="text-xs text-[#6B7962] max-w-xs mx-auto">
              {filterTab === 'completed'
                ? 'Complete quests from your To-Do list to build your green streak.'
                : 'Check another category or review your completed accomplishments.'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = userState.completedTaskIds.includes(task.id);
            return (
              <div
                key={task.id}
                className={`p-4 rounded-3xl border transition-all flex items-start justify-between gap-3 ${
                  isCompleted
                    ? 'bg-[#F4EFE2]/60 border-[#E8E2D2]'
                    : 'bg-white border-[#EBE4D2] hover:border-[#CBD6B7] shadow-2xs'
                }`}
              >
                <div
                  onClick={() => onOpenTask(task)}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#F0F3DF] text-[#55644C]">
                      {task.category}
                    </span>
                    <span className="text-[10px] font-semibold text-[#798870]">
                      {task.difficulty} • ~{task.durationMinutes} min
                    </span>
                  </div>

                  <h3 className={`text-sm font-bold ${isCompleted ? 'line-through text-[#798871]' : 'text-[#243428]'}`}>
                    {task.title}
                  </h3>

                  <p className="text-xs text-[#5C6D54] mt-1 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold">
                    <span className="text-[#879B68] bg-[#F0F3DF] px-2 py-0.5 rounded-full">
                      +{task.points} pts
                    </span>
                    <span className="text-[#67775F]">{task.impactLabel}</span>
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  {isCompleted ? (
                    <div className="p-2.5 rounded-full bg-[#D9E5C3] text-[#344437]">
                      <Check className="w-4 h-4 text-[#879B68] stroke-[3]" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onQuickCompleteTask(task)}
                      className="p-2.5 rounded-full bg-[#F0F3DF] hover:bg-[#879B68] text-[#55644C] hover:text-white transition-colors cursor-pointer shadow-2xs"
                      aria-label={`Complete ${task.title}`}
                    >
                      <CheckCircle2 className="w-5 h-5 stroke-[2]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
