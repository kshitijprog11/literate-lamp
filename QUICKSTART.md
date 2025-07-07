# 🚀 Quick Launch Guide - Get Live in 15 Minutes

## Step 1: Deploy to GitHub Pages (5 minutes)

### Option A: Upload via GitHub Website
1. Go to [GitHub.com](https://github.com) and sign in (create account if needed)
2. Click the "+" in top right → "New repository"
3. Repository name: `mindful-dining`
4. Make it **Public** (required for free GitHub Pages)
5. Click "Create repository"
6. Click "uploading an existing file"
7. **Drag all your project files** into the upload area
8. Write commit message: "Initial website launch"
9. Click "Commit changes"
10. Go to Settings → Pages → Source: "Deploy from branch" → Branch: "main" → Save

Your site will be live at: `https://yourusername.github.io/mindful-dining`

### Option B: Use Git Commands (if you have Git installed)
```bash
git clone https://github.com/yourusername/mindful-dining.git
cd mindful-dining
# Copy all your files here
git add .
git commit -m "Initial website launch"
git push origin main
```

## Step 2: Setup Firebase (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Project name: `mindful-dining-pilot`
4. Disable Google Analytics for now
5. Click "Create project"
6. Once created, click "Firestore Database"
7. Click "Create database"
8. Choose "Start in test mode"
9. Select a location close to you
10. Click "Done"

### Get Your Configuration:
1. Click the gear icon (⚙️) → "Project settings"
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. App nickname: "Mindful Dining"
5. Click "Register app"
6. **Copy the config object** - you'll need this next!

## Step 3: Update Your Code (3 minutes)

You need to replace the Firebase config in 3 files:

### File 1: reservation.html (around line 87)
Find this:
```javascript
const firebaseConfig = {
    // Add your Firebase config here
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    // ... etc
};
```

Replace with your actual config:
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyC...", // Your real API key
    authDomain: "mindful-dining-pilot.firebaseapp.com",
    projectId: "mindful-dining-pilot",
    storageBucket: "mindful-dining-pilot.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

### File 2: personality-test.html (around line 77)
Same config replacement as above.

### File 3: admin-dashboard.html (around line 382)
Same config replacement as above.

## Step 4: Setup Stripe (2 minutes)

1. Go to [Stripe.com](https://stripe.com)
2. Click "Start now" and create account
3. Complete basic info (you'll start in test mode)
4. Go to Developers → API keys
5. Copy the "Publishable key" (starts with `pk_test_`)

### Update js/reservation.js (line 4):
```javascript
const stripe = Stripe('pk_test_your_actual_key_here');
```

## Step 5: Push Updates & Test!

### Update GitHub:
1. Go back to your GitHub repo
2. Click on each file that needs updating
3. Click the pencil icon (✏️) to edit
4. Make your changes
5. Scroll down and click "Commit changes"

OR use Git:
```bash
git add .
git commit -m "Added Firebase and Stripe configuration"
git push origin main
```

### Wait 2-3 minutes for GitHub Pages to update, then test:

1. **Visit your live site**: `https://yourusername.github.io/mindful-dining`
2. **Test reservation**: Use card number `4242 4242 4242 4242`
3. **Complete personality test**
4. **Check admin dashboard**: Add `/admin-dashboard.html` to your URL

## 🎉 You're Live!

Your restaurant reservation system is now fully functional! 

- ✅ Beautiful website hosted on GitHub Pages
- ✅ Secure payment processing via Stripe
- ✅ Cloud database storage via Firebase
- ✅ Personality matching algorithm
- ✅ Admin dashboard for managing groups

## Quick Test Checklist:

- [ ] Homepage loads and looks good
- [ ] Reservation form accepts test card
- [ ] Personality test saves results
- [ ] Admin dashboard shows reservations
- [ ] Group creation works

## What's Working Now:
- Full reservation system
- Personality assessment
- Group creation
- Data storage in Firebase
- Admin management

## Still Need to Add (Optional):
- Real Stripe live keys (when ready for real payments)
- SendGrid for automated emails
- Custom domain name
- SSL certificate (GitHub Pages provides this automatically)

## Need Help?
- Check browser console for any errors
- Verify all config keys are updated
- Test with the Stripe test card: `4242 4242 4242 4242`
- Make sure Firebase project is active

**Your pilot is ready to start taking real reservations!** 🍽️✨