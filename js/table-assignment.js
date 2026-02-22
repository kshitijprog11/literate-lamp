// Table Assignment Page - Firebase Integration
// This file handles fetching real table assignment data from Firebase

class TableAssignmentManager {
    constructor() {
        this.db = firebase.firestore();
        this.currentUser = null;
        this.assignmentData = null;
    }

    /**
     * Initialize the page and load assignment data
     */
    async init() {
        try {
            // Get user identifier from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const email = urlParams.get('email');
            const reservationId = urlParams.get('id');

            if (!email && !reservationId) {
                this.showErrorState('no-identifier');
                return;
            }

            // Show loading state
            this.showLoadingState();

            // Fetch assignment data
            await this.loadAssignmentData(email, reservationId);

        } catch (error) {
            console.error('Error initializing table assignment:', error);
            this.showErrorState('general-error');
        }
    }

    /**
     * Load table assignment data from Firebase
     */
    async loadAssignmentData(email, reservationId) {
        try {
            let userReservation = null;

            // Find user's reservation
            if (reservationId) {
                userReservation = await this.getReservationById(reservationId);
            } else if (email) {
                userReservation = await this.getReservationByEmail(email);
            }

            if (!userReservation) {
                this.showErrorState('no-reservation');
                return;
            }

            // Check if personality test is completed
            if (!userReservation.personalityResults) {
                this.showErrorState('no-personality-test');
                return;
            }

            // Find user's group assignment
            const groupAssignment = await this.getGroupAssignment(userReservation.email);

            if (!groupAssignment) {
                this.showErrorState('no-group-assignment');
                return;
            }

            // Get full group member details
            const groupMembers = await this.getGroupMemberDetails(groupAssignment.members);

            // Prepare assignment data
            this.assignmentData = {
                user: userReservation,
                group: groupAssignment,
                members: groupMembers,
                event: {
                    date: this.formatDate(userReservation.eventDate),
                    // Adding warning just in case we hit the fallback, and standardizing fallback to 7:00 PM
                    time: userReservation.timeSlot || (() => { console.warn("Missing time slot. Defaulting to 7:00 PM."); return '7:00 PM'; })(),
                    location: 'The Mindful Dining Restaurant'
                }
            };

            // Display the assignment
            this.showAssignmentContent();

        } catch (error) {
            console.error('Error loading assignment data:', error);
            this.showErrorState('general-error');
        }
    }

    /**
     * Get reservation by ID
     */
    async getReservationById(reservationId) {
        const doc = await this.db.collection('reservations').doc(reservationId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }

    /**
     * Get reservation by email
     */
    async getReservationByEmail(email) {
        const snapshot = await this.db.collection('reservations')
            .where('email', '==', email)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    /**
     * Get user's group assignment
     */
    async getGroupAssignment(userEmail) {
        const snapshot = await this.db.collection('groups')
            .where('members', 'array-contains', userEmail)
            .limit(1)
            .get();

        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    /**
     * Get details for all group members
     */
    async getGroupMemberDetails(memberEmails) {
        const promises = memberEmails.map(async (email) => {
            try {
                // Get reservation details
                const reservation = await this.getReservationByEmail(email);
                if (reservation) {
                    return {
                        email: email,
                        name: `${reservation.firstName} ${reservation.lastName}`,
                        personalityResults: reservation.personalityResults,
                        interests: reservation.interests || []
                    };
                }
                return null;
            } catch (error) {
                console.error(`Error fetching details for ${email}:`, error);
                return null;
            }
        });

        const results = await Promise.all(promises);
        return results.filter(result => result !== null);
    }

    /**
     * Display loading state
     */
    showLoadingState() {
        document.getElementById('loading-state').style.display = 'block';
        document.getElementById('error-state').style.display = 'none';
        document.getElementById('assignment-content').style.display = 'none';
    }

    /**
     * Display error state with specific message
     */
    showErrorState(errorType) {
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');
        const assignmentContent = document.getElementById('assignment-content');

        loadingState.style.display = 'none';
        assignmentContent.style.display = 'none';
        errorState.style.display = 'block';

        // Customize error message based on type
        const errorMessages = {
            'no-identifier': {
                title: '❌ Missing Information',
                message: 'Please access this page through your confirmation email or with your reservation details.'
            },
            'no-reservation': {
                title: '❌ Reservation Not Found',
                message: 'We couldn\'t find your reservation. Please check your booking details.'
            },
            'no-personality-test': {
                title: '🧠 Personality Test Required',
                message: 'Please complete your personality test to receive your table assignment.'
            },
            'no-group-assignment': {
                title: '⏳ Assignment Pending',
                message: 'Your table assignment is being prepared. Check back 24 hours before your event.'
            },
            'general-error': {
                title: '❌ Technical Error',
                message: 'Something went wrong. Please try again later or contact support.'
            }
        };

        const error = errorMessages[errorType] || errorMessages['general-error'];

        errorState.querySelector('h2').textContent = error.title;
        errorState.querySelector('p').textContent = error.message;
    }

    /**
     * Display assignment content
     */
    showAssignmentContent() {
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('error-state').style.display = 'none';
        document.getElementById('assignment-content').style.display = 'block';

        // Populate real data
        this.populateAssignmentData();
    }

    /**
     * Populate the page with real assignment data
     */
    populateAssignmentData() {
        const data = this.assignmentData;

        // Event details
        document.getElementById('event-date').textContent = data.event.date;
        document.getElementById('event-time').textContent = data.event.time;
        document.getElementById('event-location').textContent = data.event.location;

        // Table assignment
        document.getElementById('table-number').textContent = data.group.tableAssignment || `Table ${data.group.tableNumber}`;

        // Group members (excluding current user)
        const companions = data.members.filter(member => member.email !== data.user.email);
        const companionsList = document.getElementById('companions-list');

        companionsList.innerHTML = companions.map(companion => `
            <div class="companion-card">
                <h4>${companion.name}</h4>
                <div class="personality-badge">${companion.personalityResults?.personality?.type || 'Balanced Diner'}</div>
                <p><strong>Compatibility Score:</strong> ${companion.personalityResults?.score || 0}/100</p>
                <p><strong>Interests:</strong> ${companion.interests.join(', ') || 'Getting to know new people'}</p>
            </div>
        `).join('');

        // Group compatibility
        const allScores = data.members.map(m => m.personalityResults?.score || 0);
        const avgScore = Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length);
        document.getElementById('compatibility-score').textContent = `${avgScore}%`;
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Initialize when page loads (if Firebase is available)
document.addEventListener('DOMContentLoaded', function () {
    // Check if Firebase is loaded
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        const assignmentManager = new TableAssignmentManager();
        assignmentManager.init();
    } else {
        // Fall back to demo data (existing code)
        loadDemoData();
    }
});

/**
 * Demo data function (fallback when Firebase isn't configured)
 */
function loadDemoData() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const reservationId = urlParams.get('id');

    setTimeout(() => {
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');
        const assignmentContent = document.getElementById('assignment-content');

        if (email || reservationId) {
            loadingState.style.display = 'none';
            assignmentContent.style.display = 'block';
            populateDemoData();
        } else {
            loadingState.style.display = 'none';
            errorState.style.display = 'block';
        }
    }, 1500);
}

function populateDemoData() {
    // Event details
    document.getElementById('event-date').textContent = 'Saturday, December 16, 2023';
    document.getElementById('event-time').textContent = '7:30 PM';

    // Table assignment
    document.getElementById('table-number').textContent = 'Table 3';

    // Sample dining companions
    const companions = [
        {
            name: 'Sarah Johnson',
            personality: 'Thoughtful Conversationalist',
            score: 78,
            interests: 'Philosophy, Books, Travel'
        },
        {
            name: 'Michael Chen',
            personality: 'Balanced Diner',
            score: 72,
            interests: 'Art, Music, Cooking'
        },
        {
            name: 'Emma Davis',
            personality: 'Social Connector',
            score: 75,
            interests: 'Volunteering, Nature, Yoga'
        }
    ];

    const companionsList = document.getElementById('companions-list');
    companionsList.innerHTML = companions.map(companion => `
        <div class="companion-card">
            <h4>${companion.name}</h4>
            <div class="personality-badge">${companion.personality}</div>
            <p><strong>Compatibility Score:</strong> ${companion.score}/100</p>
            <p><strong>Interests:</strong> ${companion.interests}</p>
        </div>
    `).join('');

    // Group compatibility
    const avgScore = Math.round(companions.reduce((sum, c) => sum + c.score, 0) / companions.length);
    document.getElementById('compatibility-score').textContent = `${avgScore}%`;
}
