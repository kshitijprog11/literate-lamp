import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Alert,
  Avatar,
  Stack,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import PeopleIcon from '@mui/icons-material/People'
import EmailIcon from '@mui/icons-material/Email'
import Navbar from './Navbar'

function Confirmation() {
  const navigate = useNavigate()
  const [reservationData, setReservationData] = useState(null)
  const [personalityResults, setPersonalityResults] = useState(null)

  useEffect(() => {
    const storedReservationData = sessionStorage.getItem('reservationData')
    const storedPersonalityResults = sessionStorage.getItem('personalityResults')
    
    if (storedReservationData) {
      setReservationData(JSON.parse(storedReservationData))
    }
    
    if (storedPersonalityResults) {
      setPersonalityResults(JSON.parse(storedPersonalityResults))
    }

    if (!storedReservationData) {
      // navigate('/')
    }
  }, [navigate])

  const handleNewReservation = () => {
    sessionStorage.clear()
    navigate('/reservation')
  }

  const handleHomeReturn = () => {
    navigate('/')
  }

  if (!reservationData) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navbar />
        <Container maxWidth="md" sx={{ pt: '100px', textAlign: 'center' }}>
          <CircularProgress />
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
      <Navbar />

      <Container maxWidth="md" sx={{ pt: '100px' }}>
        <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 5 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h3" component="h1" gutterBottom color="success.main">
              Reservation Confirmed!
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', maxWidth: 600 }}>
              Thank you for choosing Mindful Dining! Your reservation has been confirmed 
              and your personality assessment is complete.
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ mb: 5 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Reservation Details
                </Typography>
                <List dense>
                  <ListItem disablePadding sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <ListItemText primary="Name" secondary={`${reservationData.firstName} ${reservationData.lastName}`} />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <ListItemText primary="Email" secondary={reservationData.email} />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <ListItemText primary="Date" secondary={new Date(reservationData.eventDate).toLocaleDateString()} />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <ListItemText primary="Time" secondary={reservationData.timeSlot} />
                  </ListItem>
                  {reservationData.phone && (
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemText primary="Phone" secondary={reservationData.phone} />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>

            {personalityResults && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 3, height: '100%', bgcolor: 'primary.light', color: 'primary.contrastText', borderColor: 'primary.main' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Personality Profile
                  </Typography>
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    {personalityResults.personalityType}
                  </Typography>
                  <Typography variant="body2" paragraph sx={{ opacity: 0.9 }}>
                    {personalityResults.description}
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', fontWeight: 'bold' }}>
                    Compatibility Score: {personalityResults.averageScore}/5.0
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" gutterBottom color="primary" align="center" sx={{ mb: 4 }}>
              What's Next?
            </Typography>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack alignItems="center" textAlign="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 64, height: 64 }}>
                    <PeopleIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6">Table Assignment</Typography>
                  <Typography variant="body2" color="text.secondary">
                    We'll match you with compatible dining companions based on your personality assessment.
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack alignItems="center" textAlign="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 64, height: 64 }}>
                    <EmailIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6">Email Notification</Typography>
                  <Typography variant="body2" color="text.secondary">
                    You'll receive an email 24 hours before your dining experience with table details.
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack alignItems="center" textAlign="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 64, height: 64 }}>
                    <RestaurantMenuIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6">Enjoy Experience</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Arrive on time and get ready for meaningful conversations and great food!
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          <Alert severity="info" sx={{ mb: 4, justifyContent: 'center' }}>
            <strong>Demo Mode:</strong> This is a demonstration. No actual reservation
            was made and no payment was processed.
          </Alert>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button variant="outlined" color="primary" size="large" onClick={handleHomeReturn}>
              Return to Home
            </Button>
            <Button variant="contained" color="primary" size="large" onClick={handleNewReservation}>
              Make Another Reservation
            </Button>
          </Stack>

        </Paper>
      </Container>
    </Box>
  )
}

export default Confirmation
