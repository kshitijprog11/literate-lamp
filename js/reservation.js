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
            
            // Demo Mode: Instant processing
            console.log('⚡ Demo Mode: Processing instantly...');
            
            // Instant save to localStorage 
            const reservationId = await saveReservation({
                ...reservationData,
                paymentId: 'demo_reservation_' + Date.now(),
                createdAt: new Date().toISOString(),
                status: 'confirmed',
                demoMode: true,
                amount: 75,
                paymentStatus: 'demo_mode'
            });
            
            console.log('🚀 Done! Redirecting immediately...');
            
            // Store data and redirect immediately
            sessionStorage.setItem('reservationId', reservationId);
            sessionStorage.setItem('reservationData', JSON.stringify(reservationData));
            
            // Immediate redirect
            window.location.href = 'personality-test.html';
            
        } catch (error) {
            console.error('Error processing reservation:', error);
            alert('Error: ' + error.message); // Simple error display
            
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

// Removed simulatePayment function - not needed for demo mode

async function saveReservation(reservationData) {
    // Quick validation
    if (!reservationData.email || !reservationData.firstName) {
        throw new Error('Missing required reservation data');
    }
    
    // Fast testing mode: Always use localStorage for instant saves
    if (window.FAST_TESTING_MODE || typeof window.db === 'undefined') {
        console.log('⚡ Fast mode: Instant localStorage save');
        const reservationId = 'res_' + Date.now();
        localStorage.setItem('reservation_' + reservationId, JSON.stringify(reservationData));
        console.log('✅ Reservation saved instantly with ID:', reservationId);
        return reservationId;
    }
    
    // This code path won't be reached in fast testing mode
    try {
        console.log('Saving to Firebase...');
        const docRef = await window.addDoc(window.collection(window.db, 'reservations'), reservationData);
        console.log('✅ Reservation saved to Firebase with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.warn('Firebase failed, fallback to localStorage:', error.message);
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