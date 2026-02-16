import {
  ref,
  set,
  get,
  update,
  remove,
  query,
  orderByChild,
  startAt,
  endAt,
  DatabaseError,
} from 'firebase/database';
import { database } from '@/config/firebaseConfig';

export interface MealEntry {
  id: string;
  name: string;
  quantity: number;
  nutrition: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    sugar?: number;
  };
  timestamp: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface DailyMeals {
  [mealId: string]: MealEntry;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  activityLevel: string;
  goal: string;
  dietPreference: string;
  dietaryRestrictions: string;
  allergens: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DailyNutrition {
  date: string;
  meals: DailyMeals;
  totals: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
}

// ==================== USER PROFILE OPERATIONS ====================

export const saveUserProfile = async (userId: string, profileData: Partial<UserProfile>) => {
  try {
    const userRef = ref(database, `users/${userId}/profile`);
    const dataWithTimestamp = {
      ...profileData,
      updatedAt: new Date().toISOString(),
    };
    await set(userRef, dataWithTimestamp);
    return { success: true };
  } catch (error) {
    console.error('Error saving user profile:', error);
    return { success: false, error };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userRef = ref(database, `users/${userId}/profile`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    }
    return { success: false, error: 'User profile not found' };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { success: false, error };
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const userRef = ref(database, `users/${userId}/profile`);
    const dataWithTimestamp = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await update(userRef, dataWithTimestamp);
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error };
  }
};

// ==================== MEAL LOGGING OPERATIONS ====================

export const addMealEntry = async (userId: string, date: string, mealData: MealEntry) => {
  try {
    const mealRef = ref(database, `users/${userId}/meals/${date}/${mealData.id}`);
    await set(mealRef, mealData);
    
    // Update totals
    await updateDailyTotals(userId, date);
    
    return { success: true };
  } catch (error) {
    console.error('Error adding meal entry:', error);
    return { success: false, error };
  }
};

export const removeMealEntry = async (userId: string, date: string, mealId: string) => {
  try {
    const mealRef = ref(database, `users/${userId}/meals/${date}/${mealId}`);
    await remove(mealRef);
    
    // Update totals
    await updateDailyTotals(userId, date);
    
    return { success: true };
  } catch (error) {
    console.error('Error removing meal entry:', error);
    return { success: false, error };
  }
};

export const getDailyMeals = async (userId: string, date: string) => {
  try {
    const mealsRef = ref(database, `users/${userId}/meals/${date}`);
    const snapshot = await get(mealsRef);
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    }
    return { success: true, data: {} };
  } catch (error) {
    console.error('Error fetching daily meals:', error);
    return { success: false, error };
  }
};

export const getAllMeals = async (userId: string) => {
  try {
    const mealsRef = ref(database, `users/${userId}/meals`);
    const snapshot = await get(mealsRef);
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    }
    return { success: true, data: {} };
  } catch (error) {
    console.error('Error fetching all meals:', error);
    return { success: false, error };
  }
};

export const getMealsByDateRange = async (
  userId: string,
  startDate: string,
  endDate: string
) => {
  try {
    const mealsRef = ref(database, `users/${userId}/meals`);
    const snapshot = await get(mealsRef);
    
    if (snapshot.exists()) {
      const allMeals = snapshot.val();
      const filteredMeals: { [key: string]: any } = {};
      
      for (const [date, meals] of Object.entries(allMeals)) {
        if (date >= startDate && date <= endDate) {
          filteredMeals[date] = meals;
        }
      }
      
      return { success: true, data: filteredMeals };
    }
    return { success: true, data: {} };
  } catch (error) {
    console.error('Error fetching meals by date range:', error);
    return { success: false, error };
  }
};

// ==================== NUTRITION SUMMARY OPERATIONS ====================

export const getDailyNutritionSummary = async (userId: string, date: string) => {
  try {
    const summaryRef = ref(database, `users/${userId}/nutrition/${date}`);
    const snapshot = await get(summaryRef);
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    }
    return { success: true, data: null };
  } catch (error) {
    console.error('Error fetching nutrition summary:', error);
    return { success: false, error };
  }
};

export const updateDailyTotals = async (userId: string, date: string) => {
  try {
    const mealsRef = ref(database, `users/${userId}/meals/${date}`);
    const snapshot = await get(mealsRef);
    
    let totals = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
    };
    
    if (snapshot.exists()) {
      const meals = snapshot.val();
      
      for (const meal of Object.values(meals) as MealEntry[]) {
        totals.calories += meal.nutrition.calories * meal.quantity;
        totals.protein += meal.nutrition.protein * meal.quantity;
        totals.carbohydrates += meal.nutrition.carbohydrates * meal.quantity;
        totals.fat += meal.nutrition.fat * meal.quantity;
        totals.fiber += meal.nutrition.fiber * meal.quantity;
        totals.sugar += (meal.nutrition.sugar || 0) * meal.quantity;
      }
    }
    
    const summaryRef = ref(database, `users/${userId}/nutrition/${date}`);
    await set(summaryRef, {
      date,
      totals,
      lastUpdated: new Date().toISOString(),
    });
    
    return { success: true, data: totals };
  } catch (error) {
    console.error('Error updating daily totals:', error);
    return { success: false, error };
  }
};

export const getNutritionByDateRange = async (
  userId: string,
  startDate: string,
  endDate: string
) => {
  try {
    const nutritionRef = ref(database, `users/${userId}/nutrition`);
    const snapshot = await get(nutritionRef);
    
    if (snapshot.exists()) {
      const allNutrition = snapshot.val();
      const filteredNutrition: { [key: string]: any } = {};
      
      for (const [date, data] of Object.entries(allNutrition)) {
        if (date >= startDate && date <= endDate) {
          filteredNutrition[date] = data;
        }
      }
      
      return { success: true, data: filteredNutrition };
    }
    return { success: true, data: {} };
  } catch (error) {
    console.error('Error fetching nutrition by date range:', error);
    return { success: false, error };
  }
};

// ==================== UTILITY FUNCTIONS ====================

export const formatDateForDB = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

export const calculateMealCategory = (hour: number): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
  if (hour >= 6 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 17) return 'snack';
  if (hour >= 17 && hour < 22) return 'dinner';
  return 'snack';
};

export const syncLocalStorageToFirebase = async (
  userId: string,
  localMeals: any[]
) => {
  try {
    for (const meal of localMeals) {
      const date = formatDateForDB(new Date(meal.timestamp));
      const mealsRef = ref(database, `users/${userId}/meals/${date}/${meal.id}`);
      await set(mealsRef, meal);
    }
    
    // Update all daily totals
    const dates = new Set(
      localMeals.map(m => formatDateForDB(new Date(m.timestamp)))
    );
    
    for (const date of dates) {
      await updateDailyTotals(userId, date);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error syncing to Firebase:', error);
    return { success: false, error };
  }
};

export const downloadDataFromFirebase = async (userId: string) => {
  try {
    const result = await getAllMeals(userId);
    if (result.success) {
      const meals: any[] = [];
      const allMeals = result.data;
      
      for (const [date, dateMeals] of Object.entries(allMeals)) {
        for (const meal of Object.values(dateMeals) as MealEntry[]) {
          meals.push(meal);
        }
      }
      
      return { success: true, data: meals };
    }
    return { success: false, error: result.error };
  } catch (error) {
    console.error('Error downloading data from Firebase:', error);
    return { success: false, error };
  }
};
