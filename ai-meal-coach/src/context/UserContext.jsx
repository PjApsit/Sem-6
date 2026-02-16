import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculateDailyGoals } from '@/services/mockApi';
import {
  saveUserProfile,
  getUserProfile,
  updateUserProfile,
  addMealEntry,
  removeMealEntry,
  getDailyMeals,
  getAllMeals,
  updateDailyTotals,
  getDailyNutritionSummary,
  formatDateForDB,
  syncLocalStorageToFirebase,
  downloadDataFromFirebase,
} from '@/services/firebaseService.js';

const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [allMeals, setAllMeals] = useState([]);
  const [dailyGoals, setDailyGoals] = useState(null);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [isOnlineMode, setIsOnlineMode] = useState(true);

  // Derived: today's meals
  const todaysMeals = allMeals.filter(
    (m) => new Date(m.timestamp).toDateString() === new Date().toDateString()
  );

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('nutrition_user');
    const savedMeals = localStorage.getItem('nutrition_meals_all');
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUserState(parsedUser);
      setDailyGoals(calculateDailyGoals(parsedUser));
      setFirebaseReady(true);
      
      // Sync with Firebase if online
      if (navigator.onLine && parsedUser.id) {
        syncWithFirebase(parsedUser);
      }
    }
    
    if (savedMeals) {
      setAllMeals(JSON.parse(savedMeals));
    }

    // Listen for online/offline events
    const handleOnline = () => setIsOnlineMode(true);
    const handleOffline = () => setIsOnlineMode(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncWithFirebase = async (currentUser) => {
    try {
      if (!currentUser?.id) return;

      // Sync local meals to Firebase
      const savedMeals = localStorage.getItem('nutrition_meals_all');
      if (savedMeals) {
        const meals = JSON.parse(savedMeals);
        await syncLocalStorageToFirebase(currentUser.id, meals);
      }

      // Load latest data from Firebase
      const mealsResult = await getAllMeals(currentUser.id);
      if (mealsResult.success && mealsResult.data) {
        const allMealsData = [];
        for (const [date, meals] of Object.entries(mealsResult.data)) {
          for (const meal of Object.values(meals)) {
            allMealsData.push(meal);
          }
        }
        setAllMeals(allMealsData);
        localStorage.setItem('nutrition_meals_all', JSON.stringify(allMealsData));
      }
    } catch (error) {
      console.error('Error syncing with Firebase:', error);
    }
  };

  const setUser = async (newUser) => {
    setUserState(newUser);
    if (newUser) {
      console.log('👤 Setting user in context...', { name: newUser.name, email: newUser.email });
      localStorage.setItem('nutrition_user', JSON.stringify(newUser));
      setDailyGoals(calculateDailyGoals(newUser));
      
      // Save to Firebase if online
      if (navigator.onLine && newUser.id) {
        try {
          console.log('📤 Uploading user profile to Firebase...');
          await saveUserProfile(newUser.id, newUser);
          console.log('✅ User profile uploaded to Firebase!');
        } catch (error) {
          console.error('❌ Error saving user profile to Firebase:', error);
        }
      }
    } else {
      console.log('👤 Clearing user from context...');
      localStorage.removeItem('nutrition_user');
      setDailyGoals(null);
    }
  };

  const updateUser = async (updates) => {
    console.log('🔄 Updating user profile...', updates);
    const updatedUser = { ...user, ...updates };
    setUserState(updatedUser);
    localStorage.setItem('nutrition_user', JSON.stringify(updatedUser));
    setDailyGoals(calculateDailyGoals(updatedUser));
    console.log('✅ User profile updated in local storage!');
    
    // Update in Firebase if online
    if (navigator.onLine && user?.id) {
      try {
        console.log('📤 Syncing profile changes to Firebase...');
        await updateUserProfile(user.id, updates);
        console.log('✅ Profile changes synced to Firebase!');
      } catch (error) {
        console.error('❌ Error updating user profile in Firebase:', error);
      }
    }
  };

  const addMeal = async (meal) => {
    console.log('=== ADD MEAL FUNCTION CALLED ===');
    console.log('Received meal parameter:', meal);
    console.log('meal is null?', meal === null);
    console.log('meal is undefined?', meal === undefined);
    console.log('meal.id:', meal?.id);
    console.log('meal.name:', meal?.name);
    console.log('meal.userId:', meal?.userId);
    console.log('meal.category:', meal?.category);
    console.log('meal.nutrition:', meal?.nutrition);
    console.log('meal.timestamp:', meal?.timestamp);
    
    console.log('🍽️ Adding meal to app...', { name: meal?.name, category: meal?.category });
    const updatedMeals = [...allMeals, meal];
    setAllMeals(updatedMeals);
    localStorage.setItem('nutrition_meals_all', JSON.stringify(updatedMeals));
    console.log('✅ Meal saved to local storage!');
    
    // Save to Firebase if online
    console.log('navigator.onLine:', navigator.onLine);
    console.log('user?.id:', user?.id);
    
    if (navigator.onLine && user?.id) {
      try {
        console.log('📤 Uploading meal to Firebase...');
        const date = formatDateForDB(new Date(meal.timestamp));
        console.log('Formatted date:', date);
        console.log('About to call addMealEntry with:', { userId: user.id, date, meal: JSON.stringify(meal) });
        await addMealEntry(user.id, date, meal);
        console.log('✅ Meal synced to Firebase!');
      } catch (error) {
        console.error('❌ Error adding meal to Firebase:', error);
      }
    } else {
      console.warn('⚠️ Skipping Firebase sync - offline or no user.id');
    }
  };

  const removeMeal = async (mealId) => {
    console.log('🗑️ Removing meal from app...', { mealId });
    const mealToRemove = allMeals.find(m => m.id === mealId);
    const updatedMeals = allMeals.filter(m => m.id !== mealId);
    setAllMeals(updatedMeals);
    localStorage.setItem('nutrition_meals_all', JSON.stringify(updatedMeals));
    console.log('✅ Meal removed from local storage!');
    
    // Remove from Firebase if online
    if (navigator.onLine && user?.id && mealToRemove) {
      try {
        console.log('📤 Removing meal from Firebase...');
        const date = formatDateForDB(new Date(mealToRemove.timestamp));
        await removeMealEntry(user.id, date, mealId);
        console.log('✅ Meal removed from Firebase!');
      } catch (error) {
        console.error('❌ Error removing meal from Firebase:', error);
      }
    }
  };

  const getMealsByDate = (date) => {
    return allMeals.filter(
      (m) => new Date(m.timestamp).toDateString() === date.toDateString()
    );
  };

  const getNutritionByDate = (date) => {
    const meals = getMealsByDate(date);
    return meals.reduce(
      (acc, meal) => {
        const nutrition = meal.nutrition || {};
        return {
          calories: acc.calories + ((nutrition.calories || 0) * (meal.quantity || 1)),
          protein: acc.protein + ((nutrition.protein || 0) * (meal.quantity || 1)),
          carbohydrates: acc.carbohydrates + ((nutrition.carbohydrates || 0) * (meal.quantity || 1)),
          fat: acc.fat + ((nutrition.fat || 0) * (meal.quantity || 1)),
          fiber: acc.fiber + ((nutrition.fiber || 0) * (meal.quantity || 1)),
        };
      },
      { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0 }
    );
  };

  const getTodaysNutrition = () => {
    return getNutritionByDate(new Date());
  };

  const logout = async () => {
    setUserState(null);
    setAllMeals([]);
    setDailyGoals(null);
    localStorage.removeItem('nutrition_user');
    localStorage.removeItem('nutrition_meals_all');
    localStorage.removeItem('nutrition_token');
  };

  const getDailyNutrition = async (date = new Date()) => {
    if (!user?.id) return null;
    
    const dateStr = formatDateForDB(date);
    
    // Try to get from Firebase first
    if (navigator.onLine) {
      try {
        const result = await getDailyNutritionSummary(user.id, dateStr);
        if (result.success && result.data) {
          return result.data;
        }
      } catch (error) {
        console.error('Error fetching daily nutrition from Firebase:', error);
      }
    }
    
    // Fallback to local calculation
    return {
      date: dateStr,
      nutrition: getNutritionByDate(date),
    };
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        isAuthenticated: !!user,
        dailyGoals,
        todaysMeals,
        allMeals,
        addMeal,
        removeMeal,
        getTodaysNutrition,
        getMealsByDate,
        getNutritionByDate,
        getDailyNutrition,
        logout,
        firebaseReady,
        isOnlineMode,
        syncWithFirebase,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
