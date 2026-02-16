import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { UtensilsCrossed, Flame, CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays, subDays, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import DataExportDialog from '@/components/meals/DataExportDialog';

const mealTypeConfig = {
  breakfast: { icon: '🌅', color: 'hsl(var(--warning))' },
  lunch: { icon: '☀️', color: 'hsl(var(--primary))' },
  dinner: { icon: '🌙', color: 'hsl(var(--accent))' },
  snack: { icon: '🍎', color: 'hsl(var(--success))' },
};

const MealLog = () => {
  const { dailyGoals, getMealsByDate, getNutritionByDate } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const meals = getMealsByDate(selectedDate);
  const nutrition = getNutritionByDate(selectedDate) || {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
  };



  // Group meals by type
  const mealsByType = meals.reduce((acc, meal) => {
    const type = meal.category || 'snack';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(meal);
    return acc;
  }, {});

  // Chart data
  const chartData = dailyGoals ? [
    { name: 'Calories', consumed: nutrition.calories || 0, goal: dailyGoals.calories || 0, unit: 'kcal' },
    { name: 'Protein', consumed: nutrition.protein || 0, goal: dailyGoals.protein || 0, unit: 'g' },
    { name: 'Carbs', consumed: nutrition.carbohydrates || 0, goal: dailyGoals.carbohydrates || 0, unit: 'g' },
    { name: 'Fat', consumed: nutrition.fat || 0, goal: dailyGoals.fat || 0, unit: 'g' },
  ] : [];


  const handlePreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    const nextDay = addDays(selectedDate, 1);
    if (nextDay <= new Date()) {
      setSelectedDate(nextDay);
    }
  };

  const handleDateSelect = (date) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="pt-safe px-4 pt-6 pb-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
              Meal Log
            </h1>
            <DataExportDialog />
          </div>

          {/* Date Picker */}
          <div className="flex items-center justify-between mt-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousDay}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-center text-sm font-medium gap-2",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {isToday(selectedDate)
                    ? `Today, ${format(selectedDate, 'MMM d')}`
                    : format(selectedDate, 'EEEE, MMMM d')
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextDay}
              disabled={isToday(selectedDate)}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 pb-8 max-w-lg mx-auto space-y-6">
        {/* Daily Summary Chart */}
        <div className="glass-card p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-accent" />
            Nutrition Summary
          </h3>

          {chartData.length > 0 && (
            <div className="py-2 w-full flex justify-center overflow-hidden">
              <BarChart
                width={380}
                height={220}
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 40, left: 10, bottom: 10 }}
                barSize={16}
                barGap={-16}
              >
                <XAxis type="number" hide domain={[0, 'dataMax']} />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  width={70}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13, fontWeight: 500 }}
                />
                <Bar
                  dataKey="goal"
                  fill="hsl(var(--muted))"
                  fillOpacity={0.15}
                  radius={[0, 6, 6, 0]}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="consumed"
                  radius={[0, 6, 6, 0]}
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.consumed > entry.goal
                          ? 'hsl(var(--destructive))'
                          : index === 0
                            ? 'hsl(var(--primary))'
                            : index === 1
                              ? 'hsl(var(--accent))'
                              : index === 2
                                ? 'hsl(var(--warning))'
                                : 'hsl(var(--success))'
                      }
                      fillOpacity={0.9}
                    />
                  ))}
                </Bar>
              </BarChart>
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
            {chartData.map((item, i) => (
              <div key={item.name}>
                <p className="font-semibold text-foreground">
                  {Math.round(item.consumed)}/{item.goal}
                </p>
                <p className="text-muted-foreground">{item.unit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Meals by Type */}
        {(['breakfast', 'lunch', 'dinner', 'snack']).map((type) => {
          const typeMeals = mealsByType[type] || [];
          const config = mealTypeConfig[type];
          const totalCals = typeMeals.reduce(
            (sum, m) => sum + (m.nutrition?.calories || 0) * (m.quantity || 1),
            0
          );

          return (
            <div key={type} className="glass-card overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{config.icon}</span>
                  <h3 className="font-semibold text-foreground capitalize">{type}</h3>
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {totalCals > 0 ? `${Math.round(totalCals)} kcal` : '-'}
                </span>
              </div>

              {typeMeals.length > 0 ? (
                <div className="divide-y divide-border">
                  {typeMeals.map((meal) => {
                    const nutrition = meal.nutrition || {};
                    return (
                      <div key={meal.id} className="p-4 flex items-center gap-3">
                        <div
                          className="w-2 h-10 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{meal.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">
                            {meal.quantity > 1 ? `${meal.quantity}x serving` : `1 serving`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            {Math.round((nutrition.calories || 0) * (meal.quantity || 1))}
                          </p>
                          <p className="text-xs text-muted-foreground">kcal</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">No {type} logged{isToday(selectedDate) ? ' yet' : ''}</p>
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default MealLog;
