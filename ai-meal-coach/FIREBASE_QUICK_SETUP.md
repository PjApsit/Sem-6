# ✅ Firebase Setup Checklist

## Your `.env.local` is Already Complete! ✨

Your Firebase credentials are correctly configured:
```
VITE_FIREBASE_API_KEY=AIzaSyCPw6rqHGyxgQprj6suxJqo84vhYlvxSYE
VITE_FIREBASE_AUTH_DOMAIN=caldata-abf0f.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=caldata-abf0f
VITE_FIREBASE_STORAGE_BUCKET=caldata-abf0f.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=83659636165
VITE_FIREBASE_APP_ID=1:83659636165:web:f30079247d439fdc4edfac
VITE_FIREBASE_DATABASE_URL=https://caldata-abf0f.firebaseio.com
```

---

## 🚀 Steps You NEED to Follow

### Step 1: ✅ Firebase Package (Already Done)
Firebase package will be installed when you run `npm install`

### Step 2: 🔗 Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **caldata-abf0f**
3. Go to **Build** → **Realtime Database**
4. Verify your database exists

If database doesn't exist:
- Click **Create Database**
- Choose location closest to your users
- Start in **Test Mode** (for development)

### Step 3: 🔐 Set Database Rules (IMPORTANT!)

1. In Firebase Console, go to **Realtime Database**
2. Click **Rules** tab
3. Replace with these rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || false",
        ".write": "$uid === auth.uid || false",
        "profile": {
          ".validate": "newData.hasChildren(['name', 'email'])"
        },
        "meals": {
          "$date": {
            ".validate": "newData.hasChildren(['timestamp'])"
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

4. Click **Publish**

### Step 4: 🧪 Enable Test Mode (For Now)

Since you don't have Firebase Authentication set up yet, use **Test Mode**:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

⚠️ **WARNING**: Test Mode is **NOT SECURE** - Only use for development!

### Step 5: ✅ Start Building

Once these steps are done, your app will:
- ✅ Save user profiles to Firebase
- ✅ Save meal entries organized by date
- ✅ Calculate daily nutrition totals
- ✅ Sync offline data when you come online
- ✅ Show detailed console logs (see below)

---

## 📊 Console Logs You'll See

When data is saved, check your browser console (F12 → Console):

### Profile Updates:
```
🔄 Updating user profile in Firebase...
✅ User profile updated successfully in Firebase!
```

### Adding Meals:
```
🍽️ Adding meal entry to Firebase...
✅ Meal saved to Firebase!
📊 Updating daily totals in Firebase...
✅ Daily totals updated!
```

### Removing Meals:
```
🗑️ Removing meal entry from Firebase...
✅ Meal removed from Firebase!
📊 Updating daily totals in Firebase...
✅ Daily totals updated!
```

### Syncing Local Data:
```
🔄 Syncing local meals to Firebase...
✅ 5 meals synced to Firebase!
📊 Updating nutrition totals for 3 date(s)...
✅ All nutrition totals updated!
```

---

## 🔍 How to Check if Data is Saved

### In Firebase Console:
1. Go to **Realtime Database**
2. You should see structure like:
```
users/
  user_1708013400000/
    profile/
      name: "John Doe"
      email: "john@example.com"
      ...
    meals/
      2026-02-15/
        meal_123: { name, nutrition, ... }
    nutrition/
      2026-02-15/
       totals: { calories, protein, ... }
```

### In Browser Console:
Press `F12` → **Console** tab and look for:
- ✅ Green checkmarks = Success
- ❌ Red messages = Errors with details

---

## ⚡ Quick Start Commands

### Install Dependencies:
```bash
npm install
```

### Start Dev Server:
```bash
npm run dev
```

### View Console Logs:
- Open app in browser
- Press `F12` (Developer Tools)
- Go to **Console** tab
- Try adding a meal
- You'll see detailed logs showing Firebase sync

---

## 🆘 Troubleshooting

### Error: "Permission denied"
**Solution**: Your database rules are too restrictive
- Use Test Mode rules (shown above) for development
- Check your `$uid` variable matches user ID

### Error: "PERMISSION_DENIED"
**Solution**: Likely using production rules with authentication
- Switch to Test Mode temporarily
- Or ensure your user has an `id` field set in the app

### No Console Logs Appearing
**Solution**: 
- Check browser console (F12)
- Verify offline mode is OFF (should see 📤 upload icons)
- Check network tab to see Firebase requests

### Data Not Appearing in Firebase Console
**Solution**:
1. Hard refresh the Firebase Console (Ctrl+Shift+R)
2. Check the database URL matches `.env.local`
3. Verify you're looking at the right project (caldata-abf0f)

---

## 📝 Next Steps After Initial Setup

1. ✅ Follow steps 1-5 above
2. ✅ Open your app
3. ✅ Create/login with a user
4. ✅ Add a meal
5. ✅ Check browser console for SUCCESS logs
6. ✅ Check Firebase Console to see data saved

**That's it!** Your meal tracking app is now syncing with Firebase! 🎉
