export const sendChatMessage = async (message, userId = "default_user") => {
  try {
    const response = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, user_id: userId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error calling backend:", error);
    return { response: "Failed to connect to the backend." };
  }
};

/**
 * Generate diet plan from user profile using chatbot model
 * @param {Object} userProfile - User profile object with fitness info
 * @returns {Promise<Object>} Diet plan data
 */
export const getDietPlan = async (userProfile) => {
  if (!userProfile) {
    throw new Error("User profile is required");
  }

  try {
    const userId = userProfile.id || `user_${Date.now()}`;
    
    // Format user profile for chatbot
    const profileMessage = formatProfileForChatbot(userProfile);
    
    // Send profile information to chatbot
    const response = await sendChatMessage(profileMessage, userId);
    
    if (!response || response.status === "error") {
      throw new Error(response.error || "Failed to generate diet plan");
    }

    // Parse the chatbot response and extract meal plan
    const dietPlanData = parseChatbotResponse(response, userProfile);
    
    return dietPlanData;
  } catch (error) {
    console.error("Error getting diet plan:", error);
    throw error;
  }
};

/**
 * Format user profile into messages for the chatbot
 * @param {Object} userProfile - User profile from signup
 * @returns {string} Formatted message for chatbot
 */
const formatProfileForChatbot = (userProfile) => {
  // Build a single message with all user info
  const messages = [];
  
  // Goal
  if (userProfile.fitnessGoal) {
    messages.push(userProfile.fitnessGoal);
  }
  
  // Weight
  if (userProfile.weight) {
    messages.push(String(userProfile.weight));
  }
  
  // Height
  if (userProfile.height) {
    messages.push(String(userProfile.height));
  }
  
  // Age
  if (userProfile.age) {
    messages.push(String(userProfile.age));
  }
  
  // Dietary preference
  if (userProfile.dietaryPreference) {
    messages.push(userProfile.dietaryPreference);
  } else {
    messages.push("non-veg");
  }
  
  // Activity level
  if (userProfile.activityLevel) {
    messages.push(userProfile.activityLevel);
  }
  
  return messages.join(" ");
};

/**
 * Parse chatbot response and extract meal plan
 * @param {Object} response - Response from chatbot API
 * @param {Object} userProfile - User profile
 * @returns {Object} Formatted diet plan
 */
const parseChatbotResponse = (response, userProfile) => {
  try {
    const responseText = response.response || response.chatbot_message || "";
    
    return {
      week: response.week || 1,
      fitness_goal: userProfile.fitnessGoal || "maintenance",
      target_calories: response.target_calories || 2000,
      target_exercise_minutes: response.target_exercise_minutes || 150,
      protein_target: response.protein_target || 150,
      meals: parseMealsFromResponse(responseText),
      recommendations: extractRecommendations(responseText),
      raw_response: responseText,
      state: response.state,
      generated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error parsing chatbot response:", error);
    return {
      week: 1,
      fitness_goal: userProfile.fitnessGoal || "maintenance",
      target_calories: 2000,
      target_exercise_minutes: 150,
      protein_target: 150,
      meals: {},
      recommendations: "Unable to parse meal plan details",
      raw_response: response.response,
    };
  }
};

/**
 * Extract meal information from response text
 * @param {string} text - Response text from chatbot
 * @returns {Object} Parsed meals
 */
const parseMealsFromResponse = (text) => {
  const meals = {
    breakfast: { total_calories: 500, total_protein_g: 20, total_carbs_g: 65, total_fat_g: 15, foods: [] },
    lunch: { total_calories: 650, total_protein_g: 35, total_carbs_g: 75, total_fat_g: 20, foods: [] },
    dinner: { total_calories: 600, total_protein_g: 40, total_carbs_g: 60, total_fat_g: 18, foods: [] },
    snack: { total_calories: 200, total_protein_g: 10, total_carbs_g: 30, total_fat_g: 5, foods: [] },
  };

  // Basic parsing - look for meal sections in the response
  const mealPatterns = {
    breakfast: /breakfast[\s\S]*?(?=lunch|$)/i,
    lunch: /lunch[\s\S]*?(?=dinner|$)/i,
    dinner: /dinner[\s\S]*?(?=snack|$)/i,
    snack: /snack[\s\S]*?(?=$)/i,
  };

  Object.entries(mealPatterns).forEach(([mealType, pattern]) => {
    const mealMatch = text.match(pattern);
    if (mealMatch) {
      // Extract food items (simplified)
      const foodMatches = mealMatch[0].match(/→\s*(\d+(?:\.\d+)?)g\s+([^\n]+)/g) || [];
      meals[mealType].foods = foodMatches.map((match) => {
        const [, portion, name] = match.match(/→\s*(\d+(?:\.\d+)?)g\s+([^\n]+)/) || [];
        return {
          name: name?.trim() || "Item",
          portion_g: portion ? parseInt(portion) : 100,
          calories: 150,
          protein: 10,
        };
      });
    }
  });

  return meals;
};

/**
 * Extract recommendations from chatbot response
 * @param {string} text - Response text
 * @returns {string} Recommendations text
 */
const extractRecommendations = (text) => {
  const tipMatch = text.match(/(?:tip|pro tip|note)[\s\S]*?(?:\n\n|$)/i);
  return tipMatch ? tipMatch[0].trim() : "Follow your meal plan consistently for best results!";
};

/**
 * Get food recommendations from chatbot based on nutrition gaps
 * Uses chatbot model to suggest foods for specific nutrition needs
 * @param {Object} userProfile - User profile
 * @param {Object} nutritionGaps - What's missing (protein, carbs, fat, calories)
 * @returns {Promise<Array>} Suggested foods from chatbot
 */
export const getFoodRecommendations = async (userProfile, nutritionGaps) => {
  try {
    if (!userProfile) {
      return [];
    }

    // Build a request message for the chatbot based on nutrition gaps
    const gapMessages = [];
    if (nutritionGaps.protein > 0) {
      gapMessages.push(`Need ${nutritionGaps.protein}g more protein`);
    }
    if (nutritionGaps.carbs > 0) {
      gapMessages.push(`Need ${nutritionGaps.carbs}g more carbs`);
    }
    if (nutritionGaps.fat > 0) {
      gapMessages.push(`Need ${nutritionGaps.fat}g more fat`);
    }
    if (nutritionGaps.calories > 0) {
      gapMessages.push(`Need ${nutritionGaps.calories}% more calories`);
    }

    if (gapMessages.length === 0) {
      return [];
    }

    const foodRequest = `Suggest foods for: ${gapMessages.join(", ")}`;
    const userId = userProfile.id || `user_${Date.now()}`;

    // Call chatbot to get food suggestions
    const response = await sendChatMessage(foodRequest, userId);

    // Extract food names from chatbot response
    const foods = extractFoodNames(response.response || response.chatbot_message || "");
    
    return foods.map(name => ({
      id: name.toLowerCase().replace(/\s+/g, '_'),
      name: name,
    }));
  } catch (error) {
    console.error("Error getting food recommendations from chatbot:", error);
    return [];
  }
};

/**
 * Extract food names from chatbot text response
 * Looks for food mentions in the response
 * @param {string} text - Response text from chatbot
 * @returns {Array<string>} Food names
 */
const extractFoodNames = (text) => {
  const foods = [];
  
  // Pattern 1: Food mentions with bullets or arrows
  const bulletedFoods = text.match(/[•→\-]\s*([A-Za-z\s]+)/g) || [];
  bulletedFoods.forEach(match => {
    const name = match.replace(/[•→\-\(]/g, '').trim();
    if (name.length > 2 && name.length < 50) {
      foods.push(name);
    }
  });

  // Pattern 2: Common food names mentioned in sentences
  const commonFoods = [
    'chicken', 'rice', 'wheat', 'dal', 'paneer', 'fish', 'egg', 'milk',
    'yogurt', 'spinach', 'broccoli', 'beans', 'lentils', 'peas', 'carrots',
    'tomato', 'onion', 'garlic', 'ginger', 'curd', 'cheese', 'meat',
    'turkey', 'beef', 'tofu', 'nuts', 'seeds', 'almonds', 'walnut',
    'apple', 'banana', 'orange', 'berries', 'melon', 'papaya', 'mango',
    'whole wheat', 'brown rice', 'oats', 'quinoa', 'barley'
  ];

  const textLower = text.toLowerCase();
  commonFoods.forEach(food => {
    if (textLower.includes(food) && !foods.find(f => f.toLowerCase() === food)) {
      foods.push(food.charAt(0).toUpperCase() + food.slice(1));
    }
  });

  // Return unique foods, max 4
  const uniqueFoods = [...new Set(foods)];
  return uniqueFoods.slice(0, 4);
};
