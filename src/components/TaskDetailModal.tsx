import React, { useState } from 'react';
import { X, CheckCircle2, Zap, Droplets, Trash2, Utensils, Bike, Sparkles, AlertCircle } from 'lucide-react';
import { Task } from '../types';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onComplete: (task: Task, note: string) => void;
  isCompleted: boolean;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onComplete,
  isCompleted,
}) => {
  const [note, setNote] = useState('');
  const [checkedSteps, setCheckedSteps] = useState<{ [index: number]: boolean }>({});

  if (!task) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'energy': return <Zap className="w-4 h-4 text-[#879B68]" />;
      case 'water': return <Droplets className="w-4 h-4 text-[#668DA0]" />;
      case 'waste': return <Trash2 className="w-4 h-4 text-[#7A8B60]" />;
      case 'food': return <Utensils className="w-4 h-4 text-[#C48C46]" />;
      case 'commute': return <Bike className="w-4 h-4 text-[#5D8268]" />;
      default: return <Sparkles className="w-4 h-4 text-[#879B68]" />;
    }
  };

  const toggleStep = (idx: number) => {
    setCheckedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
    >
      <div className="bg-[#FFF9EC] border border-[#E3DCBA] rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 pb-3 border-b border-[#EAE3CE] flex items-center justify-between bg-[#F8F2DF]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/80 shadow-xs">
              {getCategoryIcon(task.category)}
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#738262] block">
                {task.category} • {task.difficulty}
              </span>
              <span className="text-xs font-semibold text-[#344437]">{task.impactLabel}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-[#55644C] transition-colors cursor-pointer"
            aria-label="Close task details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-[#344437]">
          {/* Title & Reward Tag */}
          <div className="flex items-start justify-between gap-3">
            <h2 id="task-detail-title" className="text-xl font-bold text-[#243428] leading-snug">
              {task.title}
            </h2>
            <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#879B68] text-white text-xs font-bold shadow-xs">
              +{task.points} pts
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-[#4E5E48] leading-relaxed">
            {task.description}
          </p>

          {/* Why It Matters Callout */}
          <div className="p-3.5 rounded-2xl bg-[#F0F3DF] border border-[#DFE5CC] text-xs space-y-1.5">
            <div className="font-bold text-[#32452F] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#879B68]" />
              Why It Matters
            </div>
            <p className="text-[#55644C] leading-relaxed">
              {task.whyItMatters}
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-[#28382B]">
              {task.co2SavedKg > 0 && <span>🌿 Avoids {task.co2SavedKg}kg CO₂e</span>}
              {task.energySavedKwh > 0 && <span>⚡ Saves {task.energySavedKwh}kWh</span>}
              {task.waterSavedL > 0 && <span>💧 Conserves {task.waterSavedL}L</span>}
            </div>
          </div>

          {/* Action Checklist */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#697A5E] mb-2">
              Action Steps
            </h3>
            <ul className="space-y-2">
              {task.actionSteps.map((step, idx) => {
                const isChecked = !!checkedSteps[idx];
                return (
                  <li
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-[#F2ECE0] transition-colors cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleStep(idx)}
                      className="mt-0.5 rounded border-[#C4D0B5] text-[#879B68] focus:ring-[#879B68] cursor-pointer"
                      aria-label={`Step ${idx + 1}: ${step}`}
                    />
                    <span className={`leading-relaxed ${isChecked ? 'line-through text-[#82907A]' : 'text-[#344437]'}`}>
                      {step}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Self-reported note input */}
          {!isCompleted && (
            <div className="space-y-1.5">
              <label htmlFor="task-note-input" className="text-xs font-bold text-[#55644C]">
                Verification Note (Optional)
              </label>
              <input
                id="task-note-input"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Switched off power strip in the bedroom"
                className="w-full px-3.5 py-2.5 text-xs bg-white rounded-xl border border-[#D9D3BF] focus:outline-hidden focus:border-[#879B68] focus:ring-1 focus:ring-[#879B68]"
              />
              <p className="text-[10px] text-[#8A967F] flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-[#879B68]" />
                Self-reported habit verification on the honor system.
              </p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-4 border-t border-[#EAE3CE] bg-[#F8F2DF] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#55644C] hover:text-[#28382B] cursor-pointer"
          >
            Cancel
          </button>
          {isCompleted ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D9E5C3] text-[#344437] text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#879B68]" />
              Completed Today (+{task.points} pts)
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onComplete(task, note)}
              className="px-6 py-2.5 rounded-full bg-[#879B68] hover:bg-[#788C5A] active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-[0_4px_12px_rgba(135,155,104,0.35)] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Completed (+{task.points} pts)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
