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
} from 'firebase/database';
import { database } from '@/config/firebaseConfig.js';

// ==================== USER PROFILE OPERATIONS ====================

export const saveUserProfile = async (userId, profileData) => {
  try {
    console.log('💾 Saving user profile to Firebase...', { userId, profileData });
    const userRef = ref(database, `users/${userId}/profile`);
    const dataWithTimestamp = {
      ...profileData,
      updatedAt: new Date().toISOString(),
    };
    await set(userRef, dataWithTimestamp);
    console.log('✅ User profile saved successfully to Firebase!', dataWithTimestamp);
    return { success: true };
  } catch (error) {
    console.error('❌ Error saving user profile:', error);
    return { success: false, error };
  }
};

export const getUserProfile = async (userId) => {
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

export const updateUserProfile = async (userId, updates) => {
  try {
    console.log('🔄 Updating user profile in Firebase...', { userId, updates });
    const userRef = ref(database, `users/${userId}/profile`);
    const dataWithTimestamp = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    console.log('📍 Database path:', `users/${userId}/profile`);
    await update(userRef, dataWithTimestamp);
    console.log('✅ User profile updated successfully in Firebase!', dataWithTimestamp);
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    console.error('❌ Firebase Error Code:', error.code);
    console.error('❌ Firebase Error Message:', error.message);
    return { success: false, error };
  }
};

// ==================== MEAL LOGGING OPERATIONS ====================

export const addMealEntry = async (userId, date, mealData) => {
  try {
    console.log('=== ADDMEALENTRY FUNCTION CALLED ===');
    console.log('userId:', userId);
    console.log('date:', date);
    console.log('mealData:', mealData);
    console.log('mealData is null?', mealData === null);
    console.log('mealData is undefined?', mealData === undefined);
    console.log('🍽️ Adding meal entry to Firebase...', { userId, date, meal: mealData?.name });
    
    const dbPath = `users/${userId}/meals/${date}/${mealData.id}`;
    console.log('📍 Database path:', dbPath);
    
    const mealRef = ref(database, dbPath);
    console.log('📍 mealRef.toString():', mealRef.toString());
    
    const mealJSON = JSON.stringify(mealData, null, 2);
    console.log('📦 Meal data being saved (as JSON):', mealJSON);
    console.log('📦 Meal data type:', typeof mealData);
    console.log('📦 Meal data keys:', Object.keys(mealData || {}));
    
    console.log('🚀 CALLING set() now with mealRef and mealData...');
    await set(mealRef, mealData);
    console.log('✅ set() completed successfully!');
    console.log('✅ Meal saved to Firebase!', mealData);
    
    // Update totals
    console.log('📊 Updating daily totals in Firebase...');
    await updateDailyTotals(userId, date);
    console.log('✅ Daily totals updated!');
    
    return { success: true };
  } catch (error) {
    console.error('=== FIREBASE ERROR ===');
    console.error('❌ Full error object:', error);
    console.error('❌ Firebase Error Code:', error?.code);
    console.error('❌ Firebase Error Message:', error?.message);
    console.error('❌ Error name:', error?.name);
    console.error('❌ Error stack:', error?.stack);
    return { success: false, error };
  }
};

export const removeMealEntry = async (userId, date, mealId) => {
  try {
    console.log('🗑️ Removing meal entry from Firebase...', { userId, date, mealId });
    const mealRef = ref(database, `users/${userId}/meals/${date}/${mealId}`);
    await remove(mealRef);
    console.log('✅ Meal removed from Firebase!');
    
    // Update totals
    console.log('📊 Updating daily totals in Firebase...');
    await updateDailyTotals(userId, date);
    console.log('✅ Daily totals updated!');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error removing meal entry:', error);
    return { success: false, error };
  }
};

export const getDailyMeals = async (userId, date) => {
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

export const getAllMeals = async (userId) => {
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
  userId,
  startDate,
  endDate
) => {
  try {
    const mealsRef = ref(database, `users/${userId}/meals`);
    const snapshot = await get(mealsRef);
    
    if (snapshot.exists()) {
      const allMeals = snapshot.val();
      const filteredMeals = {};
      
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

export const getDailyNutritionSummary = async (userId, date) => {
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

export const updateDailyTotals = async (userId, date) => {
  try {
    console.log('📊 Calculating daily nutrition totals for', date);
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
      
      for (const meal of Object.values(meals)) {
        const nutrition = meal.nutrition || {};
        const quantity = meal.quantity || 1;
        totals.calories += (nutrition.calories || 0) * quantity;
        totals.protein += (nutrition.protein || 0) * quantity;
        totals.carbohydrates += (nutrition.carbohydrates || 0) * quantity;
        totals.fat += (nutrition.fat || 0) * quantity;
        totals.fiber += (nutrition.fiber || 0) * quantity;
        totals.sugar += (nutrition.sugar || 0) * quantity;
      }
    }
    
    console.log('💾 Saving nutrition summary to Firebase...', totals);
    const summaryRef = ref(database, `users/${userId}/nutrition/${date}`);
    await set(summaryRef, {
      date,
      totals,
      lastUpdated: new Date().toISOString(),
    });
    console.log('✅ Nutrition summary saved to Firebase!', totals);
    
    return { success: true, data: totals };
  } catch (error) {
    console.error('❌ Error updating daily totals:', error);
    return { success: false, error };
  }
};

export const getNutritionByDateRange = async (
  userId,
  startDate,
  endDate
) => {
  try {
    const nutritionRef = ref(database, `users/${userId}/nutrition`);
    const snapshot = await get(nutritionRef);
    
    if (snapshot.exists()) {
      const allNutrition = snapshot.val();
      const filteredNutrition = {};
      
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

export const formatDateForDB = (date = new Date()) => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

export const calculateMealCategory = (hour) => {
  if (hour >= 6 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 17) return 'snack';
  if (hour >= 17 && hour < 22) return 'dinner';
  return 'snack';
};

export const syncLocalStorageToFirebase = async (
  userId,
  localMeals
) => {
  try {
    console.log('🔄 Syncing local meals to Firebase...', { userId, totalMeals: localMeals.length });
    for (const meal of localMeals) {
      const date = formatDateForDB(new Date(meal.timestamp));
      const mealsRef = ref(database, `users/${userId}/meals/${date}/${meal.id}`);
      await set(mealsRef, meal);
    }
    console.log(`✅ ${localMeals.length} meals synced to Firebase!`);
    
    // Update all daily totals
    const dates = new Set(
      localMeals.map(m => formatDateForDB(new Date(m.timestamp)))
    );
    
    console.log(`📊 Updating nutrition totals for ${dates.size} date(s)...`);
    for (const date of dates) {
      await updateDailyTotals(userId, date);
    }
    console.log('✅ All nutrition totals updated!');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error syncing to Firebase:', error);
    return { success: false, error };
  }
};

export const downloadDataFromFirebase = async (userId) => {
  try {
    const result = await getAllMeals(userId);
    if (result.success) {
      const meals = [];
      const allMeals = result.data;
      
      for (const [date, dateMeals] of Object.entries(allMeals)) {
        for (const meal of Object.values(dateMeals)) {
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
