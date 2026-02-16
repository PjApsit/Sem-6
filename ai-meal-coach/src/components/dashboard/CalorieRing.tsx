import React from 'react';
import { ProgressRing } from '@/components/ui/progress-ring';
import { useUser } from '@/context/UserContext';
import { Flame } from 'lucide-react';

export const CalorieRing: React.FC = () => {
  const { dailyGoals, getTodaysNutrition } = useUser();
  const consumed = getTodaysNutrition();

  if (!dailyGoals) return null;

  const progress = Math.min((consumed.calories / dailyGoals.calories) * 100, 100);
  const remaining = Math.max(dailyGoals.calories - consumed.calories, 0);
  
  const color = progress > 100 ? 'destructive' : progress > 85 ? 'warning' : 'primary';

  return (
    <div className="glass-card p-6 flex flex-col items-center">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-accent" />
        <h3 className="font-display font-semibold text-foreground">Today's Calories</h3>
      </div>
      
      <ProgressRing
        progress={progress}
        size={160}
        strokeWidth={12}
        color={color}
        value={remaining.toString()}
        label="kcal left"
      />
      
      <div className="mt-4 flex items-center gap-6 text-sm">
        <div className="text-center">
          <p className="font-semibold text-foreground">{consumed.calories}</p>
          <p className="text-muted-foreground text-xs">Consumed</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="text-center">
          <p className="font-semibold text-foreground">{dailyGoals.calories}</p>
          <p className="text-muted-foreground text-xs">Goal</p>
        </div>
      </div>
    </div>
  );
};
