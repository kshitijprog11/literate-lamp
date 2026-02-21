import { personalityQuestions, calculatePersonalityScore, determinePersonalityType } from './personality-data.js';
export { personalityQuestions, calculatePersonalityScore, determinePersonalityType, buildPersonalityAnswerSummary } from './personality-data.js';

// Personality test functionality
const initPersonalityTest = function() {
    const questionContainer = document.getElementById('question-container');
    const resultsContainer = document.getElementById('results-container');
    const testContent = document.querySelector('.test-content');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const submitButton = document.getElementById('submit-test');

    if (!questionContainer || !resultsContainer || !testContent) {
        return;
    }

    let currentQuestionIndex = 0;
    let answers = [];
    let testStartTime = Date.now();
    let cachedQuestionElements = null;
    
    // Initialize the test
    initializeTest();
    
    function initializeTest() {
        // Check if user has a reservation
        const reservationId = sessionStorage.getItem('reservationId');
        if (!reservationId) {
            alert('Please complete your reservation first');
            window.location.href = 'reservation.html';
            return;
        }
        
        // Initialize answers array
        answers = new Array(personalityQuestions.length).fill(null);
        
        // Show first question
        showQuestion(0);
        updateProgress();
        setupEventListeners();
    }
    
    function setupEventListeners() {
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (currentQuestionIndex > 0) {
                    currentQuestionIndex--;
                    showQuestion(currentQuestionIndex);
                    updateProgress();
                    updateNavigation();
                }
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (isCurrentQuestionAnswered()) {
                    currentQuestionIndex++;
                    showQuestion(currentQuestionIndex);
                    updateProgress();
                    updateNavigation();
                } else {
                    alert('Please select an answer before continuing');
                }
            });
        }
        
        if (submitButton) {
            submitButton.addEventListener('click', () => {
                if (allQuestionsAnswered()) {
                    calculateAndShowResults();
                    // Add save button listener after results are shown
                    addSaveButtonListener();
                } else {
                    alert('Please answer all questions before submitting');
                }
            });
        }
    }
    
    function addSaveButtonListener() {
        const saveButton = document.getElementById('save-results');
        
        if (saveButton) {
            // Remove any existing listeners
            const newSaveButton = saveButton.cloneNode(true);
            saveButton.parentNode.replaceChild(newSaveButton, saveButton);
            
            // Add fresh listener
            newSaveButton.addEventListener('click', async () => {
                try {
                    await saveResults();
                    window.location.href = 'confirmation.html';
                } catch (error) {
                    console.error('Error in Save Results button:', error);
                    alert('Error saving results: ' + error.message);
                }
            });
        }
    }
    
    function createQuestionStructure() {
        questionContainer.innerHTML = `
            <div class="question">
                <h3></h3>
                <div class="options">
                    ${Array(4).fill(0).map((_, i) => `
                        <label class="option" data-option-index="${i}">
                            <input type="radio" name="question-option" value="${i}">
                            <span></span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;

        const questionEl = questionContainer.querySelector('.question');
        const h3 = questionEl.querySelector('h3');
        const optionsDiv = questionEl.querySelector('.options');
        const labels = Array.from(optionsDiv.querySelectorAll('.option'));

        cachedQuestionElements = {
            h3,
            labels: labels.map(label => ({
                label,
                input: label.querySelector('input'),
                span: label.querySelector('span')
            }))
        };

        // Attach event listeners once
        cachedQuestionElements.labels.forEach((el, i) => {
            el.input.addEventListener('change', () => {
                selectAnswer(currentQuestionIndex, i);
            });
        });
    }

    function showQuestion(index) {
        if (!cachedQuestionElements) {
            createQuestionStructure();
        }

        const question = personalityQuestions[index];
        const answer = answers[index];

        cachedQuestionElements.h3.textContent = question.text;

        cachedQuestionElements.labels.forEach((el, i) => {
            const option = question.options[i];

            if (option) {
                el.label.style.display = '';
                el.span.textContent = option.text;

                // Update selection state
                if (answer === i) {
                    el.label.classList.add('selected');
                    el.input.checked = true;
                } else {
                    el.label.classList.remove('selected');
                    el.input.checked = false;
                }
            } else {
                el.label.style.display = 'none';
            }
        });
    }
    
    function selectAnswer(questionIndex, optionIndex) {
        answers[questionIndex] = optionIndex;
        
        // Update visual selection
        const options = questionContainer.querySelectorAll('.option');
        options.forEach(option => {
            const input = option.querySelector('input');
            if (input && input.checked) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        updateNavigation();
    }
    
    function updateProgress() {
        const progress = ((currentQuestionIndex + 1) / personalityQuestions.length) * 100;
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        if (progressText) {
            progressText.textContent = `Question ${currentQuestionIndex + 1} of ${personalityQuestions.length}`;
        }
    }
    
    function updateNavigation() {
        if (prevButton) {
            prevButton.disabled = currentQuestionIndex === 0;
        }
        
        if (!nextButton || !submitButton) {
            return;
        }
        
        if (currentQuestionIndex === personalityQuestions.length - 1) {
            nextButton.classList.add('hidden');
            submitButton.classList.remove('hidden');
        } else {
            nextButton.classList.remove('hidden');
            submitButton.classList.add('hidden');
        }
    }
    
    function isCurrentQuestionAnswered() {
        return answers[currentQuestionIndex] !== null;
    }
    
    function allQuestionsAnswered() {
        return answers.every(answer => answer !== null);
    }
    
    function calculateAndShowResults() {
        const score = calculatePersonalityScore(answers);
        const personality = determinePersonalityType(score);
        
        // Hide test content, show results
        testContent.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
        
        // Display results
        document.getElementById('personality-results').innerHTML = `
            <div class="personality-score">${score}</div>
            <div class="personality-type">${personality.type}</div>
            <div class="personality-description">${personality.description}</div>
            <div class="personality-traits">
                <h4>Your Dining Style:</h4>
                <ul>
                    ${personality.traits.map(trait => `<li>${trait}</li>`).join('')}
                </ul>
            </div>
        `;
        
        // Store results for later use
        sessionStorage.setItem('personalityResults', JSON.stringify({
            score,
            personality,
            answers,
            completedAt: new Date().toISOString(),
            timeSpent: Date.now() - testStartTime
        }));
    }
    
    async function saveResults() {
        try {
            const reservationId = sessionStorage.getItem('reservationId');
            const results = JSON.parse(sessionStorage.getItem('personalityResults'));
            
            if (!reservationId || !results) {
                throw new Error('Missing reservation ID or results');
            }
            
            // Try Firebase first (for real data sharing), then localStorage fallback
            if (window.FAST_TESTING_MODE || typeof window.db === 'undefined' || typeof window.updateDoc === 'undefined') {
                const reservationData = JSON.parse(localStorage.getItem('reservation_' + reservationId) || '{}');
                reservationData.personalityResults = results;
                reservationData.personalityTestStatus = 'Completed';
                reservationData.status = 'Confirmed';
                reservationData.updatedAt = new Date().toISOString();
                localStorage.setItem('reservation_' + reservationId, JSON.stringify(reservationData));
                return;
            }
            
            // Firebase mode (for real compatibility matching)
            try {
                // Add 3-second timeout for Firebase
                const updatePromise = window.updateDoc(window.doc(window.db, 'reservations', reservationId), {
                    personalityResults: results,
                    personalityTestStatus: 'Completed',
                    status: 'Confirmed',
                    updatedAt: new Date().toISOString()
                });
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Firebase timeout')), 3000)
                );
                
                await Promise.race([updatePromise, timeoutPromise]);
                
            } catch (firebaseError) {
                console.warn('Firebase save failed, using localStorage fallback:', firebaseError.message);
                const reservationData = JSON.parse(localStorage.getItem('reservation_' + reservationId) || '{}');
                reservationData.personalityResults = results;
                reservationData.personalityTestStatus = 'Completed';
                reservationData.status = 'Confirmed';
                reservationData.updatedAt = new Date().toISOString();
                localStorage.setItem('reservation_' + reservationId, JSON.stringify(reservationData));
            }
            
        } catch (error) {
            console.error('Error saving results:', error);
            alert('Error saving results: ' + error.message);
        }
    }
    
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPersonalityTest);
} else {
    initPersonalityTest();
}

