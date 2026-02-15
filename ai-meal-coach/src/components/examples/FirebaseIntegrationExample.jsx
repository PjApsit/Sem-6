import React from 'react';
import { useUser } from '@/context/UserContext';
import { 
  getDailyMeals, 
  getDailyNutritionSummary, 
  formatDateForDB 
} from '@/services/firebaseService';

/**
 * Example component showing how to use Firebase integration
 */
export const FirebaseIntegrationExample = () => {
  const { user, allMeals, addMeal, removeMeal, getDailyNutrition } = useUser();
  const [dailyData, setDailyData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  // Example 1: Load today's meals and nutrition from Firebase
  const loadTodayData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const today = formatDateForDB(new Date());
      const result = await getDailyMeals(user.id, today);
      
      if (result.success) {
        setDailyData(result.data);
        console.log('Today\'s meals:', result.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Add meal with Firebase sync
  const handleAddMeal = async () => {
    const newMeal = {
      id: `meal_${Date.now()}`,
      name: 'Grilled Salmon',
      quantity: 1,
      category: 'dinner',
      timestamp: new Date().toISOString(),
      nutrition: {
        calories: 280,
        protein: 40,
        carbohydrates: 5,
        fat: 14,
        fiber: 0,
        sugar: 0,
      },
    };

    // This automatically:
    // 1. Updates local state
    // 2. Saves to localStorage
    // 3. Syncs to Firebase if online
    await addMeal(newMeal);
    
    console.log('Meal added and synced!');
  };

  // Example 3: Get daily nutrition summary
  const getDailyStats = async () => {
    const nutrition = await getDailyNutrition(new Date());
    console.log('Daily nutrition:', nutrition);
  };

  // Example 4: Remove meal with Firebase sync
  const handleRemoveMeal = async (mealId) => {
    // This automatically:
    // 1. Updates local state
    // 2. Updates localStorage
    // 3. Removes from Firebase if online
    await removeMeal(mealId);
    
    console.log('Meal removed and synced!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Firebase Integration Examples</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Load Today's Data</h3>
        <button onClick={loadTodayData} disabled={loading}>
          {loading ? 'Loading...' : 'Load Today\'s Meals'}
        </button>
        {dailyData && (
          <pre>{JSON.stringify(dailyData, null, 2)}</pre>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Add New Meal</h3>
        <button onClick={handleAddMeal}>
          Add Sample Meal
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Get Daily Nutrition Summary</h3>
        <button onClick={getDailyStats}>
          Get Today's Stats
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Current User Data</h3>
        <pre>{JSON.stringify(
          { 
            userId: user?.id, 
            name: user?.name,
            totalMeals: allMeals.length
          }, 
          null, 
          2
        )}</pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Today's Meals</h3>
        <ul>
          {allMeals
            .filter(m => new Date(m.timestamp).toDateString() === new Date().toDateString())
            .map(meal => (
              <li key={meal.id}>
                {meal.name} ({meal.nutrition.calories} cal)
                <button 
                  onClick={() => handleRemoveMeal(meal.id)}
                  style={{ marginLeft: '10px' }}
                >
                  Remove
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

/**
 * Usage in your app:
 * 
 * 1. Profile Auto-Sync:
 *    const { updateUser } = useUser();
 *    await updateUser({ weight: 75 }); // Auto-syncs to Firebase
 * 
 * 2. Meal Logging Auto-Sync:
 *    const { addMeal } = useUser();
 *    await addMeal(mealData); // Auto-syncs to Firebase
 * 
 * 3. Check Online Status:
 *    const { isOnlineMode } = useUser();
 *    // Data syncs when isOnlineMode becomes true
 * 
 * 4. Get Nutrition Summary:
 *    const { getDailyNutrition } = useUser();
 *    const summary = await getDailyNutrition(new Date());
 * 
 * 5. Manual Firebase Operations:
 *    import { getDailyMeals, getDailyNutritionSummary } from '@/services/firebaseService';
 */

export default FirebaseIntegrationExample;
