import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Leaf, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { UserProfile } from '@/types/nutrition';
import { cn } from '@/lib/utils';

type Step = 'welcome' | 'basic' | 'body' | 'activity' | 'goal' | 'diet';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [step, setStep] = useState<Step>('welcome');
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    height: number;
    weight: number;
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    goal: 'weight_loss' | 'maintain' | 'weight_gain';
    dietPreference: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'eggetarian';
    allergies: string[];
  }>({
    name: '',
    email: '',
    age: 25,
    gender: 'male',
    height: 170,
    weight: 70,
    activityLevel: 'moderate',
    goal: 'maintain',
    dietPreference: 'vegetarian',
    allergies: [],
  });

  const steps: Step[] = ['welcome', 'basic', 'body', 'activity', 'goal', 'diet'];
  const currentStepIndex = steps.indexOf(step);

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex]);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex]);
    }
  };

  const completeOnboarding = () => {
    const user: UserProfile = {
      id: `user_${Date.now()}`,
      ...formData,
    };
    setUser(user);
    localStorage.setItem('nutrition_token', 'demo_token');
    navigate('/dashboard');
  };

  const activityOptions = [
    { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
    { value: 'light', label: 'Light', desc: 'Exercise 1-3 days/week' },
    { value: 'moderate', label: 'Moderate', desc: 'Exercise 3-5 days/week' },
    { value: 'active', label: 'Active', desc: 'Exercise 6-7 days/week' },
    { value: 'very_active', label: 'Very Active', desc: 'Intense daily exercise' },
  ] as const;

  const goalOptions = [
    { value: 'weight_loss', label: 'Lose Weight', desc: '500 kcal deficit', icon: '📉' },
    { value: 'maintain', label: 'Maintain', desc: 'Stay at current weight', icon: '⚖️' },
    { value: 'weight_gain', label: 'Gain Weight', desc: '300 kcal surplus', icon: '📈' },
  ] as const;

  const dietOptions = [
    { value: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
    { value: 'non_vegetarian', label: 'Non-Vegetarian', icon: '🍗' },
    { value: 'vegan', label: 'Vegan', icon: '🌱' },
    { value: 'eggetarian', label: 'Eggetarian', icon: '🥚' },
  ] as const;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Bar */}
      {step !== 'welcome' && (
        <div className="pt-safe px-4 pt-4">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={prevStep} className="shrink-0">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full gradient-primary transition-all duration-300"
                  style={{ width: `${((currentStepIndex) / (steps.length - 1)) * 100}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-10 text-right">
                {currentStepIndex}/{steps.length - 1}
              </span>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col px-4 py-8 max-w-lg mx-auto w-full">
        {/* Welcome Step */}
        {step === 'welcome' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center mb-8 shadow-glow">
              <Leaf className="w-12 h-12 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-3">
              AI Nutrition Tracker
            </h1>
            <p className="text-muted-foreground mb-8 max-w-xs">
              Track your meals, get personalized recommendations, and achieve your health goals.
            </p>
            <Button
              onClick={nextStep}
              className="w-full max-w-xs h-14 gradient-primary text-primary-foreground font-semibold rounded-2xl shadow-glow"
            >
              Get Started
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Basic Info Step */}
        {step === 'basic' && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              Let's get to know you
            </h2>
            <p className="text-muted-foreground mb-8">
              This helps us personalize your experience
            </p>

            <div className="space-y-4 flex-1">
              <div>
                <label className="text-sm font-medium text-foreground">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  className="mt-2 w-full h-14 px-4 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="mt-2 w-full h-14 px-4 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Gender</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(['male', 'female', 'other'] as const).map((gender) => (
                    <button
                      key={gender}
                      onClick={() => setFormData({ ...formData, gender })}
                      className={cn(
                        'h-12 rounded-xl border-2 font-medium capitalize transition-all',
                        formData.gender === gender
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-muted text-foreground'
                      )}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={nextStep}
              disabled={!formData.name || !formData.email}
              className="w-full h-14 gradient-primary text-primary-foreground font-semibold rounded-2xl mt-8"
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Body Measurements Step */}
        {step === 'body' && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              Body measurements
            </h2>
            <p className="text-muted-foreground mb-8">
              Used to calculate your daily calorie needs
            </p>

            <div className="space-y-6 flex-1">
              <div>
                <label className="text-sm font-medium text-foreground">Age</label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="range"
                    min="15"
                    max="80"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="flex-1 accent-primary"
                  />
                  <span className="w-16 h-12 rounded-xl bg-muted flex items-center justify-center font-semibold">
                    {formData.age}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Height (cm)</label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="range"
                    min="120"
                    max="220"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                    className="flex-1 accent-primary"
                  />
                  <span className="w-16 h-12 rounded-xl bg-muted flex items-center justify-center font-semibold">
                    {formData.height}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Weight (kg)</label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="range"
                    min="30"
                    max="150"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                    className="flex-1 accent-primary"
                  />
                  <span className="w-16 h-12 rounded-xl bg-muted flex items-center justify-center font-semibold">
                    {formData.weight}
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={nextStep}
              className="w-full h-14 gradient-primary text-primary-foreground font-semibold rounded-2xl mt-8"
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Activity Level Step */}
        {step === 'activity' && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              How active are you?
            </h2>
            <p className="text-muted-foreground mb-8">
              This affects your daily calorie target
            </p>

            <div className="space-y-2 flex-1">
              {activityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData({ ...formData, activityLevel: option.value })}
                  className={cn(
                    'w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between',
                    formData.activityLevel === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-muted'
                  )}
                >
                  <div>
                    <p className="font-semibold text-foreground">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.desc}</p>
                  </div>
                  {formData.activityLevel === option.value && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>

            <Button
              onClick={nextStep}
              className="w-full h-14 gradient-primary text-primary-foreground font-semibold rounded-2xl mt-8"
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Goal Step */}
        {step === 'goal' && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              What's your goal?
            </h2>
            <p className="text-muted-foreground mb-8">
              We'll adjust your calories accordingly
            </p>

            <div className="space-y-3 flex-1">
              {goalOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData({ ...formData, goal: option.value })}
                  className={cn(
                    'w-full p-5 rounded-xl border-2 text-left transition-all flex items-center gap-4',
                    formData.goal === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-muted'
                  )}
                >
                  <span className="text-3xl">{option.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.desc}</p>
                  </div>
                  {formData.goal === option.value && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>

            <Button
              onClick={nextStep}
              className="w-full h-14 gradient-primary text-primary-foreground font-semibold rounded-2xl mt-8"
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Diet Preference Step */}
        {step === 'diet' && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              Your diet preference
            </h2>
            <p className="text-muted-foreground mb-8">
              We'll suggest foods based on this
            </p>

            <div className="grid grid-cols-2 gap-3 flex-1">
              {dietOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData({ ...formData, dietPreference: option.value })}
                  className={cn(
                    'p-5 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-2',
                    formData.dietPreference === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-muted'
                  )}
                >
                  <span className="text-4xl">{option.icon}</span>
                  <p className="font-semibold text-foreground">{option.label}</p>
                  {formData.dietPreference === option.value && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>

            <Button
              onClick={completeOnboarding}
              className="w-full h-14 gradient-primary text-primary-foreground font-semibold rounded-2xl mt-8"
            >
              Complete Setup
              <Check className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Onboarding;
