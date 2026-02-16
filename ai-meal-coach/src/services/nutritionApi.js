import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
});

/**
 * Fetch nutrition values for a food name using Gemini
 * @param {string} foodName
 * @returns {Promise<Object>} Nutrition JSON
 */
export async function getNutritionFromAI(foodName) {
  try {
    const prompt = `
You are a nutrition API.

Give estimated nutrition values for "${foodName}" per 100 grams.

Return ONLY valid JSON in this exact format:

{
  "foodName": "",
  "calories": number,
  "protein": number,
  "carbohydrates": number,
  "fat": number,
  "fiber": number,
  "sugar": number
}

Rules:
- Do not include explanation
- Do not include markdown
- Do not include text outside JSON
- All values must be numbers
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean possible markdown formatting
    const cleanedText = text.replace(/```json|```/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Nutrition fetch error:", error);
    return null;
  }
}
