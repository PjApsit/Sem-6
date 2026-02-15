import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { User, LogOut, Settings, Target, Activity, Utensils, Scale, Edit2, X, Check } from 'lucide-react';
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
  const { user, dailyGoals, logout, updateUser } = useUser();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState(null);

  if (!user) return null;

  // Safe number converter - prevents NaN display
  const safeNumber = (value, defaultValue = 0) => {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  };

  // Initialize edit data
  if (isEditMode && !editData) {
    setEditData({
      age: safeNumber(user.age, 25),
      weight: safeNumber(user.weight, 70),
      height: safeNumber(user.height, 170),
      activityLevel: user.activityLevel || 'moderate',
      goal: user.goal || 'maintain',
      dietPreference: user.dietPreference || 'vegetarian',
      dietaryRestrictions: user.dietaryRestrictions || '',
      allergens: user.allergens || [],
    });
  }

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleSaveChanges = async () => {
    try {
      // Update user with new data (this will sync to Firebase if online)
      await updateUser(editData);

      // Also update nutrition_users database for login purposes
      const savedUsers = JSON.parse(localStorage.getItem('nutrition_users') || '[]');
      const userIndex = savedUsers.findIndex(u => u.email === user.email);
      if (userIndex >= 0) {
        savedUsers[userIndex] = { ...savedUsers[userIndex], ...editData };
        localStorage.setItem('nutrition_users', JSON.stringify(savedUsers));
      }

      setIsEditMode(false);
      setEditData(null);
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditData(null);
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
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your account</p>
          </div>
          {!isEditMode && (
            <button
              onClick={() => setIsEditMode(true)}
              className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {isEditMode && editData ? (
        // EDIT MODE
        <main className="px-4 pb-8 max-w-lg mx-auto space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-display font-bold text-foreground mb-6">Edit Profile</h2>

            <div className="space-y-4">
              {/* Age */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Age (years)</label>
                <input
                  type="number"
                  min="15"
                  max="120"
                  value={isNaN(editData.age) ? '' : editData.age}
                  onChange={(e) => setEditData({ ...editData, age: safeNumber(e.target.value, editData.age) })}
                  className="w-full h-12 px-4 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              {/* Height */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Height (cm)</label>
                <input
                  type="number"
                  min="120"
                  max="250"
                  step="0.5"
                  value={isNaN(editData.height) ? '' : editData.height}
                  onChange={(e) => setEditData({ ...editData, height: safeNumber(e.target.value, editData.height) })}
                  className="w-full h-12 px-4 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Weight (kg)</label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  step="0.1"
                  value={isNaN(editData.weight) ? '' : editData.weight}
                  onChange={(e) => setEditData({ ...editData, weight: safeNumber(e.target.value, editData.weight) })}
                  className="w-full h-12 px-4 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              {/* Activity Level */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Activity Level</label>
                <select
                  value={editData.activityLevel}
                  onChange={(e) => setEditData({ ...editData, activityLevel: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none transition-colors"
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Lightly Active</option>
                  <option value="moderate">Moderately Active</option>
                  <option value="active">Active</option>
                  <option value="very_active">Very Active</option>
                </select>
              </div>

              {/* Goal */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Goal</label>
                <select
                  value={editData.goal}
                  onChange={(e) => setEditData({ ...editData, goal: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none transition-colors"
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="weight_gain">Weight Gain</option>
                </select>
              </div>

              {/* Diet Preference */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Diet Preference</label>
                <select
                  value={editData.dietPreference}
                  onChange={(e) => setEditData({ ...editData, dietPreference: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none transition-colors"
                >
                  <option value="vegetarian">Vegetarian</option>
                  <option value="non_vegetarian">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="eggetarian">Eggetarian</option>
                </select>
              </div>

              {/* Dietary Restrictions */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Dietary Restrictions (Optional)</label>
                <textarea
                  value={editData.dietaryRestrictions}
                  onChange={(e) => setEditData({ ...editData, dietaryRestrictions: e.target.value })}
                  placeholder="e.g., Low sodium, Low sugar, Kosher, Halal..."
                  className="w-full h-20 px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Allergens */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-3">Allergens</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {[
                    { id: 'dairy', label: 'Dairy (Milk, Yogurt, Cheese, Cottage Cheese)' },
                    { id: 'eggs', label: 'Eggs (Whole Eggs, Egg Whites)' },
                    { id: 'fish', label: 'Fish (Salmon, Tuna)' },
                    { id: 'gluten', label: 'Gluten (Breads, Pasta, Couscous, Bulgur, Tortillas)' },
                    { id: 'wheat', label: 'Wheat (Breads, Pasta, Couscous, Bulgur, Tortillas)' },
                    { id: 'soy', label: 'Soy (Tofu, Tempeh)' },
                    { id: 'tree_nuts', label: 'Tree Nuts (Almonds, Walnuts)' },
                    { id: 'peanuts', label: 'Peanuts (Peanut Butter)' },
                  ].map((allergen) => (
                    <button
                      key={allergen.id}
                      onClick={() => {
                        if (editData.allergens.includes(allergen.id)) {
                          setEditData({
                            ...editData,
                            allergens: editData.allergens.filter(a => a !== allergen.id),
                          });
                        } else {
                          setEditData({
                            ...editData,
                            allergens: [...editData.allergens, allergen.id],
                          });
                        }
                      }}
                      className={cn(
                        'w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3',
                        editData.allergens.includes(allergen.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-muted'
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0',
                          editData.allergens.includes(allergen.id)
                            ? 'border-primary bg-primary'
                            : 'border-border bg-transparent'
                        )}
                      >
                        {editData.allergens.includes(allergen.id) && (
                          <Check className="w-4 h-4 text-primary-foreground" />
                        )}
                      </div>
                      <p className="font-medium text-foreground flex-1">{allergen.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Save/Cancel Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 h-12 rounded-xl"
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveChanges}
                className="flex-1 h-12 rounded-xl gradient-primary text-primary-foreground font-semibold"
              >
                <Check className="w-5 h-5 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </main>
      ) : (
        // VIEW MODE
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
      )}
    </div>
  );
};

export default Profile;
