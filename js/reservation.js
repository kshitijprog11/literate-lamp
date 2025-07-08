// Reservation form functionality
document.addEventListener('DOMContentLoaded', function() {
    // Demo Mode: Skip Stripe initialization since no card input needed
    console.log('Demo Mode: No credit card processing required for testing');
    
    // Set minimum date to today
    const eventDateInput = document.getElementById('eventDate');
    if (eventDateInput) {
        const today = new Date().toISOString().split('T')[0];
        eventDateInput.min = today;
    }
    
    // Form submission
    const form = document.getElementById('reservation-form');
    const submitButton = document.getElementById('submit-button');
    const spinner = document.getElementById('spinner');
    const buttonText = document.getElementById('button-text');
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Disable submit button and show spinner
        submitButton.disabled = true;
        spinner.classList.remove('hidden');
        buttonText.textContent = 'Processing...';
        
        try {
            // Validate form
            const formData = new FormData(form);
            const reservationData = Object.fromEntries(formData);
            
            if (!validateForm(reservationData)) {
                throw new Error('Please fill in all required fields');
            }
            
            // Demo Mode: Skip payment processing entirely
            console.log('Demo Mode: Skipping payment - no credit card required');
            
            // Save reservation to Firebase
            const reservationId = await saveReservation({
                ...reservationData,
                paymentId: 'demo_reservation_' + Date.now(),
                createdAt: new Date().toISOString(),
                status: 'confirmed',
                demoMode: true,
                amount: 75,
                paymentStatus: 'demo_mode'
            });
            
            // Store reservation ID for confirmation page
            sessionStorage.setItem('reservationId', reservationId);
            sessionStorage.setItem('reservationData', JSON.stringify(reservationData));
            
            // Redirect to personality test
            window.location.href = 'personality-test.html';
            
        } catch (error) {
            console.error('Error processing reservation:', error);
            showNotification(error.message, 'error');
            
            // Re-enable submit button
            submitButton.disabled = false;
            spinner.classList.add('hidden');
            buttonText.textContent = 'Complete Reservation - $75';
        }
    });
});

function validateForm(data) {
    const required = ['firstName', 'lastName', 'email', 'eventDate', 'timeSlot'];
    
    for (const field of required) {
        if (!data[field] || data[field].trim() === '') {
            return false;
        }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        throw new Error('Please enter a valid email address');
    }
    
    // Validate date is in future
    const selectedDate = new Date(data.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        throw new Error('Please select a future date');
    }
    
    return true;
}

async function simulatePayment(stripe, cardElement) {
    // In a real application, you would create a payment intent on your server
    // and then confirm it here. For this demo, we'll simulate success.
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if card element has valid data
    const {error, paymentMethod} = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
    });
    
    if (error) {
        return {error};
    }
    
    // Simulate successful payment
    return {
        paymentIntent: {
            id: 'pi_' + Math.random().toString(36).substr(2, 9),
            status: 'succeeded'
        }
    };
}

async function saveReservation(reservationData) {
    try {
        // Check if Firebase is available
        if (typeof window.db === 'undefined') {
            console.warn('Firebase not configured, saving to localStorage instead');
            const reservationId = 'res_' + Date.now();
            localStorage.setItem('reservation_' + reservationId, JSON.stringify(reservationData));
            return reservationId;
        }
        
        // Save to Firebase
        const docRef = await window.addDoc(window.collection(window.db, 'reservations'), reservationData);
        console.log('Reservation saved with ID:', docRef.id);
        return docRef.id;
        
    } catch (error) {
        console.error('Error saving reservation:', error);
        
        // Fallback to localStorage
        const reservationId = 'res_' + Date.now();
        localStorage.setItem('reservation_' + reservationId, JSON.stringify(reservationData));
        return reservationId;
    }
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone number formatting
document.getElementById('phone')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
    }
    e.target.value = value;
});

// Real-time validation
const inputs = document.querySelectorAll('input[required], select[required]');
inputs.forEach(input => {
    input.addEventListener('blur', function() {
        if (this.value.trim() === '') {
            this.style.borderColor = '#d32f2f';
        } else {
            this.style.borderColor = '#4caf50';
        }
    });
    
    input.addEventListener('input', function() {
        if (this.style.borderColor === 'rgb(211, 47, 47)' && this.value.trim() !== '') {
            this.style.borderColor = '#e0e0e0';
        }
    });
});