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
    
    async function sendConfirmationEmail(reservationData) {
        // Check if EmailJS is available
        if (typeof emailjs === 'undefined') {
            console.warn('EmailJS not loaded, skipping email');
            setTimeout(() => {
                showNotification('Confirmation details saved (email unavailable)', 'success');
            }, 2000);
            return;
        }

        try {
            const serviceID = 'service_xmmwg4f';
            const templateID = 'template_0fln8lu';
            
            const templateParams = {
                to_name: reservationData.firstName + ' ' + reservationData.lastName,
                to_email: reservationData.email,
                event_date: reservationData.eventDate,
                time_slot: reservationData.timeSlot,
                party_size: 1,
                dietary_restrictions: reservationData.dietaryRestrictions || 'None'
            };

            await emailjs.send(serviceID, templateID, templateParams);
            console.log('Confirmation email sent successfully to:', reservationData.email);
            setTimeout(() => {
                showNotification('Confirmation email sent to ' + reservationData.email, 'success');
            }, 2000);
        } catch (error) {
            console.error('Failed to send confirmation email:', error);
            setTimeout(() => {
                showNotification('Confirmation saved (email delivery pending)', 'success');
            }, 2000);
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

window.showNotification = function(message, type = 'success') {
    const div = document.createElement('div');
    div.textContent = message;
    div.style.position = 'fixed';
    div.style.top = '20px';
    div.style.right = '20px';
    div.style.padding = '15px 25px';
    div.style.backgroundColor = type === 'error' ? '#d32f2f' : '#2e7d32'; // Red or Green
    div.style.color = 'white';
    div.style.borderRadius = '5px';
    div.style.zIndex = '10000';
    div.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';
    div.style.fontWeight = 'bold';
    document.body.appendChild(div);
    
    // Remove after 3 seconds
    setTimeout(() => {
        div.style.opacity = '0';
        div.style.transition = 'opacity 0.5s ease';
        setTimeout(() => div.remove(), 500);
    }, 3000);
};
