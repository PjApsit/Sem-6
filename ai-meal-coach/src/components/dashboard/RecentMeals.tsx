import React from 'react';
import { useUser } from '@/context/UserContext';
import { Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const mealTypeColors = {
  breakfast: 'bg-warning/10 text-warning',
  lunch: 'bg-primary/10 text-primary',
  dinner: 'bg-accent/10 text-accent',
  snack: 'bg-success/10 text-success',
};

const mealTypeIcons = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

export const RecentMeals: React.FC = () => {
  const { todaysMeals, removeMeal } = useUser();

  if (todaysMeals.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-muted-foreground">No meals logged today</p>
        <p className="text-sm text-muted-foreground mt-1">Scan your first meal to get started!</p>
      </div>
    );
  }

  // Sort by timestamp (most recent first)
  const sortedMeals = [...todaysMeals].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-3">
      <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary" />
        Today's Meals
      </h3>
      
      <div className="space-y-2">
        {sortedMeals.map((meal) => (
          <div
            key={meal.id}
            className="glass-card p-3 flex items-center gap-3 animate-fade-in"
          >
            <span className="text-2xl">{mealTypeIcons[meal.mealType]}</span>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {meal.foodItem.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn(
                  'text-[10px] font-medium px-2 py-0.5 rounded-full capitalize',
                  mealTypeColors[meal.mealType]
                )}>
                  {meal.mealType}
                </span>
                <span className="text-xs text-muted-foreground">
                  {meal.quantity > 1 ? `${meal.quantity}x • ` : ''}
                  {new Date(meal.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-semibold text-foreground">
                {Math.round(meal.foodItem.nutrition.calories * meal.quantity)}
              </p>
              <p className="text-xs text-muted-foreground">kcal</p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => removeMeal(meal.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
