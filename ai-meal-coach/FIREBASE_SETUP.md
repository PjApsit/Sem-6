# Firebase Integration Setup Guide

## Overview
This app now integrates Firebase Realtime Database to store:
- **User Profile Data** - Name, age, weight, height, dietary preferences, allergens
- **Daily Meal Entries** - Each meal logged with nutrition data (calories, protein, carbs, fat, fiber, sugar)
- **Daily Nutrition Totals** - Aggregated nutrition summary by date
- **Automatic Sync** - Data syncs between local storage and Firebase when online

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a new project" or select existing project
3. Enter project name (e.g., "ai-meal-coach")
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Set Up Realtime Database

1. In Firebase Console, go to **Build** → **Realtime Database**
2. Click **Create Database**
3. Choose location (closest to your users)
4. Start in **Test Mode** (for development) or **Production Mode** with these rules:

### Production Database Rules (Recommended)
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        "profile": {
          ".validate": "newData.hasChildren(['name', 'email', 'age'])"
        },
        "meals": {
          "$date": {
            ".validate": "newData.hasChildren(['timestamp', 'nutrition'])"
          }
        },
        "nutrition": {
          "$date": {
            ".validate": "newData.hasChildren(['totals', 'date'])"
          }
        }
      }
    }
  }
}
```

## Step 3: Get Firebase Credentials

1. In Firebase Console, click **Project Settings** (gear icon)
2. Go to **Your Apps** section
3. Click **Web** icon to add a web app
4. Register app and copy the config object
5. You'll see credentials like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456",
  databaseURL: "https://your-project.firebaseio.com"
};
```

## Step 4: Configure Environment Variables

1. Open `.env.local` in the project root
2. Add your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

## Step 5: Install Firebase Package

Run in your terminal:
```bash
npm install firebase
```

Or with Bun:
```bash
bun install firebase
```

## Step 6: Update User ID (Important!)

The current app uses localStorage-based authentication. To fully integrate Firebase, each user needs a unique ID. When creating a user account, ensure they have an `id` field:

**In Onboarding.jsx**, modify `completeOnboarding()`:
```javascript
const user = {
  id: `user_${Date.now()}`, // ✅ Generate unique ID
  ...userData,
};
```

Or better yet, use Firebase Authentication (optional upgrade):
```javascript
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebaseConfig';

// In signup handler
const result = await createUserWithEmailAndPassword(auth, email, password);
user.id = result.user.uid; // Use Firebase UID
```

## Features Included

### 1. **User Profile Sync**
```javascript
import { updateUser } = useUser();

// When user edits profile, it auto-syncs to Firebase
await updateUser({ weight: 75, age: 28 });
```

### 2. **Meal Logging with Auto-Sync**
```javascript
const { addMeal } = useUser();

// Add meal - automatically saves to Firebase if online
await addMeal({
  id: 'meal_123',
  name: 'Grilled Chicken',
  quantity: 1,
  nutrition: {
    calories: 250,
    protein: 35,
    carbohydrates: 0,
    fat: 12,
    fiber: 0,
    sugar: 0
  },
  timestamp: new Date().toISOString(),
  category: 'lunch'
});
```

### 3. **Daily Nutrition Summary**
```javascript
import { getDailyNutritionSummary } from '@/services/firebaseService';

const summary = await getDailyNutritionSummary(userId, '2026-02-15');
// Returns: { date, totals: { calories, protein, carbs, fat, fiber, sugar } }
```

### 4. **Offline Support**
- All operations work offline using localStorage
- Data syncs to Firebase when connection is restored
- Check online status: `isOnlineMode` from useUser hook

### 5. **Data Export**
```javascript
import { downloadDataFromFirebase } from '@/services/firebaseService';

const allMeals = await downloadDataFromFirebase(userId);
// Download all meal history from Firebase
```

## Database Structure

```
users/
  {userId}/
    profile/
      name: "John Doe"
      email: "john@example.com"
      age: 28
      weight: 75
      height: 180
      activityLevel: "moderate"
      goal: "maintain"
      dietPreference: "vegetarian"
      dietaryRestrictions: "Low sodium"
      allergens: ["dairy", "nuts"]
      updatedAt: "2026-02-15T10:30:00Z"
    
    meals/
      2026-02-15/
        meal_123/
          id: "meal_123"
          name: "Grilled Chicken"
          category: "lunch"
          quantity: 1
          nutrition:
            calories: 250
            protein: 35
            carbohydrates: 0
            fat: 12
            fiber: 0
            sugar: 0
          timestamp: "2026-02-15T12:30:00Z"
      
      2026-02-14/
        meal_122/
          ...
    
    nutrition/
      2026-02-15/
        date: "2026-02-15"
        totals:
          calories: 2100
          protein: 120
          carbohydrates: 250
          fat: 60
          fiber: 30
          sugar: 50
        lastUpdated: "2026-02-15T20:45:00Z"
```

## Testing Firebase Connection

Add this to any component to test:
```javascript
import { getDailyMeals } from '@/services/firebaseService';
import { useUser } from '@/context/UserContext';

export const TestFirebase = () => {
  const { user } = useUser();
  
  const testConnection = async () => {
    if (user?.id) {
      const result = await getDailyMeals(user.id, '2026-02-15');
      console.log('Firebase test:', result);
    }
  };
  
  return <button onClick={testConnection}>Test Firebase</button>;
};
```

## Troubleshooting

### "Permission denied" Error
- Check database rules - ensure they match the production rules above
- Verify user ID is being set correctly
- Check Firebase Project Settings for correct database URL

### Data Not Syncing
- Verify `.env.local` credentials are correct
- Check browser console for Firebase errors
- Ensure user is online: `isOnlineMode` from useUser hook
- Check Firebase > Rules > Simulating with debug token

### Slow Performance
- Consider pagination for large datasets
- Use date range queries instead of fetching all data
- Add indexes to frequently queried fields in Firebase

## Next Steps

1. ✅ Set up Firebase project and database
2. ✅ Add Firebase credentials to `.env.local`
3. ✅ Run `npm install firebase`
4. ✅ Update user profile to use Firebase sync
5. (Optional) Set up Firebase Authentication for better security
6. (Optional) Add meal history/analytics views using Firebase data

## API Reference

See `src/services/firebaseService.ts` for all available functions:
- `saveUserProfile()`
- `updateUserProfile()`
- `addMealEntry()`
- `removeMealEntry()`
- `getDailyMeals()`
- `getAllMeals()`
- `getDailyNutritionSummary()`
- `syncLocalStorageToFirebase()`
- And more...
