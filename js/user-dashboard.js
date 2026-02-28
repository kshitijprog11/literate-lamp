// User Dashboard Logic

let currentChart = null;

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-button');

    // Check if already logged in via session
    const activeEmail = sessionStorage.getItem('portalUserEmail');
    if (activeEmail) {
        loadUserData(activeEmail);
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const btn = document.getElementById('login-btn');
        const errorDiv = document.getElementById('login-error');

        if (!email) return;

        btn.textContent = 'Searching...';
        btn.disabled = true;
        errorDiv.classList.add('hidden');

        try {
            await loadUserData(email);
        } catch (error) {
            errorDiv.textContent = error.message || "Could not find a reservation with that email.";
            errorDiv.classList.remove('hidden');
        } finally {
            btn.textContent = 'Access Portal';
            btn.disabled = false;
        }
    });

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('portalUserEmail');
        document.getElementById('dashboard-view').classList.add('hidden');
        document.getElementById('login-view').classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        if (currentChart) {
            currentChart.destroy();
            currentChart = null;
        }
    });
});

async function loadUserData(email) {
    let reservation = null;

    // 1. Try Firebase first
    if (!window.FAST_TESTING_MODE && window.db) {
        try {
            const q = window.query(
                window.collection(window.db, 'reservations'),
                window.where("email", "==", email)
            );
            const snapshot = await window.getDocs(q);

            if (!snapshot.empty) {
                // Get the most recent one if they have multiple
                const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                reservation = docs[0];
            }
        } catch (error) {
            console.warn("Firebase fetch failed, falling back to local:", error);
        }
    }

    // 2. Fallback to localStorage
    if (!reservation) {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('reservation_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data.email.toLowerCase() === email.toLowerCase()) {
                        reservation = { id: key.replace('reservation_', ''), ...data };
                        break;
                    }
                } catch (e) { }
            }
        }
    }

    if (!reservation) {
        throw new Error("No reservation found for this email address.");
    }

    // Success! Log them in
    sessionStorage.setItem('portalUserEmail', email);

    // Render UI
    renderDashboard(reservation);
}

function renderDashboard(reservation) {
    // Switch views
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('dashboard-view').classList.remove('hidden');
    document.getElementById('logout-button').classList.remove('hidden');

    // Set Name
    document.getElementById('user-firstname').textContent = reservation.firstName;

    // Render Reservation Details
    const resHTML = `
        <div class="info-row">
            <span class="info-label">Date</span>
            <span>${reservation.eventDate}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Time</span>
            <span>${reservation.timeSlot}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Guests</span>
            <span>${reservation.partySize || 1}</span>
        </div>
        <div class="info-row" style="border-bottom: none;">
            <span class="info-label">Dietary Notes</span>
            <span>${reservation.dietaryRestrictions || 'None'}</span>
        </div>
        <div style="text-align: center;">
            <span class="status-badge status-confirmed">✓ Confirmed</span>
        </div>
    `;
    document.getElementById('reservation-details').innerHTML = resHTML;

    // Render Personality Results
    const profileContainer = document.getElementById('personality-profile-content');
    if (reservation.personalityResults) {
        const pr = reservation.personalityResults;
        const type = pr.personality?.type || 'The Balanced Diner';
        const role = pr.fullProfile?.dominantRole || 'Unknown';
        const intent = pr.fullProfile?.dominantIntent || 'Unknown';

        let profileHTML = `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <h4 style="font-size: 1.4rem; color: var(--accent-dark); margin-bottom: 0.5rem;">${type}</h4>
                <p style="font-size: 0.9em; color: #666; text-transform: capitalize;">
                    Role: <strong>${role}</strong> | Intent: <strong>${intent.replace('_', ' ')}</strong>
                </p>
            </div>
            <div class="chart-container">
                <canvas id="dashboardRadarChart"></canvas>
            </div>
        `;
        profileContainer.innerHTML = profileHTML;

        // Draw Chart
        if (pr.fullProfile && pr.fullProfile.totalStats) {
            setTimeout(() => {
                renderRadarChart(pr.fullProfile.totalStats);
            }, 100);
        }

    } else {
        profileContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem 0;">
                <p style="margin-bottom: 1rem; color: #666;">You haven't completed your personality assessment yet!</p>
                <button class="cta-button" onclick="location.href='personality-test.html'" style="font-size: 0.9em; padding: 0.6rem 1.2rem;">Complete Assessment</button>
            </div>
        `;
    }
}

function renderRadarChart(stats) {
    const ctx = document.getElementById('dashboardRadarChart');
    if (!ctx) return;

    if (currentChart) {
        currentChart.destroy();
    }

    const data = [
        stats.intents?.networking || 0,
        stats.intents?.casual || 0,
        stats.intents?.deep_connection || 0,
        stats.roles?.catalyst || 0,
        stats.roles?.storyteller || 0,
        stats.roles?.interviewer || 0,
        stats.roles?.listener || 0,
        (stats.energyTotal / 10) || 0
    ];

    currentChart = new Chart(ctx.getContext('2d'), {
        type: 'radar',
        data: {
            labels: [
                'Networking',
                'Casual Fun',
                'Deep Conn.',
                'Catalyst',
                'Storyteller',
                'Interviewer',
                'Listener',
                'Energy'
            ],
            datasets: [{
                label: 'Your Profile',
                data: data,
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderColor: 'rgba(52, 152, 219, 1)',
                pointBackgroundColor: 'rgba(52, 152, 219, 1)',
                pointBorderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
                    grid: { color: 'rgba(0, 0, 0, 0.1)' },
                    pointLabels: {
                        font: { family: "'Open Sans', sans-serif", size: 10 },
                        color: '#666'
                    },
                    ticks: { display: false, min: 0 }
                }
            },
            plugins: {
                legend: { display: false }
            },
            maintainAspectRatio: false
        }
    });
}
