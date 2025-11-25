// TODO: Add EmailJS SDK to the HTML head: <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
// Reservation form functionality
document.addEventListener('DOMContentLoaded', function() {
    // Set minimum date to today
    const eventDateInput = document.getElementById('eventDate');
    if (eventDateInput) {
        const today = new Date().toISOString().split('T')[0];
        eventDateInput.min = today;
    }
    
    // Form submission elements
    const form = document.getElementById('reservation-form');
    const submitButton = document.getElementById('submit-button');
    const spinner = document.getElementById('spinner');
    const buttonText = document.getElementById('button-text');
    
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            // Disable submit button and show spinner to indicate processing
            if (submitButton) submitButton.disabled = true;
            if (spinner) spinner.classList.remove('hidden');
            if (buttonText) buttonText.textContent = 'Sending...';
            
            try {
                // Validate form data
                const formData = new FormData(form);
                const reservationData = Object.fromEntries(formData);
                
                if (!validateForm(reservationData)) {
                    throw new Error('Please fill in all required fields');
                }
                
                // Process reservation (save to Firebase or localStorage)
                const reservationId = await saveReservation({
                    ...reservationData,
                    createdAt: new Date().toISOString(),
                    status: 'confirmed',
                    amount: 75,
                    paymentStatus: 'pending' // No payment integration
                });
                
                // Send confirmation email
                await sendConfirmationEmail(reservationData);
                
                // Store data in session for the next step
                sessionStorage.setItem('reservationId', reservationId);
                sessionStorage.setItem('reservationData', JSON.stringify(reservationData));
                
                // Redirect to confirmation page
                window.location.href = 'confirmation.html';
                
            } catch (error) {
                console.error('Error processing reservation:', error);
                alert('Error: ' + error.message);
                
                // Re-enable submit button on error
                if (submitButton) submitButton.disabled = false;
                if (spinner) spinner.classList.add('hidden');
                if (buttonText) buttonText.textContent = 'Complete Reservation - $75';
            }
        });
    }
});

/**
 * Validates the reservation form data
 * @param {Object} data - The form data object
 * @returns {boolean} - True if valid, throws error otherwise
 */
function validateForm(data) {
    const requiredFields = ['firstName', 'lastName', 'email', 'eventDate', 'timeSlot'];
    
    // Check for empty fields
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            return false;
        }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        throw new Error('Please enter a valid email address');
    }
    
    // Validate date is in the future
    const selectedDate = new Date(data.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        throw new Error('Please select a future date');
    }
    
    return true;
}

/**
 * Saves reservation data to the database (Firebase) or localStorage fallback
 * @param {Object} reservationData - The reservation details
 * @returns {Promise<string>} - The reservation ID
 */
async function saveReservation(reservationData) {
    // Basic validation
    if (!reservationData.email || !reservationData.firstName) {
        throw new Error('Missing required reservation data');
    }
    
    // Try Firebase first if available
    if (!window.FAST_TESTING_MODE && typeof window.db !== 'undefined' && window.addDoc && window.collection) {
        try {
            // Add 5-second timeout for Firebase operation
            const savePromise = window.addDoc(window.collection(window.db, 'reservations'), reservationData);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Database timeout')), 5000)
            );
            
            const docRef = await Promise.race([savePromise, timeoutPromise]);
            return docRef.id;
            
        } catch (error) {
            console.warn('Database save failed, falling back to local storage:', error.message);
            // Fall through to localStorage
        }
    }
    
    // LocalStorage fallback (for offline or demo mode)
    const reservationId = 'res_' + Date.now();
    try {
        localStorage.setItem('reservation_' + reservationId, JSON.stringify(reservationData));
        return reservationId;
    } catch (e) {
        throw new Error('Could not save reservation locally. Please check your browser settings.');
    }
}

// Phone number formatting
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
        }
        e.target.value = value;
    });
}

// Real-time validation feedback
const requiredInputs = document.querySelectorAll('input[required], select[required]');
requiredInputs.forEach(input => {
    input.addEventListener('blur', function() {
        if (this.value.trim() === '') {
            this.style.borderColor = '#d32f2f'; // Red for error
        } else {
            this.style.borderColor = '#4caf50'; // Green for success
        }
    });
    
    input.addEventListener('input', function() {
        // Clear error color when user starts typing
        if (this.style.borderColor === 'rgb(211, 47, 47)' && this.value.trim() !== '') {
            this.style.borderColor = '#e0e0e0';
        }
    });
});

/**
 * Sends a confirmation email using EmailJS
 * @param {Object} data - The reservation data
 */
async function sendConfirmationEmail(data) {
    // Check if EmailJS is available
    if (typeof emailjs === 'undefined') {
        console.warn('EmailJS not loaded, skipping email');
        return;
    }

    try {
        // Replace with your Service ID and Template ID
        const serviceID = 'YOUR_SERVICE_ID';
        const templateID = 'YOUR_TEMPLATE_ID';
        
        const templateParams = {
            to_name: data.firstName + ' ' + data.lastName,
            to_email: data.email,
            event_date: data.eventDate,
            time_slot: data.timeSlot,
            party_size: 1, // Defaulting to 1 for individual reservations
            dietary_restrictions: data.dietaryRestrictions || 'None'
        };

        await emailjs.send(serviceID, templateID, templateParams);
        console.log('Confirmation email sent successfully');
    } catch (error) {
        console.error('Failed to send confirmation email:', error);
        // We don't block the flow if email fails, just log it
    }
}
