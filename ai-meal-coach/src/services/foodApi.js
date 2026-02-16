export const recognizeFood = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("http://127.0.0.1:5001/predict", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to recognize food");
  }

  const data = await response.json();

  // Backend returns:
  // { detected_foods: { apple: 2, banana: 1 } }

  const foods = data.detected_foods;

  if (!foods || Object.keys(foods).length === 0) {
    throw new Error("No food detected");
  }

  // Take first detected item (you can improve later)
  const firstFood = Object.keys(foods)[0];

  return {
    foodName: firstFood,
    confidence: 1.0 // you can later send real confidence from backend
  };
};
