import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Camera, UtensilsCrossed, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/meals', icon: UtensilsCrossed, label: 'Meals' },
  { to: '/scan', icon: Camera, label: 'Scan', isCenter: true },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border safe-area-pb">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all',
                  item.isCenter
                    ? 'relative -top-4 w-14 h-14 rounded-full gradient-primary shadow-glow flex items-center justify-center'
                    : isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('w-5 h-5', item.isCenter && 'text-primary-foreground w-6 h-6')} />
                  {!item.isCenter && (
                    <span className="text-[10px] font-medium">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
