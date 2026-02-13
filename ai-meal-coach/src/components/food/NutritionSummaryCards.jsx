import React from 'react';
import { Flame, Beef, Wheat, Droplets, Leaf, Cookie } from 'lucide-react';
import { cn } from '@/lib/utils';

const nutritionMetrics = [
  { key: 'calories', label: 'Calories', unit: '', icon: Flame, colorClass: 'bg-primary/10 text-primary' },
  { key: 'protein', label: 'Protein', unit: 'g', icon: Beef, colorClass: 'bg-accent/10 text-accent' },
  { key: 'carbohydrates', label: 'Carbs', unit: 'g', icon: Wheat, colorClass: 'bg-warning/10 text-warning' },
  { key: 'fat', label: 'Fat', unit: 'g', icon: Droplets, colorClass: 'bg-destructive/10 text-destructive' },
  { key: 'fiber', label: 'Fiber', unit: 'g', icon: Leaf, colorClass: 'bg-success/10 text-success' },
  { key: 'sugar', label: 'Sugar', unit: 'g', icon: Cookie, colorClass: 'bg-muted-foreground/10 text-muted-foreground' },
];

const NutritionCard = ({ label, value, unit, Icon, colorClass }) => {
  return (
    <div className="group glass-card p-3 sm:p-4 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-default">
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg shrink-0', colorClass)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground mb-0.5 truncate">{label}</p>
          <p className="text-lg sm:text-xl font-bold text-foreground leading-tight">
            {value}
            {unit && <span className="text-sm font-medium text-muted-foreground ml-0.5">{unit}</span>}
          </p>
        </div>
      </div>
    </div>
  );
};

export const NutritionSummaryCards = ({ nutrition, quantity = 1, className }) => {
  if (!nutrition) return null;

  const getDisplayValue = (key) => {
    const value = nutrition[key] || 0;
    return Math.round(value * quantity);
  };

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3', className)}>
      {nutritionMetrics.map((metric) => {
        // Handle sugar which might not be in the data
        const value = metric.key === 'sugar' 
          ? getDisplayValue('sugar') || 0
          : getDisplayValue(metric.key);
        
        const displayValue = metric.key === 'calories' 
          ? `${value}` 
          : value;

        return (
          <NutritionCard
            key={metric.key}
            label={metric.label}
            value={displayValue}
            unit={metric.key === 'calories' ? 'kcal' : metric.unit}
            Icon={metric.icon}
            colorClass={metric.colorClass}
          />
        );
      })}
    </div>
  );
};

export default NutritionSummaryCards;
