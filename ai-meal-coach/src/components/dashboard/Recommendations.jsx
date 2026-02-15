import React, { useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { generateRecommendations, indianFoodDatabase } from '@/services/mockApi';
import { Lightbulb, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const priorityConfig = {
  high: { icon: AlertTriangle, bgColor: 'bg-destructive/10', textColor: 'text-destructive', borderColor: 'border-destructive/20' },
  medium: { icon: Lightbulb, bgColor: 'bg-warning/10', textColor: 'text-warning', borderColor: 'border-warning/20' },
  low: { icon: CheckCircle, bgColor: 'bg-success/10', textColor: 'text-success', borderColor: 'border-success/20' },
};

// Food suggestions by nutrition type
const foodSuggestionsByType = {
  protein: [
    { id: 'chicken', name: 'Chicken Breast' },
    { id: 'eggs', name: 'Eggs' },
    { id: 'dal', name: 'Dal' },
    { id: 'paneer', name: 'Paneer' },
  ],
  carbs: [
    { id: 'rice', name: 'Brown Rice' },
    { id: 'roti', name: 'Roti' },
    { id: 'oats', name: 'Oats' },
    { id: 'sweet_potato', name: 'Sweet Potato' },
  ],
  fat: [
    { id: 'nuts', name: 'Almonds' },
    { id: 'olive_oil', name: 'Olive Oil' },
    { id: 'avocado', name: 'Avocado' },
    { id: 'coconut', name: 'Coconut Oil' },
  ],
  calories: [
    { id: 'nuts', name: 'Almonds' },
    { id: 'banana', name: 'Banana' },
    { id: 'cheese', name: 'Cheese' },
    { id: 'whole_milk', name: 'Whole Milk' },
  ],
};

export const Recommendations = () => {
  const { user, dailyGoals, getTodaysNutrition } = useUser();
  
  const recommendations = useMemo(() => {
    if (!user || !dailyGoals) return [];
    const consumed = getTodaysNutrition();
    const recs = generateRecommendations(consumed, dailyGoals, user);
    
    // Add suggested foods based on recommendation type
    return recs.map(rec => ({
      ...rec,
      suggestedFoods: foodSuggestionsByType[rec.type] || []
    }));
  }, [user, dailyGoals, getTodaysNutrition]);

  const displayRecommendations = recommendations;

  if (displayRecommendations.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        Smart Recommendations
      </h3>
      <div className="space-y-2">
        {displayRecommendations.map((rec, index) => {
          const config = priorityConfig[rec.priority];
          const Icon = config.icon;
          return (
            <div key={index} className={cn('glass-card p-4 border animate-fade-in', config.borderColor)} style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex gap-3">
                <div className={cn('p-2 rounded-lg shrink-0', config.bgColor)}>
                  <Icon className={cn('w-4 h-4', config.textColor)} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground leading-relaxed">{rec.message}</p>
                  {rec.suggestedFoods && rec.suggestedFoods.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {rec.suggestedFoods.map((food) => (
                        <span key={food.id} className="text-xs bg-primary/20 text-primary px-3 py-1.5 rounded-full font-medium font-sans border border-primary/30">
                          🍽️ {food.name}
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
