// Personality test functionality
document.addEventListener('DOMContentLoaded', function() {
    let currentQuestionIndex = 0;
    let answers = [];
    let testStartTime = Date.now();
    
    // Initialize the test
    initializeTest();
    
    function initializeTest() {
        // Check if user has a reservation
        const reservationId = sessionStorage.getItem('reservationId');
        if (!reservationId) {
            showNotification('Please complete your reservation first', 'error');
            setTimeout(() => {
                window.location.href = 'reservation.html';
            }, 2000);
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
        // Navigation buttons
        document.getElementById('prev-button').addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                showQuestion(currentQuestionIndex);
                updateProgress();
                updateNavigation();
            }
        });
        
        document.getElementById('next-button').addEventListener('click', () => {
            if (isCurrentQuestionAnswered()) {
                currentQuestionIndex++;
                showQuestion(currentQuestionIndex);
                updateProgress();
                updateNavigation();
            } else {
                showNotification('Please select an answer before continuing', 'error');
            }
        });
        
        document.getElementById('submit-test').addEventListener('click', () => {
            if (allQuestionsAnswered()) {
                calculateAndShowResults();
            } else {
                showNotification('Please answer all questions before submitting', 'error');
            }
        });
        
        document.getElementById('save-results').addEventListener('click', async () => {
            await saveResults();
            window.location.href = 'confirmation.html';
        });
    }
    
    function showQuestion(index) {
        const questionContainer = document.getElementById('question-container');
        const question = personalityQuestions[index];
        
        questionContainer.innerHTML = `
            <div class="question">
                <h3>${question.text}</h3>
                <div class="options">
                    ${question.options.map((option, optionIndex) => `
                        <div class="option ${answers[index] === optionIndex ? 'selected' : ''}" 
                             onclick="selectAnswer(${index}, ${optionIndex})">
                            <input type="radio" name="question-${index}" value="${optionIndex}" 
                                   ${answers[index] === optionIndex ? 'checked' : ''}>
                            <span>${option.text}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    function selectAnswer(questionIndex, optionIndex) {
        answers[questionIndex] = optionIndex;
        
        // Update visual selection
        const options = document.querySelectorAll('.option');
        options.forEach(option => option.classList.remove('selected'));
        event.currentTarget.classList.add('selected');
        
        updateNavigation();
    }
    
    function updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        const progress = ((currentQuestionIndex + 1) / personalityQuestions.length) * 100;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `Question ${currentQuestionIndex + 1} of ${personalityQuestions.length}`;
    }
    
    function updateNavigation() {
        const prevButton = document.getElementById('prev-button');
        const nextButton = document.getElementById('next-button');
        const submitButton = document.getElementById('submit-test');
        
        // Previous button
        prevButton.disabled = currentQuestionIndex === 0;
        
        // Next/Submit button
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
        const score = calculatePersonalityScore();
        const personality = determinePersonalityType(score);
        
        // Hide test content, show results
        document.querySelector('.test-content').classList.add('hidden');
        document.getElementById('results-container').classList.remove('hidden');
        
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
    
    function calculatePersonalityScore() {
        let totalScore = 0;
        
        answers.forEach((answerIndex, questionIndex) => {
            const question = personalityQuestions[questionIndex];
            const selectedOption = question.options[answerIndex];
            totalScore += selectedOption.score;
        });
        
        // Normalize to 0-100 scale
        const maxPossibleScore = personalityQuestions.length * 5; // Assuming max score per question is 5
        const minPossibleScore = personalityQuestions.length * 1; // Assuming min score per question is 1
        
        const normalizedScore = Math.round(
            ((totalScore - minPossibleScore) / (maxPossibleScore - minPossibleScore)) * 100
        );
        
        return Math.max(0, Math.min(100, normalizedScore));
    }
    
    function determinePersonalityType(score) {
        if (score >= 80) {
            return {
                type: "The Social Connector",
                description: "You thrive in social settings and love meeting new people. You're likely to be the conversation starter at your table and enjoy group dynamics.",
                traits: [
                    "Enjoys lively group conversations",
                    "Comfortable with strangers",
                    "Prefers shared dining experiences",
                    "Values social connections"
                ]
            };
        } else if (score >= 60) {
            return {
                type: "The Thoughtful Conversationalist",
                description: "You enjoy meaningful discussions and prefer quality interactions. You appreciate both listening and sharing insights with others.",
                traits: [
                    "Values deep, meaningful conversations",
                    "Good listener and thoughtful speaker",
                    "Enjoys learning about others",
                    "Prefers smaller group settings"
                ]
            };
        } else if (score >= 40) {
            return {
                type: "The Balanced Diner",
                description: "You're adaptable and can enjoy various social settings. You're comfortable both leading conversations and letting others take the spotlight.",
                traits: [
                    "Flexible and adaptable",
                    "Enjoys variety in conversations",
                    "Good at reading social cues",
                    "Comfortable in different group sizes"
                ]
            };
        } else if (score >= 20) {
            return {
                type: "The Intimate Sharer",
                description: "You prefer smaller, more intimate gatherings where you can form deeper connections. You value quality over quantity in social interactions.",
                traits: [
                    "Prefers one-on-one or small group conversations",
                    "Values privacy and intimacy",
                    "Thoughtful and reflective",
                    "Enjoys meaningful connections"
                ]
            };
        } else {
            return {
                type: "The Quiet Observer",
                description: "You enjoy observing and listening more than speaking. You appreciate calm, peaceful dining environments and thoughtful companions.",
                traits: [
                    "Excellent listener",
                    "Prefers calm, quiet environments",
                    "Thoughtful and introspective",
                    "Values peaceful dining experiences"
                ]
            };
        }
    }
    
    async function saveResults() {
        try {
            const reservationId = sessionStorage.getItem('reservationId');
            const results = JSON.parse(sessionStorage.getItem('personalityResults'));
            
            if (typeof window.db !== 'undefined') {
                // Update reservation with personality results
                await window.updateDoc(window.doc(window.db, 'reservations', reservationId), {
                    personalityResults: results,
                    updatedAt: new Date().toISOString()
                });
                console.log('Personality results saved to Firebase');
            } else {
                // Fallback to localStorage
                const reservationData = JSON.parse(localStorage.getItem('reservation_' + reservationId) || '{}');
                reservationData.personalityResults = results;
                localStorage.setItem('reservation_' + reservationId, JSON.stringify(reservationData));
                console.log('Personality results saved to localStorage');
            }
            
        } catch (error) {
            console.error('Error saving results:', error);
            showNotification('Results saved locally', 'info');
        }
    }
    
    // Make selectAnswer globally available
    window.selectAnswer = selectAnswer;
});

// Personality test questions
const personalityQuestions = [
    {
        text: "How do you prefer to spend your evening?",
        options: [
            { text: "In a quiet, intimate setting with close friends", score: 2 },
            { text: "At a small gathering with interesting conversations", score: 3 },
            { text: "At a moderate-sized party with good music and food", score: 4 },
            { text: "At a large, lively event with lots of people to meet", score: 5 }
        ]
    },
    {
        text: "When meeting new people, you typically:",
        options: [
            { text: "Wait for them to approach you first", score: 1 },
            { text: "Respond warmly when they initiate conversation", score: 2 },
            { text: "Engage in friendly small talk", score: 4 },
            { text: "Immediately introduce yourself and start a conversation", score: 5 }
        ]
    },
    {
        text: "Your ideal dinner conversation includes:",
        options: [
            { text: "Deep, philosophical discussions", score: 2 },
            { text: "Sharing personal experiences and stories", score: 3 },
            { text: "Light-hearted banter and current events", score: 4 },
            { text: "Lots of laughter and group participation", score: 5 }
        ]
    },
    {
        text: "How comfortable are you with silence during meals?",
        options: [
            { text: "Very comfortable, I enjoy peaceful moments", score: 1 },
            { text: "Comfortable, it allows for thoughtful reflection", score: 2 },
            { text: "Somewhat comfortable, but prefer gentle conversation", score: 3 },
            { text: "Uncomfortable, I prefer continuous conversation", score: 5 }
        ]
    },
    {
        text: "When dining with strangers, you:",
        options: [
            { text: "Feel nervous and prefer to observe", score: 1 },
            { text: "Are cautious but gradually warm up", score: 2 },
            { text: "Are friendly and ask questions about them", score: 4 },
            { text: "Are excited and immediately try to connect", score: 5 }
        ]
    },
    {
        text: "Your preferred table size for dining is:",
        options: [
            { text: "2-3 people for intimate conversations", score: 1 },
            { text: "4-5 people for balanced interaction", score: 3 },
            { text: "6-8 people for diverse perspectives", score: 4 },
            { text: "8+ people for dynamic group energy", score: 5 }
        ]
    },
    {
        text: "How do you handle disagreements during dinner?",
        options: [
            { text: "Avoid conflict and change the subject", score: 1 },
            { text: "Listen carefully and offer gentle perspectives", score: 2 },
            { text: "Engage respectfully while maintaining harmony", score: 3 },
            { text: "Enjoy debating different viewpoints", score: 5 }
        ]
    },
    {
        text: "What energizes you most during social dining?",
        options: [
            { text: "One-on-one meaningful connections", score: 1 },
            { text: "Small group intimate sharing", score: 2 },
            { text: "Balanced conversation with several people", score: 3 },
            { text: "Large group dynamic interactions", score: 5 }
        ]
    },
    {
        text: "How do you typically share food?",
        options: [
            { text: "Prefer to keep my own plate", score: 1 },
            { text: "Will share if asked", score: 2 },
            { text: "Enjoy sharing and trying others' dishes", score: 4 },
            { text: "Love family-style dining and sharing everything", score: 5 }
        ]
    },
    {
        text: "After a dinner party, you feel:",
        options: [
            { text: "Exhausted and need alone time to recharge", score: 1 },
            { text: "Satisfied but ready for quiet time", score: 2 },
            { text: "Content and might enjoy a calm activity", score: 3 },
            { text: "Energized and ready for more social activities", score: 5 }
        ]
    },
    {
        text: "When someone shares personal information, you:",
        options: [
            { text: "Listen quietly and offer support if asked", score: 1 },
            { text: "Respond with empathy and related experiences", score: 3 },
            { text: "Ask thoughtful follow-up questions", score: 4 },
            { text: "Encourage them to share more with the group", score: 5 }
        ]
    },
    {
        text: "Your approach to trying new cuisines is:",
        options: [
            { text: "Cautious, prefer familiar foods", score: 1 },
            { text: "Open but want recommendations", score: 2 },
            { text: "Adventurous and enjoy discussing flavors", score: 4 },
            { text: "Extremely adventurous and love sharing discoveries", score: 5 }
        ]
    },
    {
        text: "How do you handle being the center of attention?",
        options: [
            { text: "Uncomfortable and try to redirect focus", score: 1 },
            { text: "Modest but can handle brief moments", score: 2 },
            { text: "Comfortable sharing when it's natural", score: 3 },
            { text: "Enjoy it and use it to connect with others", score: 5 }
        ]
    },
    {
        text: "Your ideal dinner timing is:",
        options: [
            { text: "Early and relaxed with time to unwind after", score: 1 },
            { text: "Traditional timing with comfortable pacing", score: 2 },
            { text: "Flexible timing that works for everyone", score: 3 },
            { text: "Late and extended for maximum social time", score: 5 }
        ]
    },
    {
        text: "When planning a group dinner, you:",
        options: [
            { text: "Prefer someone else to organize", score: 1 },
            { text: "Help with planning but prefer not to lead", score: 2 },
            { text: "Contribute ideas and help coordinate", score: 4 },
            { text: "Love to organize and bring people together", score: 5 }
        ]
    }
];