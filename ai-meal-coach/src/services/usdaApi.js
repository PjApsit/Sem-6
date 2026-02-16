const API_KEY = import.meta.env.VITE_USDA_API_KEY;

export const searchUSDAFoods = async (query) => {
    console.log("Searching USDA for:", query);
  try {
    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: query,
          pageSize: 5
        })
      }
    );

    const data = await response.json();


   
    if (!data.foods) return [];

    return data.foods.map(food => ({
      id: food.fdcId,
      name: food.description,
      category: food.foodCategory,
      nutrition: {
        calories: getNutrientValue(food, 1008) || 0,       // Energy
        protein: getNutrientValue(food, 1003) || 0,        // Protein
        fat: getNutrientValue(food, 1004) || 0,            // Total Fat
        carbohydrates: getNutrientValue(food, 1005) || 0,  // Carbs - normalized to match schema
        fiber: getNutrientValue(food, 1079) || 0           // Fiber - added with fallback to 0
      },
      servingSize: "100g"
    }));

  } catch (error) {
    console.error("USDA API Error:", error);
    return [];
  }
};

// Helper to extract nutrient value
const getNutrientValue = (food, nutrientId) => {
  const nutrient = food.foodNutrients?.find(
    n => n.nutrientId === nutrientId
  );
  return nutrient ? nutrient.value : 0;
};
