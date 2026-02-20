import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-001",
});

/**
 * Send a general query to Gemini with user context
 * @param {string} question - The user's query
 * @param {Object} context - User profile and nutrition context
 * @returns {Promise<string>} Gemini's response
 */
export async function askGemini(question, context = {}) {
    try {
        const { user, todaysNutrition, dailyGoals } = context;

        let contextPrompt = "You are a personalized fitness and nutrition assistant for the 'AI Meal Coach' app. ";

        if (user) {
            contextPrompt += `The user is ${user.age} years old, weighs ${user.weight}kg, and is ${user.height}cm tall. Their goal is ${user.fitnessGoal}. `;
            if (user.dietaryRestrictions) {
                contextPrompt += `They have these dietary restrictions: ${user.dietaryRestrictions}. `;
            }
            if (user.allergens && user.allergens.length > 0) {
                contextPrompt += `They are allergic to: ${user.allergens.join(', ')}. `;
            }
        }

        if (todaysNutrition && dailyGoals) {
            contextPrompt += `Today they have consumed ${Math.round(todaysNutrition.calories)} out of ${dailyGoals.calories} kcal. `;
        }

        const fullPrompt = `${contextPrompt}\n\nUser Question: ${question}\n\nBe helpful, concise, and professional. Avoid medical advice unless it's general nutrition/fitness knowledge.`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini AI error:", error);

        // Handle quota/rate limit errors specifically
        if (error.status === 429 || error.message?.includes('429')) {
            return "The AI assistant is currently very busy (quota exceeded). Please wait a minute and try again, or ask a simpler question!";
        }

        return "I'm sorry, I'm having trouble thinking right now. Please try 'Reset' again later.";
    }
}

/**
 * Get smart recommendations based on user profile and daily progress
 * @param {Object} user - User profile
 * @param {Object} dailyGoals - Daily nutrition goals
 * @param {Object} consumed - Today's consumed nutrition
 * @returns {Promise<Object>} Recommendation object with message and priority
 */
export async function getSmartRecommendations(user, dailyGoals, consumed) {
    try {
        const prompt = `
        Analyze this user's nutrition data for today and provide ONE smart recommendation.
        
        User Profile:
        - Goal: ${user.fitnessGoal}
        - Restrictions: ${user.dietaryRestrictions || 'None'}
        - Allergies: ${user.allergens?.join(', ') || 'None'}
        
        Current Progress (Today):
        - Calories: ${Math.round(consumed.calories)} / ${dailyGoals.calories}
        - Protein: ${Math.round(consumed.protein)} / ${dailyGoals.protein}g
        - Carbs: ${Math.round(consumed.carbohydrates)} / ${dailyGoals.carbohydrates}g
        - Fat: ${Math.round(consumed.fat)} / ${dailyGoals.fat}g
        
        Task:
        1. Identify the most critical gap or success (e.g., low protein, high fat, perfect balance).
        2. Create a helpful, encouraging message (max 2 sentences).
        3. Suggest exactly 3 specific food items that help address the gap (or healthy treats if balanced).
        4. Assign a priority: 'high' (alert), 'medium' (warning), 'low' (success/info).
        
        Output JSON ONLY:
        {
            "priority": "high" | "medium" | "low",
            "message": "Your message here...",
            "suggestedFoods": [
                { "name": "Food 1", "id": "food_1" },
                { "name": "Food 2", "id": "food_2" },
                { "name": "Food 3", "id": "food_3" }
            ]
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from potential markdown code blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(text);

    } catch (error) {
        console.error("Smart Recs Error:", error);
        return null; // Fallback will be handled by component
    }
}
