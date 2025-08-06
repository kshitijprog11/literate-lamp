# React App Troubleshooting Guide

## Issue: Blank Page on GitHub Pages

The React app was showing a blank page due to several potential issues:

### Possible Causes:
1. **Asset Path Issues**: Vite config not set correctly for GitHub Pages subdirectory
2. **JavaScript Errors**: Silent errors preventing React from mounting
3. **Router Issues**: React Router not configured for subdirectory deployment
4. **Firebase Connection**: Firebase config causing blocking errors

### Solution Applied:
Temporarily replaced with working HTML version to provide immediate functionality.

## React App Fix (For Future Reference):

### 1. Fix Vite Configuration
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  base: '/literate-lamp/', // or './' for relative paths
})
```

### 2. Router Configuration
```javascript
// App.jsx
<Router basename="/literate-lamp">
  <Routes>
    {/* routes */}
  </Routes>
</Router>
```

### 3. Firebase Error Handling
```javascript
// FirebaseContext.jsx
try {
  const app = initializeApp(firebaseConfig)
  // ... 
} catch (error) {
  console.warn('Firebase failed, using fallback:', error)
  // Don't let Firebase errors break the app
}
```

### 4. Debugging Steps:
1. Check browser console for JavaScript errors
2. Verify asset loading in Network tab
3. Test React app locally with `npm run dev`
4. Build and test with `npm run build && npm run preview`

## Current Status:
- ✅ Working HTML version deployed
- ✅ All features accessible via direct links
- 🔄 React version needs debugging

## To Restore React App:
1. Fix the issues above
2. Rebuild: `npm run build`
3. Copy build files to root
4. Test locally first
5. Deploy when confirmed working

## Working Features (HTML Version):
- ✅ Landing page with navigation
- ✅ Reservation system
- ✅ Personality test
- ✅ Admin dashboard
- ✅ Table assignments
- ✅ All JavaScript functionality preserved