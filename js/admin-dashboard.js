// Admin Dashboard JavaScript
let currentReservations = [];
let currentGroups = [];
let currentGeneratedGroups = null;
const GROUPED_EVENTS_COLLECTION = 'grouped_events';
let saveGroupsButton = null;

document.addEventListener('DOMContentLoaded', function() {
    saveGroupsButton = document.getElementById('save-groups-btn');
    if (saveGroupsButton) {
        saveGroupsButton.addEventListener('click', handleManualGroupsSave);
    }

    // Try to initialize immediately if Firebase is ready
    if (typeof window.db !== 'undefined') {
        initializeDashboard();
    } else {
        // Wait for Firebase to be initialized
        setTimeout(() => {
            if (typeof window.db !== 'undefined') {
                initializeDashboard();
            } else {
                console.warn('Firebase not available, using localStorage only');
                initializeDashboard();
            }
        }, 2000);
    }
});

// Make this function available globally so Firebase can call it
window.initializeDashboard = function() {
    // Check if grouping algorithm is loaded
    if (typeof window.GroupingAlgorithm === 'undefined') {
        console.warn('Grouping algorithm not yet loaded');
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
        await loadReservations();
        await loadGroups();
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
        const testStatus = reservation.personalityTestStatus || 'Pending';
        const isCompleted = testStatus === 'Completed';
        const statusColor = isCompleted ? '#2e7d32' : '#c47c00';
        return `
            <div class="activity-item" style="padding: 10px; border-bottom: 1px solid #f0f0f0;">
                <strong>${reservation.firstName} ${reservation.lastName}</strong> made a reservation for ${reservation.eventDate}
                <br><small>
                    Created: ${date} | 
                    <span class="activity-test-status" style="color: ${statusColor}; font-weight: 600;">
                        Test: ${testStatus}
                    </span>
                </small>
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
        const reservations = await getAllReservations();
        currentReservations = reservations;
        displayReservations(reservations);
    } catch (error) {
        console.error('Error loading reservations:', error);
        if (document.getElementById('reservations-container')) {
            document.getElementById('reservations-container').innerHTML = 
                '<div class="no-data">Error loading reservations. Check console for details.</div>';
        }
    }
}

async function getAllReservations() {
    if (typeof window.db === 'undefined') {
        return getLocalStorageReservations();
    }
    
    try {
        const querySnapshot = await window.getDocs(window.collection(window.db, 'reservations'));
        const reservations = [];
        
        querySnapshot.forEach((doc) => {
            reservations.push({ id: doc.id, ...doc.data() });
        });
        
        return reservations;
        
    } catch (error) {
        console.error('Firebase error, falling back to localStorage:', error);
        return getLocalStorageReservations();
    }
}

function getLocalStorageReservations() {
    const reservations = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('reservation_')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                reservations.push({ id: key.replace('reservation_', ''), ...data });
            } catch (error) {
                console.error('Error parsing reservation:', key, error);
            }
        }
    }
    
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
    const selectedDate = document.getElementById('grouping-date').value;
    
    currentGeneratedGroups = null;
    setSaveGroupsButtonDisabled(true);
    
    if (!selectedDate) {
        return;
    }
    
    const reservationsForDate = currentReservations.filter(r => 
        r.eventDate === selectedDate && r.personalityResults
    );
    
    const container = document.getElementById('grouping-preview');
    
    if (reservationsForDate.length === 0) {
        container.innerHTML = '<div class="no-data">No reservations with completed personality tests for this date</div>';
        document.getElementById('create-groups-btn').disabled = true;
        document.getElementById('preview-groups-btn').disabled = true;
        return;
    }
    
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
}

function previewGroups() {
    try {
        const groups = generateGroupsForDate();
        
        if (!groups) {
            return;
        }
        
        displayGroupsPreview(groups);
        
    } catch (error) {
        console.error('Error previewing groups:', error);
        alert('Error previewing groups: ' + error.message);
    }
}

function createGroups() {
    const groups = generateGroupsForDate({ autoSave: true });
    if (!groups) return;
    
    alert('Groups created successfully!');
    
    // Switch to groups view
    showSection('groups');
}

function generateGroupsForDate(customOptions = {}) {
    const { autoSave = false, ...overrideOptions } = customOptions;
    const selectedDate = document.getElementById('grouping-date').value;
    
    if (!selectedDate) {
        alert('Please select a date');
        return null;
    }
    
    const reservationsForDate = currentReservations.filter(r => 
        r.eventDate === selectedDate && r.personalityResults
    );
    
    if (reservationsForDate.length === 0) {
        alert('No reservations with personality tests for this date');
        return null;
    }
    
    const options = {
        minGroupSize: parseInt(document.getElementById('min-group-size').value),
        maxGroupSize: parseInt(document.getElementById('max-group-size').value),
        scoreThreshold: parseInt(document.getElementById('score-threshold').value),
        eventDate: selectedDate,
        ...overrideOptions
    };
    
    // Check if grouping algorithm is available
    if (typeof window.GroupingAlgorithm === 'undefined' || typeof window.GroupingAlgorithm.createDiningGroups !== 'function') {
        console.error('GroupingAlgorithm not found or invalid');
        alert('Grouping algorithm not loaded. Please refresh the page and try again.');
        return null;
    }
    
    try {
        const groups = window.GroupingAlgorithm.createDiningGroups(reservationsForDate, options);
        
        if (groups && groups.length > 0) {
            currentGeneratedGroups = {
                date: selectedDate,
                groups
            };
            setSaveGroupsButtonDisabled(false);
        } else {
            currentGeneratedGroups = null;
            setSaveGroupsButtonDisabled(true);
        }
        
        if (autoSave) {
            autoSaveGeneratedGroups(selectedDate, groups);
        }
        
        return groups;
    } catch (error) {
        console.error('Grouping algorithm error:', error);
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

function setSaveGroupsButtonDisabled(disabled = true) {
    if (saveGroupsButton) {
        saveGroupsButton.disabled = disabled;
    }
}

async function handleManualGroupsSave() {
    if (!currentGeneratedGroups || !Array.isArray(currentGeneratedGroups.groups) || currentGeneratedGroups.groups.length === 0) {
        alert('Generate groups before saving them to the database.');
        return;
    }

    const eventDate = currentGeneratedGroups.date;
    if (!eventDate) {
        alert('Unable to determine the event date for these groups.');
        return;
    }

    setSaveGroupsButtonDisabled(true);

    try {
        await saveGroups(currentGeneratedGroups.groups, eventDate);
        alert('Groups saved successfully!');

        const notificationDateInput = document.getElementById('notification-date');
        if (notificationDateInput) {
            notificationDateInput.value = eventDate;
        }

        showSection('notifications');
        await loadGroupsForNotification();
    } catch (error) {
        console.error('Error saving groups manually:', error);
        alert('Error saving groups: ' + error.message);
        setSaveGroupsButtonDisabled(false);
    }
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

function autoSaveGeneratedGroups(eventDate, groups) {
    if (!groups || groups.length === 0) {
        return;
    }
    
    saveGroups(groups, eventDate).catch(error => {
        console.error('Auto-save groups failed:', error);
    });
}

async function saveGroups(groups, eventDateOverride) {
    if (!groups || groups.length === 0) {
        console.warn('No groups provided to save.');
        return;
    }
    
    const eventDate = eventDateOverride || document.getElementById('grouping-date')?.value;
    
    if (!eventDate) {
        console.warn('Cannot save groups without an event date.');
        return;
    }
    
    const enrichedGroups = groups.map(group => ({
        ...group,
        eventDate: group.eventDate || eventDate
    }));
    
    saveGroupsToLocalStorage(enrichedGroups, eventDate);
    
    // Replace existing groups for this date in memory to keep state in sync
    currentGroups = [
        ...currentGroups.filter(group => group.eventDate !== eventDate),
        ...enrichedGroups
    ];
    
    try {
        await saveGroupsToFirestore(eventDate, enrichedGroups);
    } catch (error) {
        console.error('Failed to persist groups to Firestore:', error);
    }
}

function saveGroupsToLocalStorage(groups, eventDate) {
    const key = `groups_${eventDate}`;
    try {
        localStorage.setItem(key, JSON.stringify(groups));
    } catch (error) {
        console.error('Error saving groups to localStorage:', error);
    }
}

function fetchGroupsFromLocalStorage(eventDate) {
    const key = `groups_${eventDate}`;
    const storedGroups = localStorage.getItem(key);
    
    if (!storedGroups) {
        return [];
    }
    
    try {
        return JSON.parse(storedGroups);
    } catch (error) {
        console.error('Error parsing local groups for date:', eventDate, error);
        return [];
    }
}

async function saveGroupsToFirestore(eventDate, groups) {
    if (typeof window.db === 'undefined' || !window.doc || !window.setDoc) {
        return;
    }
    
    const timestamp = new Date().toISOString();
    const docRef = window.doc(window.db, GROUPED_EVENTS_COLLECTION, eventDate);
    let createdAtValue = timestamp;
    
    if (window.getDoc) {
        try {
            const existingSnapshot = await window.getDoc(docRef);
            if (existingSnapshot.exists()) {
                const existingData = existingSnapshot.data();
                createdAtValue = existingData.createdAt || timestamp;
            }
        } catch (error) {
            console.warn('Unable to read existing grouped event document:', error);
        }
    }
    
    try {
        await window.setDoc(docRef, {
            date: eventDate,
            groups,
            createdAt: createdAtValue,
            updatedAt: timestamp
        });
    } catch (error) {
        console.error('Error saving grouped event to Firestore:', error);
        throw error;
    }
}

async function fetchGroupsFromFirestore(eventDate) {
    if (typeof window.db === 'undefined' || !window.doc || !window.getDoc) {
        return [];
    }
    
    try {
        const docRef = window.doc(window.db, GROUPED_EVENTS_COLLECTION, eventDate);
        const snapshot = await window.getDoc(docRef);
        
        if (!snapshot.exists()) {
            return [];
        }
        
        const data = snapshot.data();
        return data?.groups || [];
    } catch (error) {
        console.error('Error fetching groups from Firestore:', error);
        return [];
    }
}

async function fetchGroupsForDate(eventDate) {
    return fetchGroupsFromFirestore(eventDate);
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
                <span>Event: ${group.eventDate || 'Unknown'} | Created: ${new Date(group.createdAt).toLocaleDateString()}</span>
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

function filterGroups() {
    const filterDate = document.getElementById('groups-filter-date').value;
    if (!filterDate) {
        displayGroups(currentGroups);
        return;
    }
    
    const filtered = currentGroups.filter(g => g.eventDate === filterDate);
    
    displayGroups(filtered);
}

function clearGroupsFilter() {
    document.getElementById('groups-filter-date').value = '';
    displayGroups(currentGroups);
}

function refreshGroups() {
    loadGroups();
}

// Update saveGroups to include eventDate
function saveGroupsWithDate(groups, eventDate) {
    const enrichedGroups = groups.map(g => ({ ...g, eventDate }));
    const key = `groups_${eventDate}`;
    localStorage.setItem(key, JSON.stringify(enrichedGroups));
    currentGroups = [...currentGroups, ...enrichedGroups];
}
// But I need to replace the original saveGroups.
// Rewriting saveGroups in the file content above.

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
async function loadGroupsForNotification() {
    const selectedDate = document.getElementById('notification-date').value;
    const previewContainer = document.getElementById('notification-preview');
    
    if (!selectedDate) {
        previewContainer.innerHTML = '<p>Select an event date to see groups that can receive table assignment emails.</p>';
        setNotificationButtonsDisabled(true);
        currentGroups = [];
        return;
    }
    
    console.log('Searching for groups on date:', selectedDate);
    previewContainer.innerHTML = '<div class="loading">Searching for groups...</div>';
    setNotificationButtonsDisabled(true);
    
    const groups = await fetchGroupsForDate(selectedDate);
    
    if (!groups || groups.length === 0) {
        previewContainer.innerHTML = '<div class="no-data">No groups found for this date. Generate groups first in the Create Groups tab.</div>';
        currentGroups = [];
        return;
    }
    
    currentGroups = groups;
    renderNotificationPreview(groups, selectedDate);
    setNotificationButtonsDisabled(false);
}

function renderNotificationPreview(groups, eventDate) {
    const previewContainer = document.getElementById('notification-preview');
    const totalGuests = groups.reduce((sum, group) => sum + (group.members?.length || 0), 0);
    
    const html = `
        <h4>${groups.length} groups ready for ${eventDate}</h4>
        <p>${totalGuests} guests will receive table assignments.</p>
        ${groups.map(group => `
            <div class="group-container">
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
                            <div class="member-score">${member.personalityResults?.score || 'N/A'}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}
    `;
    
    previewContainer.innerHTML = html;
}

function setNotificationButtonsDisabled(disabled) {
    const sendButton = document.getElementById('send-notifications-btn');
    const previewButton = document.getElementById('preview-notifications-btn');
    
    if (sendButton) {
        sendButton.disabled = disabled;
    }
    
    if (previewButton) {
        previewButton.disabled = disabled;
    }
}

async function sendTableAssignments() {
    if (typeof emailjs === 'undefined') {
        alert('EmailJS not loaded. Cannot send emails.');
        return;
    }
    
    // Get date from notification date picker or fallback
    const dateStr = document.getElementById('notification-date').value || 'Upcoming Event';
    
    if (currentGroups.length === 0) {
        alert('No groups loaded to notify.');
        return;
    }

    const totalPeople = currentGroups.reduce((acc, g) => acc + g.members.length, 0);
    if (!confirm(`Are you sure you want to send emails to ${totalPeople} people for ${dateStr}?`)) {
        return;
    }

    const serviceID = 'service_xmmwg4f';
    const templateID = 'template_0fln8lu';
    
    let sentCount = 0;
    let errorCount = 0;

    alert('Sending emails... check console for progress.');

    for (let groupIndex = 0; groupIndex < currentGroups.length; groupIndex++) {
        const group = currentGroups[groupIndex];
        for (const member of group.members) {
            if (!member.email) {
                console.error('Skipping member with missing email:', member);
                errorCount++;
                continue;
            }

            const templateParams = {
                email: member.email,
                name: member.firstName,
                message: `You have been assigned to Table ${groupIndex + 1}`,
                date: group.eventDate || dateStr
            };

            console.log('Sending to:', member.email, templateParams);

            try {
                await emailjs.send(serviceID, templateID, templateParams, 'bBneJjbjP_6-Qzbpx');
                console.log(`Email sent to ${member.email}`);
                sentCount++;
            } catch (e) {
                console.error(`Failed to send to ${member.email}`, e);
                errorCount++;
            }
        }
    }

    alert(`Notifications process complete! Success: ${sentCount}, Failed: ${errorCount}`);
}

function previewNotifications() {
    alert('Email preview functionality');
}

function exportGroupsCSV() {
    if (currentGroups.length === 0) {
        alert('No groups to export');
        return;
    }
    
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
    const testDate = document.getElementById('grouping-date').value;
    if (testDate) {
        loadReservationsForGrouping();
    }
};
