import React from 'react';
import { cn } from '@/lib/utils';

export const ProgressRing = ({ progress = 0, size = 120, strokeWidth = 8, color = 'primary', value, label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const colorClasses = {
    primary: 'stroke-primary',
    destructive: 'stroke-destructive',
    warning: 'stroke-warning',
    success: 'stroke-success',
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} fill="none" className="stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={cn('transition-all duration-500 ease-out', colorClasses[color])}
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {value && <span className="text-2xl font-bold text-foreground">{value}</span>}
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
};
