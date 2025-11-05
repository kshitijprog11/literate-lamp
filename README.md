# Mindful Dining - Restaurant Reservation & Personality Matching System

> **Literate Lamp redesign**: A multi-theme front-end layer now powers the landing site. See `README_THEME_SUPPORT.md` for theme variables, asset sources, and extension guidance.

A pilot project for creating meaningful dining experiences by matching guests based on personality compatibility.

## 🎯 Features

- **Beautiful Landing Page** - Responsive design with smooth animations
- **Reservation System** - Complete booking flow with Stripe payment integration
- **Personality Assessment** - 15-question test to determine dining compatibility
- **Smart Grouping Algorithm** - Matches guests with similar personality scores
- **Admin Dashboard** - Manage reservations, create groups, and send notifications
- **Email Notifications** - Automated confirmation and table assignment emails
- **Mobile Responsive** - Works perfectly on all devices

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd mindful-dining
```

### 2. Configure Firebase (Free Tier)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Get your configuration and update:
   - `reservation.html` (line 85)
   - `personality-test.html` (line 75)
   - `admin-dashboard.html` (line 380)

Replace the placeholder config:
```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

### 3. Configure Stripe (Test Mode - Free)
1. Get your Stripe publishable key from [Stripe Dashboard](https://dashboard.stripe.com/)
2. Update `js/reservation.js` line 4:
```javascript
const stripe = Stripe('pk_test_your_actual_publishable_key');
```

### 4. Deploy to GitHub Pages (Free)
1. Push code to GitHub repository
2. Go to repository Settings → Pages
3. Select source: Deploy from a branch
4. Select branch: main
5. Your site will be available at: `https://yourusername.github.io/repository-name`

## 📁 Project Structure

```
mindful-dining/
├── index.html              # Landing page
├── reservation.html        # Booking form
├── personality-test.html   # Assessment questionnaire
├── confirmation.html       # Success page
├── admin-dashboard.html    # Management interface
├── css/
│   └── styles.css         # All styling
├── js/
│   ├── main.js           # Homepage functionality
│   ├── reservation.js    # Booking logic & Stripe
│   ├── personality-test.js # Test logic & scoring
│   ├── confirmation.js   # Success page logic
│   ├── grouping-algorithm.js # Smart matching
│   └── admin-dashboard.js # Admin functionality
└── README.md             # This file
```

## 🔧 Configuration Options

### Grouping Algorithm Settings
Customize the matching algorithm in `js/grouping-algorithm.js`:

```javascript
const config = {
    minGroupSize: 2,        // Minimum people per table
    maxGroupSize: 12,       // Maximum people per table
    idealGroupSize: 6,      // Preferred table size
    scoreThreshold: 15,     // Max personality score difference
    diversityFactor: 0.3    // How much variety to allow (0-1)
};
```

### Personality Test Questions
Modify questions in `js/personality-test.js` starting at line 280. Each question should have:
- `text`: The question
- `options`: Array of answers with `text` and `score` (1-5)

## 💳 Payment Integration

### For Production
1. Get live Stripe keys
2. Implement server-side payment processing
3. Add webhook handling for payment confirmations

### Current Demo Mode
- Uses Stripe test mode
- Simulates successful payments
- No actual charges

## 📧 Email Integration (SendGrid - Free Tier)

### Setup SendGrid (Free: 100 emails/day)
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Get API key
3. Implement server-side email sending
4. Update confirmation and notification functions

### Current Demo Mode
- Shows email simulation messages
- Logs to console
- No actual emails sent

## 🎨 Customization

### Colors & Branding
Update CSS variables in `css/styles.css`:
```css
:root {
    --primary-color: #8B4513;    /* Brown theme */
    --secondary-color: #A0522D;
    --accent-color: #4CAF50;
}
```

### Restaurant Information
Update contact details in:
- `index.html` (footer and contact section)
- `confirmation.html` (contact info)
- Email templates in `js/grouping-algorithm.js`

## 🛠️ Local Development

### Using XAMPP (as requested)
1. Install XAMPP
2. Place project in `htdocs/mindful-dining`
3. Start Apache server
4. Access via `http://localhost/mindful-dining`

### Using Python (Alternative)
```bash
cd mindful-dining
python -m http.server 8000
# Access via http://localhost:8000
```

## 📊 Admin Dashboard

Access at `/admin-dashboard.html` to:
- View all reservations
- See personality test completion rates
- Create dining groups automatically
- Export data as CSV
- Send table assignment notifications

### Demo Data
The system falls back to localStorage when Firebase isn't configured, perfect for testing.

## 🔒 Security Considerations

### For Production
- Add authentication to admin dashboard
- Validate all user inputs server-side
- Use environment variables for API keys
- Implement rate limiting
- Add CSRF protection

### Current Demo
- No authentication (admin dashboard is public)
- Client-side validation only
- API keys visible in source code

## 📈 Scaling Considerations

### Free Tier Limits
- **Firebase**: 1GB storage, 50K reads/day
- **Stripe**: Unlimited test transactions
- **SendGrid**: 100 emails/day
- **GitHub Pages**: 100GB bandwidth/month

### When to Upgrade
- More than 10-20 reservations/day
- Need more email capacity
- Require advanced Firebase features

## 🐛 Troubleshooting

### Common Issues

1. **Stripe not loading**
   - Check internet connection
   - Verify publishable key is correct
   - Check browser console for errors

2. **Firebase errors**
   - Ensure configuration is correct
   - Check Firestore rules allow reads/writes
   - Verify project ID matches

3. **Personality test not saving**
   - Check browser localStorage space
   - Verify Firebase connection
   - Look for console errors

### Getting Help
- Check browser console for error messages
- Verify all configuration keys are updated
- Test with sample data first

## 🚀 Production Checklist

- [ ] Update Firebase configuration
- [ ] Add real Stripe keys
- [ ] Implement server-side payment processing
- [ ] Set up SendGrid email service
- [ ] Add admin authentication
- [ ] Test with real data
- [ ] Set up SSL certificate
- [ ] Configure custom domain
- [ ] Add analytics tracking
- [ ] Test mobile responsiveness

## 📝 License

This project is for educational and pilot purposes. Customize as needed for your restaurant.

## 🤝 Contributing

This is a pilot project template. Feel free to fork and modify for your specific needs.

---

**Ready to create meaningful dining experiences?** 🍽️✨

Start by updating the Firebase configuration and deploy to GitHub Pages for a live demo!
