const MAX_SCORE_PER_QUESTION = 5;
const MIN_SCORE_PER_QUESTION = 1;

export const personalityQuestions = [
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

export function calculatePersonalityScore(answerIndices) {
    if (!Array.isArray(answerIndices) || answerIndices.length !== personalityQuestions.length) {
        throw new Error('All personality questions must be answered before calculating a score.');
    }

    let totalScore = 0;

    answerIndices.forEach((answerIndex, questionIndex) => {
        const question = personalityQuestions[questionIndex];
        const selectedOption = question.options[answerIndex];

        if (!selectedOption) {
            throw new Error('Invalid answer selection detected.');
        }

        totalScore += selectedOption.score;
    });

    const maxPossibleScore = personalityQuestions.length * MAX_SCORE_PER_QUESTION;
    const minPossibleScore = personalityQuestions.length * MIN_SCORE_PER_QUESTION;

    const normalizedScore = Math.round(
        ((totalScore - minPossibleScore) / (maxPossibleScore - minPossibleScore)) * 100
    );

    return Math.max(0, Math.min(100, normalizedScore));
}

export function determinePersonalityType(score) {
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
    }

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

export function buildPersonalityAnswerSummary(answerIndices) {
    return answerIndices.map((optionIndex, questionIndex) => {
        const question = personalityQuestions[questionIndex];
        const choice = question.options[optionIndex];

        return {
            question: question.text,
            response: choice?.text || '',
            score: choice?.score ?? 0
        };
    });
}
