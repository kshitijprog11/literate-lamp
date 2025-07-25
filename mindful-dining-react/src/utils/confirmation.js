// Confirmation page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadReservationDetails();
    
    function loadReservationDetails() {
        try {
            const reservationId = sessionStorage.getItem('reservationId');
            const reservationData = JSON.parse(sessionStorage.getItem('reservationData') || '{}');
            const personalityResults = JSON.parse(sessionStorage.getItem('personalityResults') || '{}');
            
            if (!reservationId || !reservationData.firstName) {
                // Redirect to home if no reservation data
                showNotification('No reservation found. Please make a new reservation.', 'error');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
                return;
            }
            
            displayReservationDetails(reservationId, reservationData, personalityResults);
            
            // Send confirmation email (simulate)
            sendConfirmationEmail(reservationData);
            
        } catch (error) {
            console.error('Error loading reservation details:', error);
            showNotification('Error loading reservation details', 'error');
        }
    }
    
    function displayReservationDetails(reservationId, data, personality) {
        const detailsContainer = document.getElementById('reservation-details');
        
        // Format date
        const eventDate = new Date(data.eventDate);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        detailsContainer.innerHTML = `
            <div class="detail-row">
                <span class="detail-label">Reservation ID:</span>
                <span class="detail-value">${reservationId}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${data.firstName} ${data.lastName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${data.email}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${formattedDate}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${data.timeSlot}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Personality Type:</span>
                <span class="detail-value">${personality.personality?.type || 'Assessment Completed'}</span>
            </div>
            ${data.dietaryRestrictions ? `
                <div class="detail-row">
                    <span class="detail-label">Dietary Restrictions:</span>
                    <span class="detail-value">${data.dietaryRestrictions}</span>
                </div>
            ` : ''}
            <div class="detail-row">
                <span class="detail-label">Amount Paid:</span>
                <span class="detail-value">$75.00</span>
            </div>
        `;
    }
    
    function sendConfirmationEmail(reservationData) {
        // In a real application, this would trigger an email via your backend
        // For this demo, we'll just show a notification
        setTimeout(() => {
            showNotification('Confirmation email sent to ' + reservationData.email, 'success');
        }, 2000);
        
        // Simulate email sending to backend
        simulateEmailSend(reservationData);
    }
    
    async function simulateEmailSend(data) {
        try {
            // This would typically be a POST request to your backend
            console.log('Sending confirmation email for:', data.email);
            
            // In a real app, you might call SendGrid API through your backend:
            /*
            const response = await fetch('/api/send-confirmation-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: data.email,
                    name: `${data.firstName} ${data.lastName}`,
                    reservationId: sessionStorage.getItem('reservationId'),
                    eventDate: data.eventDate,
                    timeSlot: data.timeSlot
                })
            });
            */
            
        } catch (error) {
            console.error('Error sending confirmation email:', error);
        }
    }
    
    // Print functionality
    const printButton = document.querySelector('button[onclick="window.print()"]');
    if (printButton) {
        printButton.addEventListener('click', function() {
            // Add print-specific styles
            const printStyles = `
                <style media="print">
                    .navbar, .action-buttons, .contact-info { display: none !important; }
                    .confirmation-container { box-shadow: none !important; margin: 0 !important; }
                    body { background: white !important; }
                </style>
            `;
            
            document.head.insertAdjacentHTML('beforeend', printStyles);
            
            setTimeout(() => {
                window.print();
            }, 100);
        });
    }
    
    // Clear session data after successful confirmation
    // Keep it for now in case user refreshes page
    setTimeout(() => {
        // Only clear after user has had time to see confirmation
        // sessionStorage.clear();
    }, 300000); // Clear after 5 minutes
});

// Additional utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDateTime(dateString, timeString) {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    return `${formattedDate} at ${timeString}`;
}

// Export for potential future use
window.formatCurrency = formatCurrency;
window.formatDateTime = formatDateTime;