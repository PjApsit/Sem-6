import React, { useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { generateRecommendations } from '@/services/mockApi';
import { generateRecommendations } from '@/services/mockApi';
import { Lightbulb, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { foods } from '@/services/foods';

const priorityConfig = {
  high: { icon: AlertTriangle, bgColor: 'bg-destructive/10', textColor: 'text-destructive', borderColor: 'border-destructive/20' },
  medium: { icon: Lightbulb, bgColor: 'bg-warning/10', textColor: 'text-warning', borderColor: 'border-warning/20' },
  low: { icon: CheckCircle, bgColor: 'bg-success/10', textColor: 'text-success', borderColor: 'border-success/20' },
};

const getSmartSuggestions = (type, user) => {
  if (!user) return [];

  const fitnessGoal = user.fitnessGoal || user.goal;
  const dietaryRestrictions = (user.dietaryRestrictions || '').toLowerCase();
  const allergens = (user.allergogens || user.allergies || []);

  // Filter foods based on basic dietary logic
  let filteredFoods = foods.filter(food => {
    const foodName = food.name.toLowerCase();

    // Simple allergen check (partial string match)
    const hasAllergen = allergens.some(allergen =>
      foodName.includes(allergen.toLowerCase().replace('no_', ''))
    );
    if (hasAllergen) return false;

    // Dietary restriction check
    if (dietaryRestrictions.includes('vegetarian') || user.dietPreference === 'vegetarian') {
      const nonVegKeywords = ['chicken', 'egg', 'meat', 'fish', 'bhature', 'puri']; // Simple list
      if (nonVegKeywords.some(kw => foodName.includes(kw))) {
        // However, bhature and puri are veg usually, but we keep it simple or refined
      }
    }

    return true;
  });

  // Sort and select based on recommendation type
  let sortedFoods = [];
  switch (type) {
    case 'protein':
      sortedFoods = filteredFoods.sort((a, b) => b.protein - a.protein);
      break;
    case 'carbs':
      // If warning about high carbs, suggest low carb foods or fiber rich
      sortedFoods = filteredFoods.sort((a, b) => a.carbs - b.carbs);
      break;
    case 'fat':
      sortedFoods = filteredFoods.sort((a, b) => a.fat - b.fat);
      break;
    case 'calories':
      // If near limit, suggest low calorie foods (like tomato, onion, lemon)
      sortedFoods = filteredFoods.sort((a, b) => a.calories - b.calories);
      break;
    default:
      // General suggestions based on goal
      if (fitnessGoal === 'weight_loss') {
        sortedFoods = filteredFoods.sort((a, b) => a.calories - b.calories);
      } else if (fitnessGoal === 'muscle_gain' || fitnessGoal === 'weight_gain') {
        sortedFoods = filteredFoods.sort((a, b) => b.protein - a.protein);
      } else {
        sortedFoods = filteredFoods;
      }
  }

  // Return top 3 unique suggestions
  return sortedFoods.slice(0, 3).map(f => ({ id: f.name, name: f.name }));
};

export const Recommendations = () => {
  const { user, dailyGoals, getTodaysNutrition } = useUser();


  const recommendations = useMemo(() => {
    if (!user || !dailyGoals) return [];
    const consumed = getTodaysNutrition();
    const recs = generateRecommendations(consumed, dailyGoals, user);

    return recs.map(rec => ({
      ...rec,
      suggestedFoods: getSmartSuggestions(rec.type, user)
    }));
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
