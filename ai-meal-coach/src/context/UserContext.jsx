import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculateDailyGoals } from '@/services/mockApi';

const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [allMeals, setAllMeals] = useState([]);
  const [dailyGoals, setDailyGoals] = useState(null);

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
    }
    
    if (savedMeals) {
      setAllMeals(JSON.parse(savedMeals));
    }
  }, []);

  const setUser = (newUser) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem('nutrition_user', JSON.stringify(newUser));
      setDailyGoals(calculateDailyGoals(newUser));
    } else {
      localStorage.removeItem('nutrition_user');
      setDailyGoals(null);
    }
  };

  const addMeal = (meal) => {
    const updatedMeals = [...allMeals, meal];
    setAllMeals(updatedMeals);
    localStorage.setItem('nutrition_meals_all', JSON.stringify(updatedMeals));
  };

  const removeMeal = (mealId) => {
    const updatedMeals = allMeals.filter(m => m.id !== mealId);
    setAllMeals(updatedMeals);
    localStorage.setItem('nutrition_meals_all', JSON.stringify(updatedMeals));
  };

  const getMealsByDate = (date) => {
    return allMeals.filter(
      (m) => new Date(m.timestamp).toDateString() === date.toDateString()
    );
  };

  const getNutritionByDate = (date) => {
    const meals = getMealsByDate(date);
    return meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + ((meal.foodItem.nutrition.calories || 0) * meal.quantity),
        protein: acc.protein + ((meal.foodItem.nutrition.protein || 0) * meal.quantity),
        carbohydrates: acc.carbohydrates + ((meal.foodItem.nutrition.carbohydrates || 0) * meal.quantity),
        fat: acc.fat + ((meal.foodItem.nutrition.fat || 0) * meal.quantity),
        fiber: acc.fiber + ((meal.foodItem.nutrition.fiber || 0) * meal.quantity),
      }),
      { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0 }
    );
  };

  const getTodaysNutrition = () => {
    return getNutritionByDate(new Date());
  };

  const logout = () => {
    setUserState(null);
    setAllMeals([]);
    setDailyGoals(null);
    localStorage.removeItem('nutrition_user');
    localStorage.removeItem('nutrition_meals_all');
    localStorage.removeItem('nutrition_token');
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        dailyGoals,
        todaysMeals,
        allMeals,
        addMeal,
        removeMeal,
        getTodaysNutrition,
        getMealsByDate,
        getNutritionByDate,
        logout,
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
