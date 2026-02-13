import React from 'react';
import { useUser } from '@/context/UserContext';
import { CalorieRing } from '@/components/dashboard/CalorieRing';
import { MacroCards } from '@/components/dashboard/MacroCards';
import { RecentMeals } from '@/components/dashboard/RecentMeals';
// import { Recommendations } from '@/components/dashboard/Recommendations';
import { Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user } = useUser();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="pt-safe px-4 pt-6 pb-4">
        <div className="max-w-lg mx-auto">
          <p className="text-muted-foreground text-sm">{getGreeting()},</p>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-8 space-y-6 max-w-lg mx-auto">
        {/* Calorie Ring */}
        <CalorieRing />

        {/* Macro Cards */}
        <MacroCards />

        {/* Quick Scan Button */}
        <Link to="/scan" className="block">
          <Button className="w-full h-14 gradient-primary text-primary-foreground font-semibold rounded-2xl shadow-glow hover:shadow-lg transition-all">
            <Camera className="w-5 h-5 mr-2" />
            Scan Your Meal
          </Button>
        </Link>

        {/* Recommendations */}
        {/* <Recommendations /> */}

        {/* Recent Meals */}
        <RecentMeals />
      </main>
    </div>
  );
};

export default Dashboard;
