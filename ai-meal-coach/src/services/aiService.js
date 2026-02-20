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
 * Send a general query to GROQ with user context
 * @param {string} question - The user's query
 * @param {Object} context - User profile and nutrition context
 * @returns {Promise<string>} GROQ's response
 */
export async function askGroq(question, context = {}) {
    try {
        const { user, todaysNutrition, dailyGoals } = context;
        const apiKey = import.meta.env.VITE_GROQ_API_KEY;

        if (!apiKey) {
            throw new Error("GROQ API key missing");
        }

        let contextPrompt = "You are an expert fitness and nutrition coach. ";

        if (user) {
            contextPrompt += `The user is ${user.age}y/o, weighs ${user.weight}kg, and is ${user.height}cm tall. Their goal is ${user.fitnessGoal}. `;
            if (user.dietaryRestrictions) {
                contextPrompt += `Dietary restrictions: ${user.dietaryRestrictions}. `;
            }
            if (user.allergies && user.allergies.length > 0) {
                contextPrompt += `Allergies: ${user.allergies.join(', ')}. `;
            }
        }

        if (todaysNutrition && dailyGoals) {
            contextPrompt += `Consumption: ${Math.round(todaysNutrition.calories)}/${dailyGoals.calories} kcal. `;
        }

        const systemPrompt = `${contextPrompt} 
        Provide helpful, evidence-based, and practical nutrition/fitness advice. 
        Always use clean formatting:
        1. Use bullet points (using -) for all lists.
        2. EACH bullet point MUST be on its own new line.
        3. Use bolding (**text**) for important terms.
        4. Add a BLANK LINE between different sections or paragraphs.
        5. NEVER return a single solid block of text. Break it up.`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: question }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error(`GROQ API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "";
    } catch (error) {
        console.error("GROQ API error:", error);
        return null;
    }
}
