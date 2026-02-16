// User Profile Types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'weight_loss' | 'maintain' | 'weight_gain';
  dietPreference: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'eggetarian';
  allergies: string[];
}

// Nutrition Types
export interface NutritionInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  servingSize: string;
  nutrition: NutritionInfo;
  imageUrl?: string;
}

export interface MealEntry {
  id: string;
  userId: string;
  foodItem: FoodItem;
  quantity: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: Date;
  imageUrl?: string;
}

// Daily Summary
export interface DailySummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  meals: MealEntry[];
}

// Goals based on profile
export interface DailyGoals {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
}

// Food Recognition Result
export interface FoodRecognitionResult {
  foodName: string;
  confidence: number;
  alternativePredictions?: { name: string; confidence: number }[];
}

// Chat Message
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Recommendation
export interface Recommendation {
  type: 'protein' | 'carbs' | 'fat' | 'calories' | 'general';
  message: string;
  suggestedFoods?: FoodItem[];
  priority: 'low' | 'medium' | 'high';
}
