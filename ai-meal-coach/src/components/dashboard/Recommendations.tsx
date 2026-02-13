import React, { useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { generateRecommendations } from '@/services/mockApi';
import { Lightbulb, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const priorityConfig = {
  high: {
    icon: AlertTriangle,
    bgColor: 'bg-destructive/10',
    textColor: 'text-destructive',
    borderColor: 'border-destructive/20',
  },
  medium: {
    icon: Lightbulb,
    bgColor: 'bg-warning/10',
    textColor: 'text-warning',
    borderColor: 'border-warning/20',
  },
  low: {
    icon: CheckCircle,
    bgColor: 'bg-success/10',
    textColor: 'text-success',
    borderColor: 'border-success/20',
  },
};

export const Recommendations: React.FC = () => {
  const { user, dailyGoals, getTodaysNutrition } = useUser();
  
  const recommendations = useMemo(() => {
    if (!user || !dailyGoals) return [];
    const consumed = getTodaysNutrition();
    return generateRecommendations(consumed, dailyGoals, user);
  }, [user, dailyGoals, getTodaysNutrition]);

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        Smart Recommendations
      </h3>
      
      <div className="space-y-2">
        {recommendations.map((rec, index) => {
          const config = priorityConfig[rec.priority];
          const Icon = config.icon;
          
          return (
            <div
              key={index}
              className={cn(
                'glass-card p-4 border animate-fade-in',
                config.borderColor
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex gap-3">
                <div className={cn('p-2 rounded-lg shrink-0', config.bgColor)}>
                  <Icon className={cn('w-4 h-4', config.textColor)} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground leading-relaxed">
                    {rec.message}
                  </p>
                  
                  {rec.suggestedFoods && rec.suggestedFoods.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {rec.suggestedFoods.map((food) => (
                        <span
                          key={food.id}
                          className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full"
                        >
                          {food.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
