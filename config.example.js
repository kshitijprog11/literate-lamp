// Configuration Template for Mindful Dining
// Copy this file to config.js and update with your actual values

const CONFIG = {
    // Firebase Configuration
    // Real Firebase config from your mindful-dining-test project
    firebase: {
        apiKey: "YOUR_GOOGLE_API_KEY_HERE",
        authDomain: "mindful-dining-test.firebaseapp.com",
        projectId: "mindful-dining-test",
        storageBucket: "mindful-dining-test.firebasestorage.app",
        messagingSenderId: "756250419814",
        appId: "1:756250419814:web:abdd3df98c9884114003a7",
        measurementId: "G-V97Y6YE2X2"
    },
    
    // Stripe Configuration
    // Get from Stripe Dashboard > Developers > API keys
    stripe: {
        publishableKey: "pk_test_your_stripe_publishable_key",
        // Note: Secret key should NEVER be in frontend code
        // secretKey: "sk_test_your_stripe_secret_key" // Server-side only
    },
    
    // SendGrid Configuration (for future server-side implementation)
    sendgrid: {
        apiKey: "SG.your_sendgrid_api_key",
        fromEmail: "hello@yourrestaurant.com",
        fromName: "Mindful Dining"
    },
    
    // Restaurant Information
    restaurant: {
        name: "Mindful Dining",
        email: "hello@mindfuldining.com",
        phone: "(555) 123-4567",
        address: "123 Main Street, Your City, State 12345",
        website: "https://yourusername.github.io/mindful-dining"
    },
    
    // Pricing Configuration
    pricing: {
        pricePerPerson: 75, // in dollars
        currency: "USD",
        taxRate: 0.08, // 8% tax (if applicable)
        serviceCharge: 0 // additional service charge (if applicable)
    },
    
    // Personality Test Configuration
    personalityTest: {
        totalQuestions: 15,
        timeLimit: null, // null for no time limit, or number in minutes
        scoreRange: {
            min: 0,
            max: 100
        },
        categories: {
            quietObserver: { min: 0, max: 19 },
            intimateSharer: { min: 20, max: 39 },
            balancedDiner: { min: 40, max: 59 },
            thoughtfulConversationalist: { min: 60, max: 79 },
            socialConnector: { min: 80, max: 100 }
        }
    },
    
    // Grouping Algorithm Settings
    grouping: {
        minGroupSize: 2,
        maxGroupSize: 12,
        idealGroupSize: 6,
        scoreThreshold: 15, // Maximum score difference within a group
        diversityFactor: 0.3, // 0 = strict matching, 1 = random
        allowMixedTypes: true // Allow different personality types in same group
    },
    
    // Event Schedule Configuration
    events: {
        timeSlots: [
            "6:00 PM",
            "7:00 PM", 
            "8:00 PM"
        ],
        daysOfWeek: [5, 6], // 0=Sunday, 1=Monday, etc. [5,6] = Friday, Saturday
        advanceBookingDays: 30, // How far in advance can people book
        cutoffHours: 24 // How many hours before event to stop bookings
    },
    
    // Email Templates (for future SendGrid integration)
    emailTemplates: {
        confirmation: {
            subject: "Reservation Confirmation - Mindful Dining",
            template: "confirmation-template-id"
        },
        tableAssignment: {
            subject: "Your Table Assignment - Mindful Dining",
            template: "table-assignment-template-id"
        },
        reminder: {
            subject: "Reminder: Your Mindful Dining Experience Tomorrow",
            template: "reminder-template-id"
        }
    },
    
    // Admin Dashboard Settings
    admin: {
        enableAuthentication: false, // Set to true for production
        adminEmails: ["admin@yourrestaurant.com"], // Admin access list
        dataRetentionDays: 365, // How long to keep reservation data
        exportFormats: ["csv", "json"], // Available export formats
        maxExportRecords: 1000 // Limit for data exports
    },
    
    // Feature Flags
    features: {
        enablePayments: true,
        enablePersonalityTest: true,
        enableEmailNotifications: false, // Set to true when SendGrid is configured
        enableGroupCreation: true,
        enableAdminDashboard: true,
        enableDataExport: true
    },
    
    // Development Settings
    development: {
        useLocalStorage: true, // Fallback when Firebase isn't configured
        enableConsoleLogging: true,
        showTestData: true,
        simulateEmailSending: true,
        skipPaymentProcessing: false // Set to true to skip Stripe for testing
    }
};

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = CONFIG;
} else {
    // Browser environment
    window.CONFIG = CONFIG;
}

// Usage Examples:
/*
// In your JavaScript files, use like this:

// Firebase initialization
const app = initializeApp(CONFIG.firebase);

// Stripe initialization  
const stripe = Stripe(CONFIG.stripe.publishableKey);

// Pricing display
document.getElementById('price').textContent = `$${CONFIG.pricing.pricePerPerson}`;

// Restaurant info
document.getElementById('contact-email').textContent = CONFIG.restaurant.email;

// Grouping algorithm
const groups = createDiningGroups(users, CONFIG.grouping);
*/