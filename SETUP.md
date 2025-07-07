# Complete Setup Guide - Mindful Dining

This guide walks you through setting up all the free services needed for your restaurant reservation system.

## 🔥 Firebase Setup (Free Database)

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `mindful-dining-[your-name]`
4. Disable Google Analytics (optional for pilot)
5. Click "Create project"

### Step 2: Setup Firestore Database
1. In Firebase console, click "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (allows read/write for 30 days)
4. Select a location (choose closest to your users)
5. Click "Done"

### Step 3: Get Configuration
1. Click the gear icon → "Project settings"
2. Scroll down to "Your apps"
3. Click the web icon (`</>`) to add a web app
4. Enter app name: "Mindful Dining Web"
5. Check "Firebase Hosting" (optional)
6. Click "Register app"
7. Copy the configuration object

### Step 4: Update Your Code
Replace the placeholder config in these files:

**reservation.html** (around line 85):
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyC...",
    authDomain: "mindful-dining-abc123.firebaseapp.com",
    projectId: "mindful-dining-abc123",
    storageBucket: "mindful-dining-abc123.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};
```

**personality-test.html** (around line 75):
```javascript
// Same configuration as above
```

**admin-dashboard.html** (around line 380):
```javascript
// Same configuration as above
```

### Step 5: Configure Security Rules (Later)
For production, update Firestore rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reservations/{document} {
      allow read, write: if true; // Change this for production
    }
    match /groups/{document} {
      allow read, write: if true; // Change this for production
    }
  }
}
```

## 💳 Stripe Setup (Free Test Mode)

### Step 1: Create Stripe Account
1. Go to [Stripe.com](https://stripe.com)
2. Click "Start now"
3. Create account with your email
4. Complete basic business information
5. You'll start in test mode automatically

### Step 2: Get API Keys
1. In Stripe Dashboard, click "Developers" → "API keys"
2. Copy the "Publishable key" (starts with `pk_test_`)
3. Keep the "Secret key" safe (starts with `sk_test_`)

### Step 3: Update Your Code
**js/reservation.js** (line 4):
```javascript
const stripe = Stripe('pk_test_51Hxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
```

### Step 4: Test Cards
Use these test card numbers:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Insufficient funds**: 4000 0000 0000 9995

Any future expiry date and any 3-digit CVC.

## 📧 SendGrid Setup (Free Email Service)

### Step 1: Create SendGrid Account
1. Go to [SendGrid.com](https://sendgrid.com)
2. Click "Start for Free"
3. Create account (free tier: 100 emails/day)
4. Verify your email address

### Step 2: Create API Key
1. Go to Settings → API Keys
2. Click "Create API Key"
3. Choose "Restricted Access"
4. Select permissions:
   - Mail Send: Full Access
   - Template Engine: Read Access
5. Copy the API key (starts with `SG.`)

### Step 3: Verify Sender Identity
1. Go to Settings → Sender Authentication
2. Click "Single Sender Verification"
3. Add your restaurant email
4. Check email and click verification link

### Step 4: Implementation (Server Required)
SendGrid requires server-side implementation. For pilot, use simulation mode in the current code.

For production, create a server endpoint like:
```javascript
// server.js (Node.js example)
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('SG.your-api-key');

app.post('/send-confirmation-email', async (req, res) => {
    const msg = {
        to: req.body.email,
        from: 'hello@yourrestaurant.com',
        subject: 'Reservation Confirmation',
        html: req.body.html
    };
    
    try {
        await sgMail.send(msg);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

## 🌐 GitHub Pages Setup (Free Hosting)

### Step 1: Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Create account if needed
3. Click "New repository"
4. Name: `mindful-dining` (or your preferred name)
5. Make it public
6. Initialize with README (optional)

### Step 2: Upload Your Code
Option A - Web Interface:
1. Click "uploading an existing file"
2. Drag all your project files
3. Commit changes

Option B - Git Commands:
```bash
git clone https://github.com/yourusername/mindful-dining.git
cd mindful-dining
# Copy your files here
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository
2. Click "Settings" tab
3. Scroll to "Pages" section
4. Source: "Deploy from a branch"
5. Branch: "main"
6. Folder: "/ (root)"
7. Click "Save"

### Step 4: Access Your Site
Your site will be available at:
`https://yourusername.github.io/mindful-dining`

## 🔧 Local Development Setup

### Option 1: XAMPP (As Requested)
1. Download [XAMPP](https://www.apachefriends.org/)
2. Install and start Apache
3. Copy project to `C:\xampp\htdocs\mindful-dining\`
4. Access via `http://localhost/mindful-dining`

### Option 2: Python Simple Server
```bash
cd mindful-dining
python -m http.server 8000
# Access via http://localhost:8000
```

### Option 3: Node.js Live Server
```bash
npm install -g live-server
cd mindful-dining
live-server
```

## 🧪 Testing Your Setup

### 1. Test Firebase Connection
1. Open browser console on reservation page
2. Fill out form and submit
3. Check for "Reservation saved with ID" in console
4. Check Firebase console for new document

### 2. Test Stripe Integration
1. Go to reservation page
2. Use test card: 4242 4242 4242 4242
3. Any future date, any CVC
4. Should show "Processing..." then redirect

### 3. Test Personality Assessment
1. Complete reservation first
2. Answer all personality questions
3. Check localStorage in browser dev tools
4. Should see personality results stored

### 4. Test Admin Dashboard
1. Go to `/admin-dashboard.html`
2. Should see your test reservations
3. Try creating groups for a test date
4. Export CSV functionality

## 🚨 Common Issues & Solutions

### Firebase Issues
**Error: "Permission denied"**
- Check Firestore rules allow read/write
- Verify configuration is correct
- Ensure project is active

**Error: "Cannot read property 'collection'"**
- Firebase SDK not loaded properly
- Check internet connection
- Verify script tags are correct

### Stripe Issues
**Error: "Stripe is not defined"**
- Check internet connection
- Verify Stripe.js script is loaded
- Use correct publishable key format

**Error: "No such payment intent"**
- Using test mode correctly
- Server-side integration needed for production

### GitHub Pages Issues
**404 Error on site**
- Wait 10-15 minutes after enabling
- Check repository is public
- Verify files are in root directory

**Changes not showing**
- GitHub Pages can take time to update
- Try hard refresh (Ctrl+F5)
- Check commit went through

## 🔐 Production Security

### Before Going Live:
1. **Firebase Rules**: Restrict database access
2. **Stripe**: Switch to live keys, implement webhooks
3. **Admin**: Add authentication
4. **SSL**: Ensure HTTPS everywhere
5. **Validation**: Add server-side validation
6. **Monitoring**: Set up error tracking

### Environment Variables:
Never commit API keys to GitHub. For production:
```javascript
// Use environment variables
const STRIPE_PK = process.env.STRIPE_PUBLISHABLE_KEY;
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
```

## 📞 Getting Help

### Documentation Links:
- [Firebase Docs](https://firebase.google.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [SendGrid Docs](https://docs.sendgrid.com/)
- [GitHub Pages Docs](https://docs.github.com/en/pages)

### Troubleshooting:
1. Check browser console for errors
2. Verify all configuration keys are updated
3. Test one component at a time
4. Use sample/test data first

---

🎉 **You're all set!** Your restaurant reservation system is ready for testing and customization.