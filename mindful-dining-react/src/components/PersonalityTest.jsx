import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'

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
      { text: "Feel excited and curious about their stories", score: 4 },
      { text: "Love meeting new people and hearing their perspectives", score: 5 }
    ]
  },
  {
    text: "Your communication style is best described as:",
    options: [
      { text: "Thoughtful and measured", score: 1 },
      { text: "Considerate and genuine", score: 2 },
      { text: "Friendly and engaging", score: 4 },
      { text: "Enthusiastic and expressive", score: 5 }
    ]
  },
  {
    text: "When someone disagrees with you at dinner, you:",
    options: [
      { text: "Listen quietly and avoid conflict", score: 1 },
      { text: "Share your perspective respectfully", score: 2 },
      { text: "Engage in healthy debate", score: 4 },
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
]

function PersonalityTest() {
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [results, setResults] = useState(null)

  useEffect(() => {
    // Check if user has reservation
    const reservationId = sessionStorage.getItem('reservationId')
    if (!reservationId) {
      alert('Please make a reservation first.')
      navigate('/reservation')
    }
  }, [navigate])

  const selectAnswer = (selectedOption) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = selectedOption
    setAnswers(newAnswers)

    if (currentQuestion < personalityQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Test completed
      const testResults = calculateResults(newAnswers)
      setResults(testResults)
      setIsCompleted(true)
      
      // Save results
      sessionStorage.setItem('personalityResults', JSON.stringify(testResults))
      saveResults(testResults)
    }
  }

  const calculateResults = (answers) => {
    const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0)
    const averageScore = totalScore / answers.length

    let personalityType, description, traits

    if (averageScore <= 2.0) {
      personalityType = "Reflective Introvert"
      description = "You value deep, meaningful conversations and prefer intimate dining settings. You're an excellent listener who appreciates thoughtful discussions and quiet moments."
      traits = [
        "Excellent listener",
        "Values deep conversations", 
        "Prefers intimate settings",
        "Thoughtful and considerate"
      ]
    } else if (averageScore <= 3.0) {
      personalityType = "Thoughtful Conversationalist"
      description = "You enjoy balanced conversations and meaningful connections. You're comfortable in both intimate and moderate group settings, bringing thoughtfulness to discussions."
      traits = [
        "Balanced communicator",
        "Values meaningful connections",
        "Comfortable in various settings",
        "Thoughtful and genuine"
      ]
    } else if (averageScore <= 4.0) {
      personalityType = "Social Connector"
      description = "You're naturally social and enjoy bringing people together. You thrive in group settings and love facilitating conversations and connections between others."
      traits = [
        "Natural connector",
        "Enjoys group dynamics",
        "Great conversation facilitator",
        "Warm and engaging"
      ]
    } else {
      personalityType = "Energetic Socializer"
      description = "You're highly social and love lively interactions. You thrive in large groups, enjoy being the center of attention, and bring energy and enthusiasm to any gathering."
      traits = [
        "Highly energetic",
        "Loves large groups",
        "Charismatic leader",
        "Enthusiastic and expressive"
      ]
    }

    return {
      totalScore,
      averageScore: parseFloat(averageScore.toFixed(2)),
      personalityType,
      description,
      traits,
      answeredQuestions: answers.length,
      timestamp: new Date().toISOString()
    }
  }

  const saveResults = async (testResults) => {
    try {
      const reservationId = sessionStorage.getItem('reservationId')
      if (!reservationId) {
        throw new Error('Missing reservation ID')
      }

      // For now, save to localStorage (Firebase integration would be added here)
      const reservationData = JSON.parse(localStorage.getItem('reservation_' + reservationId) || '{}')
      reservationData.personalityResults = testResults
      reservationData.updatedAt = new Date().toISOString()
      localStorage.setItem('reservation_' + reservationId, JSON.stringify(reservationData))
      
      console.log('✅ Personality results saved')
    } catch (error) {
      console.error('Error saving results:', error)
    }
  }

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const restartTest = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setIsCompleted(false)
    setResults(null)
  }

  const continueToConfirmation = () => {
    navigate('/confirmation')
  }

  if (isCompleted && results) {
    return (
      <div className="personality-test-page">
        <header className="page-header">
          <Navbar />
        </header>

        <main className="test-main">
          <div className="container">
            <div className="test-container">
              <div className="results-section">
                <h1>Your Personality Results</h1>
                
                <div className="personality-card">
                  <h2 className="personality-type">{results.personalityType}</h2>
                  <p className="personality-description">{results.description}</p>
                  
                  <div className="personality-traits">
                    <h3>Your Dining Traits:</h3>
                    <ul>
                      {results.traits.map((trait, index) => (
                        <li key={index}>{trait}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="score-info">
                    <p><strong>Compatibility Score:</strong> {results.averageScore}/5.0</p>
                    <p><small>You'll be matched with diners who have similar scores for the best experience.</small></p>
                  </div>
                </div>

                <div className="action-buttons">
                  <button onClick={restartTest} className="secondary-button">
                    Retake Test
                  </button>
                  <button onClick={continueToConfirmation} className="primary-button">
                    Continue to Confirmation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const question = personalityQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / personalityQuestions.length) * 100

  return (
    <div className="personality-test-page">
      <header className="page-header">
        <Navbar />
      </header>

      <main className="test-main">
        <div className="container">
          <div className="test-container">
            <div className="test-header">
              <h1>Personality Assessment</h1>
              <p>Help us match you with compatible dining companions by answering these questions honestly.</p>
              
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="progress-text">
                  Question {currentQuestion + 1} of {personalityQuestions.length}
                </p>
              </div>
            </div>

            <div className="question-section">
              <h2 className="question-text">{question.text}</h2>
              
              <div className="options-container">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-button ${
                      answers[currentQuestion]?.text === option.text ? 'selected' : ''
                    }`}
                    onClick={() => selectAnswer(option)}
                  >
                    {option.text}
                  </button>
                ))}
              </div>

              <div className="navigation-buttons">
                {currentQuestion > 0 && (
                  <button onClick={goToPrevious} className="nav-button previous">
                    Previous Question
                  </button>
                )}
                <div className="nav-spacer"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PersonalityTest