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
        const profileData = pr.fullProfile || pr.score;
        const type = pr.personality?.type || 'The Balanced Diner';
        const role = profileData?.dominantRole || 'Unknown';
        const intent = profileData?.dominantIntent || 'Unknown';

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
        if (profileData && profileData.totalStats) {
            setTimeout(() => {
                renderRadarChart(profileData.totalStats);
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

    // Check for Table Teaser
    loadTableTeaser(reservation.eventDate, reservation.email);
}

async function loadTableTeaser(eventDate, email) {
    let groups = [];

    // 1. Try Firebase first
    if (!window.FAST_TESTING_MODE && window.db) {
        try {
            const q = window.query(
                window.collection(window.db, 'grouped_events'),
                window.where("date", "==", eventDate)
            );
            const snapshot = await window.getDocs(q);
            if (!snapshot.empty) {
                const docs = snapshot.docs.map(doc => doc.data());
                docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                groups = docs[0].groups || [];
            }
        } catch (error) {
            console.warn("Firebase group fetch failed:", error);
        }
    }

    // 2. Fallback to localStorage
    if (groups.length === 0) {
        const localGroups = localStorage.getItem('groups_' + eventDate);
        if (localGroups) {
            try {
                groups = JSON.parse(localGroups);
            } catch (e) { }
        }
    }

    if (groups.length === 0) return;

    // 3. Find this user's group
    const myGroup = groups.find(g => g.members.some(m => m.email.toLowerCase() === email.toLowerCase()));

    if (myGroup) {
        renderTeaserStats(myGroup);
    }
}

function renderTeaserStats(group) {
    const teaserSection = document.getElementById('table-teaser-section');
    if (!teaserSection) return;

    teaserSection.classList.remove('hidden');

    const size = group.members.length;
    let rolesCount = { catalyst: 0, storyteller: 0, interviewer: 0, listener: 0 };

    group.members.forEach(m => {
        const role = m.personalityResults?.fullProfile?.dominantRole;
        if (role && rolesCount[role] !== undefined) {
            rolesCount[role]++;
        } else {
            rolesCount.listener++; // Fallback
        }
    });

    const topRoles = Object.entries(rolesCount)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]);

    const roleText = topRoles.map(([role, count]) => `${count} ${role.charAt(0).toUpperCase() + role.slice(1)}${count > 1 ? 's' : ''}`).join(', ');
    const intentStr = group.intent ? group.intent.replace('_', ' ').toUpperCase() : 'MIXED';

    const html = `
        <h4 style="color: var(--primary-color); margin-bottom: 1rem;">🍽️ Meet Your Table Teaser</h4>
        <div style="background: rgba(255,255,255,0.7); padding: 1.5rem; border-radius: 8px; border-left: 4px solid var(--accent-light);">
            <p style="margin-bottom: 0.8rem; font-size: 1.1em;"><strong>Table Size:</strong> ${size} wonderful people</p>
            <p style="margin-bottom: 0.8rem; font-size: 1.1em;"><strong>Table Intent:</strong> ${intentStr}</p>
            <p style="margin-bottom: 0.8rem; font-size: 1.1em;"><strong>Table Energy Level:</strong> ${group.averageScore}</p>
            <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px dashed #ccc;">
                <p style="font-size: 0.9em; color: #555; text-transform: uppercase; font-weight: bold; margin-bottom: 0.5rem;">
                    Sneak Peek at your Dynamic:
                </p>
                <p style="font-size: 1.05em; color: var(--primary-color);">
                    You'll be sitting with <strong>${roleText}</strong>.
                </p>
            </div>
        </div>
    `;

    teaserSection.innerHTML = html;
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
