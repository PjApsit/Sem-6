const GROQ_API_KEY = import.meta.env.VITE_GROK_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

/**
 * Send a general query to Groq (Llama) with user context
 * @param {string} question - The user's query
 * @param {Object} context - User profile and nutrition context
 * @returns {Promise<string>} Groq's response as a single paragraph
 */
export async function askGemini(question, context = {}) {
    try {
        const { user, todaysNutrition, dailyGoals } = context;

        let systemPrompt = "You are a personalized fitness and nutrition assistant for the 'AI Meal Coach' app. ";

        if (user) {
            systemPrompt += `The user is ${user.age} years old, weighs ${user.weight}kg, and is ${user.height}cm tall. Their goal is ${user.fitnessGoal}. `;
            if (user.dietaryRestrictions) {
                systemPrompt += `They have these dietary restrictions: ${user.dietaryRestrictions}. `;
            }
            if (user.allergens && user.allergens.length > 0) {
                systemPrompt += `They are allergic to: ${user.allergens.join(', ')}. `;
            }
        }

        if (todaysNutrition && dailyGoals) {
            systemPrompt += `Today they have consumed ${Math.round(todaysNutrition.calories)} out of ${dailyGoals.calories} kcal. `;
        }

        systemPrompt += "Always respond in exactly ONE concise paragraph. Do not use bullet points, numbered lists, or markdown headers. Keep your answer helpful, professional, and easy to read in a chat bubble.";

        const res = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: question },
                ],
                temperature: 0.7,
                max_tokens: 300,
            }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err?.error?.message || `Groq API error: ${res.status}`);
        }

        const data = await res.json();
        return data.choices?.[0]?.message?.content?.trim() || "I'm not sure how to answer that right now.";
    } catch (error) {
        console.error("Groq AI error:", error);
        if (error.message?.includes('429')) {
            return "The AI assistant is currently very busy. Please wait a moment and try again.";
        }
        return "I'm sorry, I'm having trouble thinking right now. Please try again later.";
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

        const res = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3,
                max_tokens: 400,
            }),
        });

        const data = await res.json();
        const text = data.choices?.[0]?.message?.content?.trim() || "";

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
