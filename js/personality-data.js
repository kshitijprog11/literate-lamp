export const personalityQuestions = [
    {
        text: "What is your primary goal for a Mindful Dining experience?",
        options: [
            { text: "Professional networking and business connections", traits: { intent: "networking", role: "catalyst", energy: 4 } },
            { text: "Fun, casual conversations and laughs", traits: { intent: "casual", role: "storyteller", energy: 4 } },
            { text: "Finding deep, meaningful personal friendships", traits: { intent: "deep_connection", role: "interviewer", energy: 2 } },
            { text: "Quietly enjoying the food and observing others", traits: { intent: "casual", role: "listener", energy: 1 } }
        ]
    },
    {
        text: "In a group of six people, you usually find yourself:",
        options: [
            { text: "Leading the conversation and telling stories", traits: { intent: "casual", role: "storyteller", energy: 5 } },
            { text: "Asking questions and learning about others", traits: { intent: "deep_connection", role: "interviewer", energy: 3 } },
            { text: "Listening intently and chiming in occasionally", traits: { intent: "casual", role: "listener", energy: 2 } },
            { text: "Debating ideas and challenging perspectives", traits: { intent: "networking", role: "catalyst", energy: 4 } }
        ]
    },
    {
        text: "When a sudden silence falls over the dinner table, you:",
        options: [
            { text: "Immediately speak up to fill the void", traits: { intent: "casual", role: "catalyst", energy: 5 } },
            { text: "Ask someone a specific question to get them talking", traits: { intent: "deep_connection", role: "interviewer", energy: 4 } },
            { text: "Smile comfortably; silence doesn't bother you", traits: { intent: "casual", role: "listener", energy: 2 } },
            { text: "Use the moment to reflect on what was just said", traits: { intent: "deep_connection", role: "listener", energy: 1 } }
        ]
    },
    {
        text: "Your ideal restaurant vibe is:",
        options: [
            { text: "Loud, energetic, and bustling", traits: { intent: "casual", role: "storyteller", energy: 5 } },
            { text: "A trendy, upbeat spot with background music", traits: { intent: "networking", role: "catalyst", energy: 4 } },
            { text: "A calm, well-lit cafe with soft acoustics", traits: { intent: "deep_connection", role: "interviewer", energy: 2 } },
            { text: "A very quiet, distraction-free intimate space", traits: { intent: "deep_connection", role: "listener", energy: 1 } }
        ]
    },
    {
        text: "If someone strongly disagrees with your opinion during dinner:",
        options: [
            { text: "You eagerly engage in a lively debate", traits: { intent: "networking", role: "catalyst", energy: 5 } },
            { text: "You ask them to elaborate on why they think that", traits: { intent: "deep_connection", role: "interviewer", energy: 3 } },
            { text: "You politely agree to disagree and change the subject", traits: { intent: "casual", role: "storyteller", energy: 3 } },
            { text: "You quietly listen to their perspective without pushing back", traits: { intent: "casual", role: "listener", energy: 1 } }
        ]
    },
    {
        text: "When someone is telling a long story, you are typically:",
        options: [
            { text: "Waiting for the right moment to share a similar story of your own", traits: { intent: "casual", role: "storyteller", energy: 4 } },
            { text: "Nodding along and asking follow-up questions", traits: { intent: "deep_connection", role: "interviewer", energy: 3 } },
            { text: "Listening quietly, absorbing the details", traits: { intent: "deep_connection", role: "listener", energy: 2 } },
            { text: "Analyzing the story to find a lesson or business application", traits: { intent: "networking", role: "catalyst", energy: 3 } }
        ]
    },
    {
        text: "After a 3-hour dinner party with strangers, you feel:",
        options: [
            { text: "Completely exhausted and need to be alone", traits: { intent: "casual", role: "listener", energy: 1 } },
            { text: "Satisfied, but definitely ready for bed", traits: { intent: "deep_connection", role: "interviewer", energy: 2 } },
            { text: "Content and happy to chat a bit more", traits: { intent: "networking", role: "catalyst", energy: 4 } },
            { text: "Energized! You want to go get drinks afterward", traits: { intent: "casual", role: "storyteller", energy: 5 } }
        ]
    },
    {
        text: "What topics do you find most fascinating to discuss?",
        options: [
            { text: "Industry trends, startups, and career growth", traits: { intent: "networking", role: "catalyst", energy: 4 } },
            { text: "Psychology, philosophy, and personal growth", traits: { intent: "deep_connection", role: "interviewer", energy: 2 } },
            { text: "Pop culture, travel stories, and entertainment", traits: { intent: "casual", role: "storyteller", energy: 4 } },
            { text: "I prefer to listen to whatever others are passionate about", traits: { intent: "casual", role: "listener", energy: 1 } }
        ]
    },
    {
        text: "How do you feel about being the center of attention?",
        options: [
            { text: "I love it and thrive in the spotlight", traits: { intent: "casual", role: "storyteller", energy: 5 } },
            { text: "I'm comfortable with it if it's for a purpose", traits: { intent: "networking", role: "catalyst", energy: 4 } },
            { text: "I can handle it briefly, but prefer deflecting back to the group", traits: { intent: "deep_connection", role: "interviewer", energy: 2 } },
            { text: "I actively try to avoid being the center of attention", traits: { intent: "casual", role: "listener", energy: 1 } }
        ]
    },
    {
        text: "Ultimately, what makes a dinner party successful for you?",
        options: [
            { text: "Making a valuable connection that lasts beyond the dinner", traits: { intent: "networking", role: "catalyst", energy: 4 } },
            { text: "Laughing so hard my stomach hurts", traits: { intent: "casual", role: "storyteller", energy: 5 } },
            { text: "Having a profound conversation that changed my perspective", traits: { intent: "deep_connection", role: "interviewer", energy: 2 } },
            { text: "Feeling comfortable, safe, and enjoying an excellent meal", traits: { intent: "casual", role: "listener", energy: 1 } }
        ]
    }
];

export function calculatePersonalityScore(answerIndices) {
    if (!Array.isArray(answerIndices) || answerIndices.length !== personalityQuestions.length) {
        throw new Error('All personality questions must be answered before calculating a score.');
    }

    let stats = {
        intents: { networking: 0, casual: 0, deep_connection: 0 },
        roles: { catalyst: 0, storyteller: 0, interviewer: 0, listener: 0 },
        energyTotal: 0
    };

    answerIndices.forEach((answerIndex, questionIndex) => {
        const question = personalityQuestions[questionIndex];
        const selectedOption = question.options[answerIndex];

        if (!selectedOption) {
            throw new Error('Invalid answer selection detected.');
        }

        stats.intents[selectedOption.traits.intent]++;
        stats.roles[selectedOption.traits.role]++;
        stats.energyTotal += selectedOption.traits.energy;
    });

    // Determine dominant intent
    const dominantIntent = Object.keys(stats.intents).reduce((a, b) => stats.intents[a] > stats.intents[b] ? a : b);

    // Determine dominant role
    const dominantRole = Object.keys(stats.roles).reduce((a, b) => stats.roles[a] > stats.roles[b] ? a : b);

    // Calculate normalized energy score (0-100)
    // Min possible energy = 10 (1 * 10), Max = 50 (5 * 10)
    const minEnergy = 10;
    const maxEnergy = 50;
    const normalizedEnergy = Math.round(((stats.energyTotal - minEnergy) / (maxEnergy - minEnergy)) * 100);

    // We return a "Composite Social Profile" instead of just a raw number, but we structure it 
    // so previous code that expects just a number doesn't completely crash immediately.
    // The "score" will act as the "Energy Score", saving the rest in a detailed object.
    return {
        score: Math.max(0, Math.min(100, normalizedEnergy)),
        dominantIntent: dominantIntent,
        dominantRole: dominantRole,
        totalStats: stats
    };
}

export function determinePersonalityType(profile) {
    // If the old system calls this with just a number, handle it gracefully
    let score = typeof profile === 'number' ? profile : profile.score;
    let intent = typeof profile === 'number' ? 'casual' : profile.dominantIntent;
    let role = typeof profile === 'number' ? 'storyteller' : profile.dominantRole;

    if (role === 'catalyst' && intent === 'networking') {
        return {
            type: "The Networker",
            description: "You are highly driven by making valuable connections. You have the energy to initiate conversations and prefer groups where everyone brings ideas to the table.",
            traits: [
                "Seeks professional and valuable connections",
                "Often drives the conversation",
                "Appreciates lively debates and fast-paced chats",
                "Shares knowledge and resources freely"
            ],
            role: "catalyst",
            intent: "networking"
        };
    } else if (role === 'storyteller' || (role === 'catalyst' && intent === 'casual')) {
        return {
            type: "The Entertainer",
            description: "You bring the fun! You love sharing stories, making people laugh, and ensuring the vibe is always energetic and enthusiastic.",
            traits: [
                "Loves being the center of attention",
                "Shares engaging stories and humor",
                "Thrives in loud, bustling environments",
                "Highly energetic and outgoing"
            ],
            role: "storyteller",
            intent: "casual"
        };
    } else if (role === 'interviewer' || intent === 'deep_connection') {
        return {
            type: "The Empathetic Explorer",
            description: "You skip the small talk. You are deeply interested in psychology, philosophy, and learning what truly makes the people around you tick.",
            traits: [
                "Asks excellent, thought-provoking questions",
                "Seeks deep, meaningful connections",
                "Prefers intimate, quieter dining spaces",
                "Makes others feel heard and valued"
            ],
            role: "interviewer",
            intent: "deep_connection"
        };
    } else {
        return {
            type: "The Peaceful Observer",
            description: "You are the grounding force at any table. You prefer to listen, observe, and enjoy your meal without the pressure of driving the conversation.",
            traits: [
                "Excellent, attentive listener",
                "Enjoys calm and focused dining experiences",
                "Doesn't need to be the center of attention",
                "Reflective and considerate"
            ],
            role: "listener",
            intent: "casual"
        };
    }
}

export function buildPersonalityAnswerSummary(answerIndices) {
    return answerIndices.map((optionIndex, questionIndex) => {
        const question = personalityQuestions[questionIndex];
        const choice = question.options[optionIndex];

        return {
            question: question.text,
            response: choice?.text || '',
            score: choice?.traits?.energy ?? 0
        };
    });
}
