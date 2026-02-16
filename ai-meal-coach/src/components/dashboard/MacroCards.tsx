import React from 'react';
import { useUser } from '@/context/UserContext';
import { cn } from '@/lib/utils';

interface MacroCardProps {
  label: string;
  consumed: number;
  goal: number;
  unit: string;
  color: string;
  bgColor: string;
}

const MacroCard: React.FC<MacroCardProps> = ({ label, consumed, goal, unit, color, bgColor }) => {
  const progress = Math.min((consumed / goal) * 100, 100);
  
  return (
    <div className="glass-card p-4 flex-1 min-w-[80px]">
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      <p className="text-lg font-bold text-foreground">
        {Math.round(consumed)}<span className="text-xs font-normal text-muted-foreground">{unit}</span>
      </p>
      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', bgColor)}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">of {goal}{unit}</p>
    </div>
  );
};

export const MacroCards: React.FC = () => {
  const { dailyGoals, getTodaysNutrition } = useUser();
  const consumed = getTodaysNutrition();

  if (!dailyGoals) return null;

  const macros = [
    { 
      label: 'Protein', 
      consumed: consumed.protein, 
      goal: dailyGoals.protein, 
      unit: 'g',
      color: 'text-primary',
      bgColor: 'bg-primary'
    },
    { 
      label: 'Carbs', 
      consumed: consumed.carbohydrates, 
      goal: dailyGoals.carbohydrates, 
      unit: 'g',
      color: 'text-accent',
      bgColor: 'bg-accent'
    },
    { 
      label: 'Fat', 
      consumed: consumed.fat, 
      goal: dailyGoals.fat, 
      unit: 'g',
      color: 'text-warning',
      bgColor: 'bg-warning'
    },
    { 
      label: 'Fiber', 
      consumed: consumed.fiber, 
      goal: dailyGoals.fiber, 
      unit: 'g',
      color: 'text-success',
      bgColor: 'bg-success'
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {macros.map((macro) => (
        <MacroCard key={macro.label} {...macro} />
      ))}
    </div>
  );
};
