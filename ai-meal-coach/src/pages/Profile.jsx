import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { User, LogOut, Settings, Target, Activity, Utensils, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const goalLabels = {
  weight_loss: 'Weight Loss',
  maintain: 'Maintain Weight',
  weight_gain: 'Weight Gain',
};

const activityLabels = {
  sedentary: 'Sedentary',
  light: 'Lightly Active',
  moderate: 'Moderately Active',
  active: 'Active',
  very_active: 'Very Active',
};

const dietLabels = {
  vegetarian: 'Vegetarian',
  non_vegetarian: 'Non-Vegetarian',
  vegan: 'Vegan',
  eggetarian: 'Eggetarian',
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, dailyGoals, logout } = useUser();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const profileItems = [
    { icon: User, label: 'Age', value: `${user.age} years` },
    { icon: Scale, label: 'Weight', value: `${user.weight} kg` },
    { icon: Activity, label: 'Height', value: `${user.height} cm` },
    { icon: Target, label: 'Goal', value: goalLabels[user.goal] },
    { icon: Settings, label: 'Activity', value: activityLabels[user.activityLevel] },
    { icon: Utensils, label: 'Diet', value: dietLabels[user.dietPreference] },
  ];

  // Calculate BMI
  const bmi = user.weight / Math.pow(user.height / 100, 2);
  const bmiCategory = 
    bmi < 18.5 ? 'Underweight' :
    bmi < 25 ? 'Normal' :
    bmi < 30 ? 'Overweight' : 'Obese';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="pt-safe px-4 pt-6 pb-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-display font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account</p>
        </div>
      </header>

      <main className="px-4 pb-8 max-w-lg mx-auto space-y-6">
        {/* User Card */}
        <div className="glass-card p-6 text-center">
          <div className="w-20 h-20 rounded-full gradient-primary mx-auto flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-display font-bold text-foreground">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        {/* BMI Card */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Your BMI</p>
              <p className="text-2xl font-bold text-foreground">{bmi.toFixed(1)}</p>
            </div>
            <span className={cn(
              'text-xs font-medium px-3 py-1 rounded-full',
              bmiCategory === 'Normal' ? 'bg-success/10 text-success' :
              bmiCategory === 'Underweight' ? 'bg-warning/10 text-warning' :
              'bg-destructive/10 text-destructive'
            )}>
              {bmiCategory}
            </span>
          </div>
        </div>

        {/* Daily Goals */}
        {dailyGoals && (
          <div className="glass-card p-4">
            <h3 className="font-semibold text-foreground mb-3">Daily Targets</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-foreground">{dailyGoals.calories}</p>
                <p className="text-xs text-muted-foreground">Calories</p>
              </div>
              <div className="bg-muted rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-primary">{dailyGoals.protein}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div className="bg-muted rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-accent">{dailyGoals.carbohydrates}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div className="bg-muted rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-warning">{dailyGoals.fat}g</p>
                <p className="text-xs text-muted-foreground">Fat</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Details */}
        <div className="glass-card divide-y divide-border">
          {profileItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-medium text-foreground">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Logout Button */}
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="w-full h-12 rounded-xl"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
      </main>
    </div>
  );
};

export default Profile;
