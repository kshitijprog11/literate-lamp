// Admin Dashboard JavaScript
let currentReservations = [];
let currentGroups = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Admin Dashboard DOM loaded, waiting for Firebase...');
    
    // Try to initialize immediately if Firebase is ready
    if (typeof window.db !== 'undefined') {
        initializeDashboard();
    } else {
        // Wait for Firebase to be initialized
        setTimeout(() => {
            if (typeof window.db !== 'undefined') {
                initializeDashboard();
            } else {
                console.log('⚠️ Firebase not available, using localStorage only');
                initializeDashboard();
            }
        }, 2000);
    }
});

// Make this function available globally so Firebase can call it
window.initializeDashboard = function() {
    console.log('🚀 Initializing Admin Dashboard...');
    
    // Check if grouping algorithm is loaded
    if (typeof window.GroupingAlgorithm !== 'undefined') {
        console.log('✅ Grouping algorithm is available');
    } else {
        console.warn('⚠️ Grouping algorithm not yet loaded');
    }
    
    loadDashboardData();
};

// Navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.admin-nav button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName + '-section').classList.remove('hidden');
    document.getElementById('nav-' + sectionName).classList.add('active');
    
    // Load section-specific data
    switch(sectionName) {
        case 'overview':
            loadDashboardData();
            break;
        case 'reservations':
            loadReservations();
            break;
        case 'groups':
            loadGroups();
            break;
    }
}

// Overview Section
async function loadDashboardData() {
    try {
        await Promise.all([loadReservations(), loadGroups()]);
        updateStatistics();
        loadRecentActivity();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function updateStatistics() {
    const totalReservations = currentReservations.length;
    const completedTests = currentReservations.filter(r => r.personalityResults).length;
    const activeGroups = currentGroups.length;
    const upcomingEvents = getUpcomingEventsCount();
    
    document.getElementById('total-reservations').textContent = totalReservations;
    document.getElementById('completed-tests').textContent = completedTests;
    document.getElementById('active-groups').textContent = activeGroups;
    document.getElementById('upcoming-events').textContent = upcomingEvents;
}

function getUpcomingEventsCount() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingDates = new Set(
        currentReservations
            .filter(r => new Date(r.eventDate) >= today)
            .map(r => r.eventDate)
    );
    
    return upcomingDates.size;
}

function loadRecentActivity() {
    const recentContainer = document.getElementById('recent-activity');
    
    const recentReservations = currentReservations
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    if (recentReservations.length === 0) {
        recentContainer.innerHTML = '<div class="no-data">No recent activity</div>';
        return;
    }
    
    const html = recentReservations.map(reservation => {
        const date = new Date(reservation.createdAt).toLocaleDateString();
        const testStatus = reservation.personalityResults ? 'Completed' : 'Pending';
        return `
            <div class="activity-item" style="padding: 10px; border-bottom: 1px solid #f0f0f0;">
                <strong>${reservation.firstName} ${reservation.lastName}</strong> made a reservation for ${reservation.eventDate}
                <br><small>Created: ${date} | Test: ${testStatus}</small>
            </div>
        `;
    }).join('');
    
    recentContainer.innerHTML = html;
}

// Reservations Section
async function loadReservations() {
    // Show loading state
    if (document.getElementById('reservations-container')) {
        document.getElementById('reservations-container').innerHTML = 
            '<div class="loading">Loading reservations...</div>';
    }
    
    try {
        console.log('🔄 Starting to load reservations...');
        const reservations = await getAllReservations();
        currentReservations = reservations;
        console.log(`📋 Displaying ${reservations.length} reservations`);
        displayReservations(reservations);
    } catch (error) {
        console.error('❌ Error loading reservations:', error);
        if (document.getElementById('reservations-container')) {
            document.getElementById('reservations-container').innerHTML = 
                '<div class="no-data">Error loading reservations. Check console for details.</div>';
        }
    }
}

async function getAllReservations() {
    console.log('📊 Loading reservations...');
    
    if (typeof window.db === 'undefined') {
        console.log('⚠️ Firebase not available, using localStorage');
        return getLocalStorageReservations();
    }
    
    try {
        console.log('🔥 Fetching reservations from Firebase...');
        const querySnapshot = await window.getDocs(window.collection(window.db, 'reservations'));
        const reservations = [];
        
        querySnapshot.forEach((doc) => {
            console.log('📄 Found reservation:', doc.id, doc.data());
            reservations.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`✅ Loaded ${reservations.length} reservations from Firebase`);
        return reservations;
        
    } catch (error) {
        console.error('❌ Firebase error, falling back to localStorage:', error);
        return getLocalStorageReservations();
    }
}

function getLocalStorageReservations() {
    console.log('💾 Checking localStorage for reservations...');
    const reservations = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('reservation_')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                console.log('📄 Found localStorage reservation:', key, data);
                reservations.push({ id: key.replace('reservation_', ''), ...data });
            } catch (error) {
                console.error('❌ Error parsing reservation:', key, error);
            }
        }
    }
    
    console.log(`📦 Found ${reservations.length} reservations in localStorage`);
    return reservations;
}

function displayReservations(reservations) {
    const container = document.getElementById('reservations-container');
    
    if (reservations.length === 0) {
        container.innerHTML = '<div class="no-data">No reservations found</div>';
        return;
    }
    
    const html = `
        <table class="reservations-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Event Date</th>
                    <th>Time</th>
                    <th>Test Status</th>
                    <th>Created</th>
                </tr>
            </thead>
            <tbody>
                ${reservations.map(reservation => `
                    <tr>
                        <td>${reservation.firstName} ${reservation.lastName}</td>
                        <td>${reservation.email}</td>
                        <td>${reservation.eventDate}</td>
                        <td>${reservation.timeSlot}</td>
                        <td>${reservation.personalityResults ? 
                            `<span style="color: green;">✓ Completed (${reservation.personalityResults.score})</span>` : 
                            '<span style="color: orange;">⏳ Pending</span>'}</td>
                        <td>${new Date(reservation.createdAt).toLocaleDateString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function filterReservations() {
    const filterDate = document.getElementById('filter-date').value;
    if (!filterDate) {
        displayReservations(currentReservations);
        return;
    }
    
    const filtered = currentReservations.filter(r => r.eventDate === filterDate);
    displayReservations(filtered);
}

function clearDateFilter() {
    document.getElementById('filter-date').value = '';
    displayReservations(currentReservations);
}

function refreshReservations() {
    loadReservations();
}

function exportReservations() {
    if (currentReservations.length === 0) {
        alert('No reservations to export');
        return;
    }
    
    const csv = convertToCSV(currentReservations, [
        'firstName', 'lastName', 'email', 'eventDate', 'timeSlot', 'createdAt'
    ]);
    
    downloadCSV(csv, 'reservations.csv');
}

// Grouping Section
function loadReservationsForGrouping() {
    console.log('📅 Loading reservations for grouping...');
    
    const selectedDate = document.getElementById('grouping-date').value;
    console.log('Selected date:', selectedDate);
    
    if (!selectedDate) {
        console.log('No date selected');
        return;
    }
    
    console.log(`Total current reservations: ${currentReservations.length}`);
    
    const reservationsForDate = currentReservations.filter(r => 
        r.eventDate === selectedDate && r.personalityResults
    );
    
    console.log(`Reservations for ${selectedDate}: ${currentReservations.filter(r => r.eventDate === selectedDate).length}`);
    console.log(`With personality tests: ${reservationsForDate.length}`);
    
    const container = document.getElementById('grouping-preview');
    
    if (reservationsForDate.length === 0) {
        container.innerHTML = '<div class="no-data">No reservations with completed personality tests for this date</div>';
        document.getElementById('create-groups-btn').disabled = true;
        document.getElementById('preview-groups-btn').disabled = true;
        console.log('❌ No reservations available for grouping');
        return;
    }
    
    console.log('✅ Found reservations for grouping:', reservationsForDate);
    
    container.innerHTML = `
        <h4>Available for Grouping (${reservationsForDate.length} people):</h4>
        <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e0e0e0; padding: 15px; margin-top: 10px;">
            ${reservationsForDate.map(r => `
                <div style="display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #f0f0f0;">
                    <span>${r.firstName} ${r.lastName}</span>
                    <span>Score: ${r.personalityResults.score} (${r.personalityResults.personality?.type || 'Unknown'})</span>
                </div>
            `).join('')}
        </div>
    `;
    
    document.getElementById('create-groups-btn').disabled = false;
    document.getElementById('preview-groups-btn').disabled = false;
    console.log('✅ Grouping buttons enabled');
}

function previewGroups() {
    console.log('🔄 Preview Groups button clicked');
    
    try {
        const groups = generateGroupsForDate();
        
        if (!groups) {
            console.log('❌ No groups generated');
            return;
        }
        
        console.log(`✅ Generated ${groups.length} groups for preview`);
        displayGroupsPreview(groups);
        
    } catch (error) {
        console.error('❌ Error previewing groups:', error);
        alert('Error previewing groups: ' + error.message);
    }
}

function createGroups() {
    const groups = generateGroupsForDate();
    if (!groups) return;
    
    // Save groups to storage
    saveGroups(groups);
    alert('Groups created successfully!');
    
    // Switch to groups view
    showSection('groups');
}

function generateGroupsForDate() {
    console.log('🔧 Generating groups for date...');
    
    const selectedDate = document.getElementById('grouping-date').value;
    console.log('📅 Selected date:', selectedDate);
    
    if (!selectedDate) {
        alert('Please select a date');
        return null;
    }
    
    console.log(`📊 Total reservations available: ${currentReservations.length}`);
    
    const reservationsForDate = currentReservations.filter(r => 
        r.eventDate === selectedDate && r.personalityResults
    );
    
    console.log(`🎯 Reservations for ${selectedDate} with personality tests: ${reservationsForDate.length}`);
    console.log('👥 People to group:', reservationsForDate.map(r => `${r.firstName} ${r.lastName} (${r.personalityResults?.score})`));
    
    if (reservationsForDate.length === 0) {
        alert('No reservations with personality tests for this date');
        return null;
    }
    
    const options = {
        minGroupSize: parseInt(document.getElementById('min-group-size').value),
        maxGroupSize: parseInt(document.getElementById('max-group-size').value),
        scoreThreshold: parseInt(document.getElementById('score-threshold').value)
    };
    
    console.log('⚙️ Grouping options:', options);
    
    // Check if grouping algorithm is available
    if (typeof window.GroupingAlgorithm === 'undefined') {
        console.error('❌ GroupingAlgorithm not found on window object');
        console.log('🔄 Available window objects:', Object.keys(window).filter(key => key.includes('Group') || key.includes('Algorithm')));
        alert('Grouping algorithm not loaded. Please refresh the page and try again.');
        return null;
    }
    
    if (typeof window.GroupingAlgorithm.createDiningGroups !== 'function') {
        console.error('❌ createDiningGroups function not found');
        console.log('Available GroupingAlgorithm methods:', Object.keys(window.GroupingAlgorithm));
        alert('Grouping function not available. Please refresh the page and try again.');
        return null;
    }
    
    console.log('🔥 Calling grouping algorithm...');
    try {
        const groups = window.GroupingAlgorithm.createDiningGroups(reservationsForDate, options);
        console.log(`✅ Algorithm returned ${groups ? groups.length : 0} groups`);
        return groups;
    } catch (error) {
        console.error('❌ Grouping algorithm error:', error);
        alert('Error in grouping algorithm: ' + error.message);
        return null;
    }
}

function displayGroupsPreview(groups) {
    const container = document.getElementById('grouping-preview');
    
    const html = `
        <h4>Group Preview (${groups.length} groups):</h4>
        ${groups.map(group => `
            <div class="group-container" style="margin-top: 15px;">
                <div class="group-header">
                    <span>${group.tableAssignment} (${group.size} people)</span>
                    <span>Avg Score: ${group.averageScore}</span>
                </div>
                <div class="group-members">
                    ${group.members.map(member => `
                        <div class="member-item">
                            <div class="member-info">
                                <strong>${member.firstName} ${member.lastName}</strong><br>
                                <small>${member.email}</small>
                            </div>
                            <div class="member-score">${member.personalityResults.score}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}
    `;
    
    container.innerHTML = html;
}

// Groups Section
async function loadGroups() {
    try {
        const groups = await getAllGroups();
        currentGroups = groups;
        displayGroups(groups);
    } catch (error) {
        console.error('Error loading groups:', error);
    }
}

async function getAllGroups() {
    // For demo, we'll use localStorage
    const groups = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('groups_')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                groups.push(...data);
            } catch (error) {
                console.error('Error parsing groups:', key, error);
            }
        }
    }
    return groups;
}

function saveGroups(groups) {
    const eventDate = document.getElementById('grouping-date').value;
    const key = `groups_${eventDate}`;
    localStorage.setItem(key, JSON.stringify(groups));
    currentGroups = [...currentGroups, ...groups];
}

function displayGroups(groups) {
    const container = document.getElementById('groups-container');
    
    if (groups.length === 0) {
        container.innerHTML = '<div class="no-data">No groups found</div>';
        return;
    }
    
    const html = groups.map(group => `
        <div class="group-container">
            <div class="group-header">
                <span>${group.tableAssignment} (${group.size} people)</span>
                <span>Created: ${new Date(group.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="group-members">
                ${group.members.map(member => `
                    <div class="member-item">
                        <div class="member-info">
                            <strong>${member.firstName} ${member.lastName}</strong><br>
                            <small>${member.email} | ${member.personalityResults.personality?.type || 'Unknown Type'}</small>
                        </div>
                        <div class="member-score">${member.personalityResults.score}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Utility Functions
function convertToCSV(data, fields) {
    const header = fields.join(',');
    const rows = data.map(item => 
        fields.map(field => {
            let value = item[field] || '';
            if (typeof value === 'string' && value.includes(',')) {
                value = `"${value}"`;
            }
            return value;
        }).join(',')
    );
    
    return [header, ...rows].join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Notification functions (placeholder for SendGrid integration)
function loadGroupsForNotification() {
    const selectedDate = document.getElementById('notification-date').value;
    if (!selectedDate) return;
    
    // Implementation for loading groups for email notifications
    console.log('Loading groups for notification date:', selectedDate);
}

function sendTableAssignments() {
    // Implementation for sending emails via SendGrid
    alert('Table assignment emails would be sent here (requires SendGrid integration)');
}

function previewNotifications() {
    // Implementation for previewing email content
    alert('Email preview functionality');
}

function exportGroupsCSV() {
    if (currentGroups.length === 0) {
        alert('No groups to export');
        return;
    }
    
    // Flatten groups for CSV export
    const flatData = [];
    currentGroups.forEach(group => {
        group.members.forEach(member => {
            flatData.push({
                groupId: group.id,
                tableAssignment: group.tableAssignment,
                firstName: member.firstName,
                lastName: member.lastName,
                email: member.email,
                personalityScore: member.personalityResults.score,
                personalityType: member.personalityResults.personality?.type || 'Unknown'
            });
        });
    });
    
    const csv = convertToCSV(flatData, Object.keys(flatData[0]));
    downloadCSV(csv, 'groups.csv');
}

function exportEmailList() {
    if (currentGroups.length === 0) {
        alert('No groups to export');
        return;
    }
    
    const emails = [];
    currentGroups.forEach(group => {
        group.members.forEach(member => {
            emails.push({ email: member.email, name: `${member.firstName} ${member.lastName}` });
        });
    });
    
    const csv = convertToCSV(emails, ['email', 'name']);
    downloadCSV(csv, 'email-list.csv');
}

// Debug function for testing grouping
window.testGrouping = function() {
    console.log('🧪 Testing grouping functionality...');
    console.log('Current reservations:', currentReservations.length);
    console.log('GroupingAlgorithm available:', typeof window.GroupingAlgorithm !== 'undefined');
    
    if (typeof window.GroupingAlgorithm !== 'undefined') {
        console.log('GroupingAlgorithm methods:', Object.keys(window.GroupingAlgorithm));
    }
    
    // Try to generate test groups
    const testDate = document.getElementById('grouping-date').value;
    if (testDate) {
        loadReservationsForGrouping();
        console.log('🎯 Test grouping for date:', testDate);
    } else {
        console.log('❌ No date selected for testing');
    }
};