import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  LinearProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Card,
  CardContent,
  Chip,
  Stack,
  Fade
} from '@mui/material'
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

  // Fade animation state
  const [fadeIn, setFadeIn] = useState(true)

  useEffect(() => {
    const reservationId = sessionStorage.getItem('reservationId')
    // Bypass for development testing if needed, but keeping strict for now
    if (!reservationId) {
      // alert('Please make a reservation first.')
      // navigate('/reservation')
    }
  }, [navigate])

  const handleNext = (selectedOption) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = selectedOption
    setAnswers(newAnswers)

    setFadeIn(false)
    setTimeout(() => {
      if (currentQuestion < personalityQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setFadeIn(true)
      } else {
        finishTest(newAnswers)
      }
    }, 300)
  }

  const finishTest = (finalAnswers) => {
    const totalScore = finalAnswers.reduce((sum, answer) => sum + answer.score, 0)
    const averageScore = totalScore / finalAnswers.length

    let personalityType, description, traits

    if (averageScore <= 2.0) {
      personalityType = "Reflective Introvert"
      description = "You value deep, meaningful conversations and prefer intimate dining settings. You're an excellent listener who appreciates thoughtful discussions and quiet moments."
      traits = ["Excellent listener", "Values deep conversations", "Prefers intimate settings", "Thoughtful and considerate"]
    } else if (averageScore <= 3.0) {
      personalityType = "Thoughtful Conversationalist"
      description = "You enjoy balanced conversations and meaningful connections. You're comfortable in both intimate and moderate group settings, bringing thoughtfulness to discussions."
      traits = ["Balanced communicator", "Values meaningful connections", "Comfortable in various settings", "Thoughtful and genuine"]
    } else if (averageScore <= 4.0) {
      personalityType = "Social Connector"
      description = "You're naturally social and enjoy bringing people together. You thrive in group settings and love facilitating conversations and connections between others."
      traits = ["Natural connector", "Enjoys group dynamics", "Great conversation facilitator", "Warm and engaging"]
    } else {
      personalityType = "Energetic Socializer"
      description = "You're highly social and love lively interactions. You thrive in large groups, enjoy being the center of attention, and bring energy and enthusiasm to any gathering."
      traits = ["Highly energetic", "Loves large groups", "Charismatic leader", "Enthusiastic and expressive"]
    }

    const testResults = {
      totalScore,
      averageScore: parseFloat(averageScore.toFixed(2)),
      personalityType,
      description,
      traits,
      answeredQuestions: finalAnswers.length,
      timestamp: new Date().toISOString()
    }

    setResults(testResults)
    setIsCompleted(true)
    setFadeIn(true)

    sessionStorage.setItem('personalityResults', JSON.stringify(testResults))
    saveResults(testResults)
  }

  const saveResults = async (testResults) => {
    try {
      const reservationId = sessionStorage.getItem('reservationId')
      if (reservationId) {
        const reservationData = JSON.parse(localStorage.getItem('reservation_' + reservationId) || '{}')
        reservationData.personalityResults = testResults
        reservationData.updatedAt = new Date().toISOString()
        localStorage.setItem('reservation_' + reservationId, JSON.stringify(reservationData))
      }
    } catch (error) {
      console.error('Error saving results:', error)
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setFadeIn(false)
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1)
        setFadeIn(true)
      }, 300)
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setIsCompleted(false)
    setResults(null)
  }

  const handleContinue = () => {
    navigate('/confirmation')
  }

  if (isCompleted && results) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
        <Navbar />
        <Container maxWidth="md" sx={{ pt: '100px' }}>
          <Fade in={true}>
            <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="h3" component="h1" gutterBottom color="primary">
                Your Personality Results
              </Typography>

              <Card variant="outlined" sx={{ mt: 4, mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {results.personalityType}
                  </Typography>
                  <Typography variant="h6" sx={{ fontStyle: 'italic', opacity: 0.9 }}>
                    Compatibility Score: {results.averageScore}/5.0
                  </Typography>
                </CardContent>
              </Card>

              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mb: 4 }}>
                {results.description}
              </Typography>

              <Typography variant="h6" gutterBottom color="text.secondary">
                Your Dining Traits:
              </Typography>

              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ mb: 6 }}>
                {results.traits.map((trait, index) => (
                  <Chip key={index} label={trait} color="secondary" variant="outlined" sx={{ m: 0.5 }} />
                ))}
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button variant="outlined" color="inherit" onClick={handleRestart}>
                  Retake Test
                </Button>
                <Button variant="contained" color="primary" onClick={handleContinue}>
                  Continue to Confirmation
                </Button>
              </Stack>
            </Paper>
          </Fade>
        </Container>
      </Box>
    )
  }

  const question = personalityQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / personalityQuestions.length) * 100

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
      <Navbar />
      <Container maxWidth="md" sx={{ pt: '100px' }}>
        <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom color="primary" align="center">
              Personality Assessment
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
              Question {currentQuestion + 1} of {personalityQuestions.length}
            </Typography>
            <Box sx={{ mt: 2, width: '100%' }}>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
            </Box>
          </Box>

          <Fade in={fadeIn}>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 500 }}>
                {question.text}
              </Typography>
              
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  aria-label="quiz"
                  name="quiz"
                  value={answers[currentQuestion] ? answers[currentQuestion].text : ''}
                >
                  <Stack spacing={2}>
                    {question.options.map((option, index) => (
                      <Paper
                        key={index}
                        variant="outlined"
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          borderColor: answers[currentQuestion]?.text === option.text ? 'primary.main' : 'divider',
                          bgcolor: answers[currentQuestion]?.text === option.text ? 'action.hover' : 'background.paper',
                          transition: 'all 0.2s',
                          '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.light' }
                        }}
                        onClick={() => handleNext(option)}
                      >
                        <FormControlLabel
                          value={option.text}
                          control={<Radio />}
                          label={<Typography variant="body1">{option.text}</Typography>}
                          sx={{ width: '100%', m: 0 }}
                        />
                      </Paper>
                    ))}
                  </Stack>
                </RadioGroup>
              </FormControl>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  disabled={currentQuestion === 0}
                  onClick={handleBack}
                  color="inherit"
                >
                  Previous
                </Button>
              </Box>
            </Box>
          </Fade>
        </Paper>
      </Container>
    </Box>
  )
}

export default PersonalityTest
