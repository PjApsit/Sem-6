/**
 * Mock API Service
 * 
 * This file contains mock implementations of all API calls.
 * Replace these with actual FastAPI endpoints when ready.
 * 
 * BACKEND INTEGRATION TIPS:
 * 1. Replace the mock functions with fetch calls to your FastAPI backend
 * 2. Use environment variables for API base URL: import.meta.env.VITE_API_URL
 * 3. Add proper error handling and loading states
 * 4. Implement JWT token management in headers
 */

import { 
  UserProfile, 
  FoodItem, 
  FoodRecognitionResult, 
  NutritionInfo,
  DailyGoals,
  Recommendation,
  ChatMessage
} from '@/types/nutrition';

// Simulated delay to mimic API call
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// INDIAN FOOD NUTRITION DATABASE (Mock)
// ============================================
// TIP: Replace with actual database query to your nutrition dataset
// Consider using a PostgreSQL or MongoDB database with the IFCT (Indian Food Composition Tables)

export const indianFoodDatabase: FoodItem[] = [
  {
    id: '1',
    name: 'Roti (Chapati)',
    category: 'Bread',
    servingSize: '1 piece (40g)',
    nutrition: { calories: 120, protein: 3.5, carbohydrates: 22, fat: 2, fiber: 2.5 }
  },
  {
    id: '2',
    name: 'Rice (Steamed)',
    category: 'Grains',
    servingSize: '1 cup (150g)',
    nutrition: { calories: 206, protein: 4.3, carbohydrates: 45, fat: 0.4, fiber: 0.6 }
  },
  {
    id: '3',
    name: 'Dal Tadka',
    category: 'Lentils',
    servingSize: '1 bowl (150g)',
    nutrition: { calories: 150, protein: 9, carbohydrates: 20, fat: 4, fiber: 5 }
  },
  {
    id: '4',
    name: 'Paneer Butter Masala',
    category: 'Curry',
    servingSize: '1 bowl (200g)',
    nutrition: { calories: 350, protein: 14, carbohydrates: 12, fat: 28, fiber: 2 }
  },
  {
    id: '5',
    name: 'Chicken Curry',
    category: 'Non-Veg',
    servingSize: '1 bowl (200g)',
    nutrition: { calories: 280, protein: 25, carbohydrates: 8, fat: 16, fiber: 1.5 }
  },
  {
    id: '6',
    name: 'Idli',
    category: 'South Indian',
    servingSize: '2 pieces (80g)',
    nutrition: { calories: 78, protein: 2, carbohydrates: 16, fat: 0.4, fiber: 0.8 }
  },
  {
    id: '7',
    name: 'Dosa (Plain)',
    category: 'South Indian',
    servingSize: '1 piece (100g)',
    nutrition: { calories: 168, protein: 4, carbohydrates: 28, fat: 4.5, fiber: 1.2 }
  },
  {
    id: '8',
    name: 'Samosa',
    category: 'Snacks',
    servingSize: '1 piece (80g)',
    nutrition: { calories: 262, protein: 4, carbohydrates: 28, fat: 15, fiber: 2 }
  },
  {
    id: '9',
    name: 'Biryani (Chicken)',
    category: 'Rice Dish',
    servingSize: '1 plate (300g)',
    nutrition: { calories: 490, protein: 22, carbohydrates: 55, fat: 18, fiber: 2 }
  },
  {
    id: '10',
    name: 'Chole (Chickpea Curry)',
    category: 'Curry',
    servingSize: '1 bowl (200g)',
    nutrition: { calories: 220, protein: 12, carbohydrates: 32, fat: 6, fiber: 8 }
  },
  {
    id: '11',
    name: 'Paratha (Aloo)',
    category: 'Bread',
    servingSize: '1 piece (100g)',
    nutrition: { calories: 260, protein: 5, carbohydrates: 32, fat: 12, fiber: 2 }
  },
  {
    id: '12',
    name: 'Palak Paneer',
    category: 'Curry',
    servingSize: '1 bowl (200g)',
    nutrition: { calories: 280, protein: 16, carbohydrates: 10, fat: 20, fiber: 4 }
  },
  {
    id: '13',
    name: 'Masala Dosa',
    category: 'South Indian',
    servingSize: '1 piece (150g)',
    nutrition: { calories: 250, protein: 6, carbohydrates: 35, fat: 10, fiber: 3 }
  },
  {
    id: '14',
    name: 'Rajma (Kidney Bean Curry)',
    category: 'Curry',
    servingSize: '1 bowl (200g)',
    nutrition: { calories: 210, protein: 14, carbohydrates: 34, fat: 3, fiber: 10 }
  },
  {
    id: '15',
    name: 'Poha',
    category: 'Breakfast',
    servingSize: '1 plate (150g)',
    nutrition: { calories: 180, protein: 4, carbohydrates: 32, fat: 5, fiber: 2 }
  },
  {
    id: '16',
    name: 'Upma',
    category: 'Breakfast',
    servingSize: '1 bowl (150g)',
    nutrition: { calories: 195, protein: 5, carbohydrates: 28, fat: 7, fiber: 2 }
  },
  {
    id: '17',
    name: 'Egg Bhurji',
    category: 'Breakfast',
    servingSize: '2 eggs (120g)',
    nutrition: { calories: 220, protein: 14, carbohydrates: 3, fat: 17, fiber: 0.5 }
  },
  {
    id: '18',
    name: 'Lassi (Sweet)',
    category: 'Beverages',
    servingSize: '1 glass (250ml)',
    nutrition: { calories: 180, protein: 6, carbohydrates: 28, fat: 5, fiber: 0 }
  },
  {
    id: '19',
    name: 'Gulab Jamun',
    category: 'Desserts',
    servingSize: '2 pieces (60g)',
    nutrition: { calories: 320, protein: 4, carbohydrates: 45, fat: 14, fiber: 0.5 }
  },
  {
    id: '20',
    name: 'Tandoori Chicken',
    category: 'Non-Veg',
    servingSize: '2 pieces (200g)',
    nutrition: { calories: 260, protein: 35, carbohydrates: 5, fat: 12, fiber: 0.5 }
  }
];

// ============================================
// AUTHENTICATION APIs (Mock)
// ============================================
// TIP: Replace with FastAPI JWT authentication
// POST /api/auth/login
// POST /api/auth/register
// POST /api/auth/refresh

export const mockLogin = async (email: string, password: string): Promise<{ token: string; user: UserProfile }> => {
  await delay(800);
  
  // TIP: Replace with actual API call:
  // const response = await fetch(`${API_URL}/auth/login`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password })
  // });
  // return response.json();
  
  // Mock response
  const mockUser: UserProfile = {
    id: 'user_1',
    name: 'Demo User',
    email: email,
    age: 28,
    gender: 'male',
    height: 175,
    weight: 72,
    activityLevel: 'moderate',
    goal: 'weight_loss',
    dietPreference: 'vegetarian',
    allergies: []
  };
  
  return { token: 'mock_jwt_token_xyz', user: mockUser };
};

export const mockRegister = async (userData: Partial<UserProfile> & { password: string }): Promise<{ token: string; user: UserProfile }> => {
  await delay(1000);
  
  // TIP: POST /api/auth/register
  const newUser: UserProfile = {
    id: `user_${Date.now()}`,
    name: userData.name || 'New User',
    email: userData.email || '',
    age: userData.age || 25,
    gender: userData.gender || 'male',
    height: userData.height || 170,
    weight: userData.weight || 70,
    activityLevel: userData.activityLevel || 'moderate',
    goal: userData.goal || 'maintain',
    dietPreference: userData.dietPreference || 'vegetarian',
    allergies: userData.allergies || []
  };
  
  return { token: 'mock_jwt_token_new', user: newUser };
};

// ============================================
// FOOD RECOGNITION API (Mock)
// ============================================
// TIP: Replace with your ML model endpoint
// POST /api/ml/recognize-food
// Send image as base64 or multipart form data

export const recognizeFood = async (imageFile: File): Promise<FoodRecognitionResult> => {
  await delay(1500); // Simulate ML processing time
  
  // TIP: Replace with actual ML API call:
  // const formData = new FormData();
  // formData.append('image', imageFile);
  // const response = await fetch(`${API_URL}/ml/recognize-food`, {
  //   method: 'POST',
  //   headers: { 'Authorization': `Bearer ${token}` },
  //   body: formData
  // });
  // return response.json();
  
  // Mock: Return random food from database
  const randomIndex = Math.floor(Math.random() * indianFoodDatabase.length);
  const recognizedFood = indianFoodDatabase[randomIndex];
  
  return {
    foodName: recognizedFood.name,
    confidence: 0.85 + Math.random() * 0.12, // 85-97% confidence
    alternativePredictions: [
      { name: indianFoodDatabase[(randomIndex + 1) % indianFoodDatabase.length].name, confidence: 0.65 },
      { name: indianFoodDatabase[(randomIndex + 2) % indianFoodDatabase.length].name, confidence: 0.45 }
    ]
  };
};

// ============================================
// NUTRITION LOOKUP API
// ============================================
// TIP: GET /api/nutrition/food/{food_name}

export const getNutritionInfo = async (foodName: string): Promise<FoodItem | null> => {
  await delay(300);
  
  // TIP: Replace with database query
  const food = indianFoodDatabase.find(
    f => f.name.toLowerCase().includes(foodName.toLowerCase())
  );
  
  return food || null;
};

export const searchFoods = async (query: string): Promise<FoodItem[]> => {
  await delay(200);
  
  if (!query.trim()) return [];
  
  return indianFoodDatabase.filter(
    f => f.name.toLowerCase().includes(query.toLowerCase()) ||
         f.category.toLowerCase().includes(query.toLowerCase())
  );
};

// ============================================
// CALORIE CALCULATION (Mifflin-St Jeor)
// ============================================
// TIP: This can stay on frontend or move to backend

export const calculateDailyGoals = (profile: UserProfile): DailyGoals => {
  // Mifflin-St Jeor BMR Formula
  let bmr: number;
  
  if (profile.gender === 'male') {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  } else {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  }
  
  // Activity multiplier
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  let tdee = bmr * activityMultipliers[profile.activityLevel];
  
  // Adjust for goal
  switch (profile.goal) {
    case 'weight_loss':
      tdee -= 500; // 500 kcal deficit
      break;
    case 'weight_gain':
      tdee += 300; // 300 kcal surplus
      break;
  }
  
  // Macro distribution (can be customized)
  // Protein: 25-30%, Carbs: 45-50%, Fat: 25-30%
  const calories = Math.round(tdee);
  const protein = Math.round((calories * 0.28) / 4); // 4 cal per gram
  const carbohydrates = Math.round((calories * 0.47) / 4); // 4 cal per gram
  const fat = Math.round((calories * 0.25) / 9); // 9 cal per gram
  const fiber = 30; // Standard recommendation
  
  return { calories, protein, carbohydrates, fat, fiber };
};

// ============================================
// RECOMMENDATION ENGINE (Rule-based)
// ============================================
// TIP: Can be enhanced with ML on backend

export const generateRecommendations = (
  consumed: NutritionInfo,
  goals: DailyGoals,
  profile: UserProfile
): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  const proteinPercent = (consumed.protein / goals.protein) * 100;
  const carbsPercent = (consumed.carbohydrates / goals.carbohydrates) * 100;
  const fatPercent = (consumed.fat / goals.fat) * 100;
  const caloriesPercent = (consumed.calories / goals.calories) * 100;
  
  // Protein recommendations
  if (proteinPercent < 50) {
    const highProteinFoods = indianFoodDatabase
      .filter(f => f.nutrition.protein >= 10)
      .filter(f => profile.dietPreference === 'vegetarian' ? f.category !== 'Non-Veg' : true);
    
    recommendations.push({
      type: 'protein',
      message: 'Your protein intake is low today. Consider adding high-protein foods to your next meal.',
      suggestedFoods: highProteinFoods.slice(0, 3),
      priority: 'high'
    });
  }
  
  // Carbs warning
  if (carbsPercent > 90 && caloriesPercent < 80) {
    recommendations.push({
      type: 'carbs',
      message: 'You\'re reaching your carb limit. Try protein-rich or fiber-rich foods for remaining meals.',
      priority: 'medium'
    });
  }
  
  // Fat warning
  if (fatPercent > 85) {
    recommendations.push({
      type: 'fat',
      message: 'Fat intake is close to your daily limit. Choose leaner options for upcoming meals.',
      priority: 'high'
    });
  }
  
  // Calorie guidance for weight loss
  if (profile.goal === 'weight_loss' && caloriesPercent > 95) {
    recommendations.push({
      type: 'calories',
      message: 'You\'re almost at your calorie target. If you need a snack, try fruits or vegetables.',
      priority: 'medium'
    });
  }
  
  // General positive feedback
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'general',
      message: 'Great job! You\'re on track with your nutrition goals today. Keep it up! 🌟',
      priority: 'low'
    });
  }
  
  return recommendations;
};

// ============================================
// AI CHAT API (Mock)
// ============================================
// TIP: Replace with your AI/LLM endpoint
// POST /api/chat/message

export const sendChatMessage = async (
  message: string,
  profile: UserProfile,
  conversationHistory: ChatMessage[]
): Promise<string> => {
  await delay(1200);
  
  // TIP: Replace with actual AI API call:
  // const response = await fetch(`${API_URL}/chat/message`, {
  //   method: 'POST',
  //   headers: { 
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${token}`
  //   },
  //   body: JSON.stringify({
  //     message,
  //     userProfile: profile,
  //     history: conversationHistory
  //   })
  // });
  // return response.json();
  
  // Mock responses based on keywords
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('dinner') || lowerMessage.includes('suggest')) {
    if (profile.dietPreference === 'vegetarian') {
      return "For a healthy vegetarian dinner, I recommend:\n\n🥗 **Option 1:** Dal Tadka with 2 Rotis and a side of Palak Paneer\n• Calories: ~470 kcal\n• High in protein and fiber\n\n🍛 **Option 2:** Chole with steamed rice and cucumber raita\n• Calories: ~450 kcal\n• Great source of plant protein\n\nBoth options align well with your weight loss goal!";
    }
    return "For dinner tonight, I suggest:\n\n🍗 **Option 1:** Tandoori Chicken (2 pieces) with Roti and Dal\n• Calories: ~460 kcal\n• High protein, moderate carbs\n\n🥘 **Option 2:** Chicken Curry with brown rice\n• Calories: ~480 kcal\n• Balanced macros\n\nThese fit well within your remaining calorie budget!";
  }
  
  if (lowerMessage.includes('protein') || lowerMessage.includes('high protein')) {
    const proteinFoods = profile.dietPreference === 'vegetarian' 
      ? "Paneer (25g/100g), Dal (9g/bowl), Chole (12g/bowl), Eggs if eggetarian (6g/egg)"
      : "Chicken (25g/100g), Eggs (6g/egg), Paneer (25g/100g), Fish (20g/100g)";
    
    return `Here are high-protein Indian foods for you:\n\n💪 **Top Picks:**\n${proteinFoods}\n\n**Tip:** Combining dal with rice creates a complete protein with all essential amino acids!`;
  }
  
  if (lowerMessage.includes('weight loss') || lowerMessage.includes('lose weight')) {
    return "Here are my top weight loss tips tailored for you:\n\n1️⃣ **Start your day right:** Poha or Upma (180-195 kcal) with vegetables\n\n2️⃣ **Lunch:** Fill half your plate with veggies, quarter with dal/protein, quarter with roti/rice\n\n3️⃣ **Smart snacking:** Sprouts chaat, roasted makhana, or fruit\n\n4️⃣ **Dinner:** Finish eating 2-3 hours before bed\n\n5️⃣ **Hydration:** Drink buttermilk or coconut water instead of packaged juices\n\nYour current deficit of 500 kcal/day should help you lose ~0.5kg per week safely! 📉";
  }
  
  if (lowerMessage.includes('breakfast')) {
    return "Great breakfast options for your goals:\n\n🌅 **Light & Nutritious:**\n• 2 Idlis with sambar (160 kcal)\n• Poha with peanuts (180 kcal)\n\n🍳 **Protein-Packed:**\n• Egg Bhurji with 1 Roti (340 kcal)\n• Moong Dal Chilla (150 kcal)\n\n🥣 **Filling:**\n• Upma with vegetables (195 kcal)\n• Oats with milk and fruits (220 kcal)\n\nI recommend starting your day with protein to stay fuller longer!";
  }
  
  // Default response
  return "I'm your AI nutrition assistant! I can help you with:\n\n• 🍽️ Meal suggestions based on your preferences\n• 📊 Nutrition advice for your goals\n• 🥗 High-protein or low-carb recommendations\n• ⚖️ Weight management tips\n\nWhat would you like to know about your diet today?";
};

// ============================================
// MEAL LOGGING API (Mock)
// ============================================
// TIP: POST /api/meals/log, GET /api/meals/daily

export const logMeal = async (
  foodItem: FoodItem,
  quantity: number,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
): Promise<{ success: boolean; mealId: string }> => {
  await delay(300);
  
  // TIP: Replace with database insert
  return {
    success: true,
    mealId: `meal_${Date.now()}`
  };
};
