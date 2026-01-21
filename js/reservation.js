import { getFirestore, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { personalityQuestions, calculatePersonalityScore, determinePersonalityType, buildPersonalityAnswerSummary } from './personality-test.js';

const totalPersonalityQuestions = personalityQuestions.length;
let currentQuestionIndex = 0;
const savedPersonalityAnswers = new Array(totalPersonalityQuestions).fill(null);

let questionContentElement = null;
let questionCounterElement = null;
let progressFillElement = null;
let previousButtonElement = null;
let nextButtonElement = null;
let summaryElementRef = null;
let finishButtonElement = null;

// Reservation form functionality
document.addEventListener('DOMContentLoaded', () => {
    setMinimumReservationDate();

    const form = document.getElementById('reservation-form');
    const submitButton = document.getElementById('submit-button');
    const reservationDetailsSection = document.getElementById('reservation-details-section');
    const personalityTestSection = document.getElementById('personality-test-section');
    const questionsContainer = document.getElementById('personality-questions');
    const finishButton = document.getElementById('finish-button');
    const finishButtonText = document.getElementById('finish-button-text');
    const finishSpinner = document.getElementById('finish-spinner');
    const editReservationButton = document.getElementById('edit-reservation-button');
    const summaryContainer = document.getElementById('personality-inline-summary');

    let currentStep = 'details';
    let pendingReservationData = null;

    summaryElementRef = summaryContainer;
    finishButtonElement = finishButton;
    if (finishButtonElement) {
        finishButtonElement.style.display = 'none';
    }

    renderPersonalityQuestions(questionsContainer);
    updateAnsweredSummary(summaryElementRef, savedPersonalityAnswers);

    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            if (currentStep !== 'details') {
                return;
            }

            const formData = new FormData(form);
            const reservationData = Object.fromEntries(formData);

            let isValid = false;
            try {
                isValid = validateForm(reservationData);
            } catch (validationError) {
                alert('Error: ' + validationError.message);
                return;
            }

            if (!isValid) {
                alert('Please fill in all required fields');
                return;
            }

            pendingReservationData = {
                ...reservationData,
                createdAt: new Date().toISOString(),
                status: 'pending-personality',
                amount: 75,
                paymentStatus: 'pending'
            };

            currentStep = 'personality';
            showPersonalityStep(reservationDetailsSection, personalityTestSection);
            window.scrollTo({
                top: personalityTestSection ? personalityTestSection.offsetTop - 40 : 0,
                behavior: 'smooth'
            });
        });
    }

    if (finishButton) {
        finishButton.addEventListener('click', async () => {
            if (!pendingReservationData) {
                alert('Please complete your reservation details first.');
                return;
            }

            const answerIndices = collectAnswerIndices(savedPersonalityAnswers);
            if (!answerIndices) {
                alert('Please answer every question to finish your booking.');
                return;
            }

            const score = calculatePersonalityScore(answerIndices);
            const personality = determinePersonalityType(score);
            const answerSummary = buildPersonalityAnswerSummary(answerIndices);

            // STEP 2: Retrieve Reservation ID and update original Firestore document
            // so the admin dashboard sees the test as Completed instead of Pending.
            // Retrieve ID
            const reservationId = localStorage.getItem('currentReservationId');
            
            if (reservationId && window.db) {
                try {
                    // Force the update
                    const reservationRef = doc(window.db, 'reservations', reservationId);
                    await updateDoc(reservationRef, {
                        personalityResults: { score: score, answers: answerSummary },
                        personalityTestStatus: 'Completed',
                        status: 'Confirmed'
                    });
                    console.log("✅ Status Updated to Completed");
                } catch (e) {
                    console.error("❌ Update Failed:", e);
                }
            } else {
                console.warn("⚠️ Skipping update: No ID or DB found");
            }

            // Build payload for confirmation/localStorage
            const personalityResults = {
                score,
                personality,
                answers: answerSummary,
                completedAt: new Date().toISOString()
            };

            const reservationPayload = {
                ...pendingReservationData,
                personalityResults,
                personalityTestStatus: 'Completed',
                personalityScore: score,
                personalityProfile: personality.type,
                personalityDetails: {
                    description: personality.description,
                    traits: personality.traits,
                    answers: answerSummary
                },
                completedPersonalityAt: personalityResults.completedAt,
                status: 'confirmed'
            };

            toggleFinishButtonState(true, finishButton, finishSpinner, finishButtonText);

            try {
                const finalReservationId = await saveReservation(reservationPayload);
                await sendConfirmationEmail(reservationPayload);

                sessionStorage.setItem('reservationId', finalReservationId);
                sessionStorage.setItem('reservationData', JSON.stringify(reservationPayload));

                window.location.href = 'confirmation.html';
            } catch (error) {
                console.error('Error finalizing reservation:', error);
                alert('Error: ' + error.message);
            } finally {
                toggleFinishButtonState(false, finishButton, finishSpinner, finishButtonText);
            }
        });
    }

    if (editReservationButton) {
        editReservationButton.addEventListener('click', () => {
            currentStep = 'details';
            showReservationStep(reservationDetailsSection, personalityTestSection);
            if (submitButton) {
                submitButton.focus();
            }
        });
    }

    setupPhoneFormatting();
    setupRealTimeValidation();
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
            
            // STEP 1: Save the Reservation ID so the personality test
            // can later update the original document instead of creating a new one.
            try {
                localStorage.setItem('currentReservationId', docRef.id);
                console.log('SAVED Reservation ID:', docRef.id);
            } catch (storageError) {
                console.warn('Unable to persist currentReservationId:', storageError);
            }

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

function setMinimumReservationDate() {
    const eventDateInput = document.getElementById('eventDate');
    if (eventDateInput) {
        const today = new Date().toISOString().split('T')[0];
        eventDateInput.min = today;
    }
}

function renderPersonalityQuestions(container) {
    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="personality-progress">
            <div class="personality-progress-fill" id="personality-progress-fill"></div>
        </div>
        <div id="personality-question-counter" class="personality-question-counter"></div>
        <div id="personality-question-content"></div>
        <div class="test-navigation">
            <button type="button" id="personality-prev" class="nav-button secondary-button">Previous</button>
            <button type="button" id="personality-next" class="nav-button submit-button">Next</button>
        </div>
    `;

    questionContentElement = container.querySelector('#personality-question-content');
    questionCounterElement = container.querySelector('#personality-question-counter');
    progressFillElement = container.querySelector('#personality-progress-fill');
    previousButtonElement = container.querySelector('#personality-prev');
    nextButtonElement = container.querySelector('#personality-next');

    if (questionContentElement) {
        questionContentElement.addEventListener('change', handleOptionChange);
    }

    if (previousButtonElement) {
        previousButtonElement.addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                renderQuestion(currentQuestionIndex - 1);
            }
        });
    }

    if (nextButtonElement) {
        nextButtonElement.addEventListener('click', () => {
            if (savedPersonalityAnswers[currentQuestionIndex] === null) {
                showSelectionRequiredMessage();
                return;
            }

            if (currentQuestionIndex < totalPersonalityQuestions - 1) {
                renderQuestion(currentQuestionIndex + 1);
            }
        });
    }

    renderQuestion(0);
}

function renderQuestion(index) {
    if (!questionContentElement || index < 0 || index >= totalPersonalityQuestions) {
        return;
    }

    currentQuestionIndex = index;
    const question = personalityQuestions[index];

    if (questionCounterElement) {
        questionCounterElement.textContent = `Question ${index + 1} of ${totalPersonalityQuestions}`;
    }

    if (progressFillElement) {
        const denominator = Math.max(totalPersonalityQuestions - 1, 1);
        const progressPercent = (index / denominator) * 100;
        progressFillElement.style.width = `${progressPercent}%`;
    }

    questionContentElement.innerHTML = `
        <div class="personality-question-card" data-question="${index}">
            <h3 class="personality-question-title">${question.text}</h3>
            <div class="personality-options">
                ${question.options.map((option, optionIndex) => `
                    <label class="personality-option-card option" data-option-index="${optionIndex}">
                        <input 
                            type="radio" 
                            class="personality-option-input" 
                            name="personality-question-${index}" 
                            value="${optionIndex}" 
                            data-question-index="${index}"
                        >
                        <span class="personality-option-text">${option.text}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;

    const savedValue = savedPersonalityAnswers[index];
    if (typeof savedValue === 'number') {
        const savedInput = questionContentElement.querySelector(`input[value="${savedValue}"]`);
        if (savedInput) {
            savedInput.checked = true;
            updateOptionCardState(savedValue);
        }
    } else {
        updateOptionCardState(null);
    }

    updateNavigationState();
}

function handleOptionChange(event) {
    const target = event.target;
    if (!target.classList.contains('personality-option-input')) {
        return;
    }

    const questionIndex = Number(target.dataset.questionIndex);
    const selectedValue = Number(target.value);
    savedPersonalityAnswers[questionIndex] = selectedValue;

    updateOptionCardState(selectedValue);
    updateAnsweredSummary(summaryElementRef, savedPersonalityAnswers);
}

function updateOptionCardState(selectedValue) {
    if (!questionContentElement) {
        return;
    }

    const optionCards = questionContentElement.querySelectorAll('.personality-option-card');
    optionCards.forEach(card => {
        const optionIndex = Number(card.dataset.optionIndex);
        card.classList.toggle('selected', selectedValue !== null && optionIndex === selectedValue);
    });
}

function updateNavigationState() {
    if (previousButtonElement) {
        previousButtonElement.style.visibility = currentQuestionIndex === 0 ? 'hidden' : 'visible';
    }

    if (nextButtonElement) {
        nextButtonElement.style.display = currentQuestionIndex === totalPersonalityQuestions - 1 ? 'none' : '';
    }

    if (finishButtonElement) {
        finishButtonElement.style.display = currentQuestionIndex === totalPersonalityQuestions - 1 ? '' : 'none';
    }
}

function showSelectionRequiredMessage() {
    if (summaryElementRef) {
        summaryElementRef.textContent = 'Please select an option before continuing.';
        return;
    }

    alert('Please select an option before continuing.');
}

function collectAnswerIndices(answers) {
    if (!Array.isArray(answers) || answers.length !== personalityQuestions.length) {
        return null;
    }

    if (answers.some(answer => answer === null || typeof answer === 'undefined')) {
        return null;
    }

    return answers.map(Number);
}

function updateAnsweredSummary(summaryElement, answers) {
    if (!summaryElement || !answers) {
        return;
    }

    const answered = answers.filter(answer => answer !== null).length;
    const total = personalityQuestions.length;

    if (answered === total) {
        summaryElement.textContent = 'All questions answered. Select "Finish & Book" to complete your reservation.';
    } else {
        summaryElement.textContent = `${answered} of ${total} questions answered.`;
    }
}

function showPersonalityStep(detailsSection, testSection) {
    if (detailsSection) {
        detailsSection.style.display = 'none';
    }
    if (testSection) {
        testSection.style.display = 'block';
    }
}

function showReservationStep(detailsSection, testSection) {
    if (detailsSection) {
        detailsSection.style.display = '';
    }
    if (testSection) {
        testSection.style.display = 'none';
    }
}

function toggleFinishButtonState(isLoading, button, spinner, textElement) {
    if (!button) {
        return;
    }

    button.disabled = isLoading;

    if (spinner) {
        spinner.classList.toggle('hidden', !isLoading);
    }

    if (textElement) {
        textElement.textContent = isLoading ? 'Booking...' : 'Finish & Book';
    }
}

function setupPhoneFormatting() {
    const phoneInput = document.getElementById('phone');
    if (!phoneInput) {
        return;
    }

    phoneInput.addEventListener('input', (event) => {
        let value = event.target.value.replace(/\D/g, '');
        if (value.length >= 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
        }
        event.target.value = value;
    });
}

function setupRealTimeValidation() {
    const requiredInputs = document.querySelectorAll('input[required], select[required]');
    requiredInputs.forEach(input => {
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
}

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
        const serviceID = 'service_xmmwg4f';
        const templateID = 'template_0fln8lu';
        const publicKey = 'bBneJjbjP_6-Qzbpx';
        
        // Initialize EmailJS explicitly to be safe
        emailjs.init(publicKey);

        const templateParams = {
            // Include both naming conventions to ensure template compatibility
            to_name: data.firstName + ' ' + data.lastName,
            name: data.firstName + ' ' + data.lastName,

            to_email: data.email,
            email: data.email,

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
