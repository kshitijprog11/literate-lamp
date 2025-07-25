# Mindful Dining React App

A modern React implementation of the Mindful Dining restaurant reservation and personality matching system.

## 🚀 Features

- **React-based SPA** - Modern single-page application with client-side routing
- **Component Architecture** - Modular, reusable React components
- **State Management** - React Context for global state management
- **Firebase Integration** - Real-time data storage and synchronization
- **Responsive Design** - Mobile-first responsive UI
- **Interactive Forms** - Real-time validation and error handling
- **Personality Assessment** - Dynamic 15-question compatibility test
- **Smart Grouping** - Algorithm-based dining companion matching
- **Admin Dashboard** - Comprehensive reservation and group management

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router DOM
- **Backend**: Firebase Firestore
- **Build Tool**: Vite
- **Styling**: CSS3 with custom variables
- **Payment**: Stripe integration (demo mode)
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mindful-dining-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Update `src/context/FirebaseContext.jsx` with your Firebase config
   - Or use the demo mode with localStorage fallback

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

## 🏗️ Project Structure

```
mindful-dining-react/
├── src/
│   ├── components/           # React components
│   │   ├── Home.jsx         # Landing page
│   │   ├── Navbar.jsx       # Navigation component
│   │   ├── Reservation.jsx  # Booking form
│   │   ├── PersonalityTest.jsx # Assessment component
│   │   ├── Confirmation.jsx # Success page
│   │   ├── AdminDashboard.jsx # Management interface
│   │   └── TableAssignment.jsx # Table assignments
│   ├── context/             # React context providers
│   │   └── FirebaseContext.jsx # Firebase integration
│   ├── utils/               # Utility functions (copied from original)
│   ├── styles.css           # Global styles
│   ├── App.jsx             # Main app component
│   └── main.jsx            # App entry point
├── public/                  # Static assets
├── package.json            # Dependencies and scripts
└── vite.config.js          # Vite configuration
```

## 🎯 Key Components

### Home Component
- Hero section with call-to-action
- About and how-it-works sections
- Responsive navigation

### Reservation Component
- Multi-step form with validation
- Real-time error handling
- Phone number formatting
- Firebase/localStorage integration

### PersonalityTest Component
- 15-question dynamic assessment
- Progress tracking
- Real-time scoring
- Results display with personality insights

### AdminDashboard Component
- Reservation management
- Automatic group creation
- Statistics and analytics
- CSV export functionality

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Firestore Database
3. Update the config in `src/context/FirebaseContext.jsx`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
}
```

### Stripe Integration
Update Stripe configuration for payment processing (currently in demo mode).

## 🎨 Styling

The app uses a custom CSS design system with:
- CSS custom properties for theming
- Responsive grid layouts
- Smooth animations and transitions
- Component-specific styling
- Mobile-first approach

Key color scheme:
```css
--primary-color: #8B4513    /* Brown */
--secondary-color: #A0522D  /* Saddle Brown */
--accent-color: #4CAF50     /* Green */
```

## 🔄 State Management

The app uses React Context for global state management:

- **FirebaseContext**: Database operations and connection state
- **Component State**: Local form state and UI interactions
- **Session Storage**: Temporary data between page navigation

## 📱 Responsive Design

The application is fully responsive with breakpoints for:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🧪 Testing

The app includes demo mode for testing without Firebase:
- Automatic localStorage fallback
- Sample data generation
- All features work offline

## 🚀 Deployment

### Netlify/Vercel
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Configure environment variables for Firebase

### GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add deploy script to package.json
3. Deploy: `npm run deploy`

## 🔒 Security Considerations

For production deployment:
- Add environment variables for sensitive config
- Implement proper Firebase security rules
- Add authentication for admin routes
- Enable HTTPS
- Add rate limiting

## 🎯 Differences from Original

### Improvements
- **Component Architecture**: Better code organization and reusability
- **Real-time Validation**: Instant feedback on form inputs
- **Better UX**: Smooth transitions and loading states
- **State Management**: Centralized data management
- **Modern Tooling**: Vite for faster development

### Enhanced Features
- Progress indicators
- Better error handling
- Responsive navigation
- Interactive personality test
- Advanced admin dashboard

## 🔄 Migration from Original

If migrating from the original HTML version:
1. Data in Firebase will be compatible
2. Existing reservations will load automatically
3. All functionality is preserved
4. Enhanced with React benefits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is for educational and demonstration purposes.

---

**Built with ❤️ using React and modern web technologies**

Ready to create meaningful dining experiences with a sophisticated React interface! 🍽️✨
