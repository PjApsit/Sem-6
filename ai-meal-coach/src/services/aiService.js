import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
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
