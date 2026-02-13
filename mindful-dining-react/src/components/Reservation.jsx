import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material'
import { useFirebase } from '../context/FirebaseContext'
import Navbar from './Navbar'

function Reservation() {
  const navigate = useNavigate()
  const { saveReservation } = useFirebase()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    eventDate: '',
    timeSlot: '',
    dietaryRestrictions: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // Set minimum date to today (handled by input props)
  const today = new Date().toISOString().split('T')[0]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    // Simple formatting
    if (value.length >= 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
    } else if (value.length >= 3) {
      value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2')
    }

    setFormData(prev => ({ ...prev, phone: value }))
  }

  const validateForm = () => {
    const newErrors = {}
    const required = ['firstName', 'lastName', 'email', 'eventDate', 'timeSlot']
    
    required.forEach(field => {
      if (!formData[field]) newErrors[field] = 'This field is required'
    })

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.eventDate) {
      const selectedDate = new Date(formData.eventDate)
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      if (selectedDate < now) {
        newErrors.eventDate = 'Please select a future date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const reservationData = {
        ...formData,
        paymentId: 'demo_reservation_' + Date.now(),
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        demoMode: true,
        amount: 75,
        paymentStatus: 'demo_mode'
      }
      
      const reservationId = await saveReservation(reservationData)
      
      sessionStorage.setItem('reservationId', reservationId)
      sessionStorage.setItem('reservationData', JSON.stringify(formData))
      
      navigate('/personality-test')
      
    } catch (error) {
      console.error(error)
      alert('Error: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const timeSlots = ['6:00 PM', '7:00 PM', '8:00 PM']

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
      <Navbar />

      <Container maxWidth="md" sx={{ pt: '100px' }}>
        <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
          <Typography variant="h3" component="h1" align="center" gutterBottom color="primary">
            Make Your Reservation
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Reserve your spot for an unforgettable dining experience. After booking,
            you'll take a quick personality test to be matched with compatible dining companions.
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Personal Info */}
              <Grid size={12}>
                <Typography variant="h5" color="text.heading" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>
                  Personal Information
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                />
              </Grid>

              {/* Reservation Details */}
              <Grid size={12}>
                <Typography variant="h5" color="text.heading" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2, mt: 2 }}>
                  Reservation Details
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Select Date"
                  name="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={handleChange}
                  error={!!errors.eventDate}
                  helperText={errors.eventDate}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: today }}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Time Slot"
                  name="timeSlot"
                  value={formData.timeSlot}
                  onChange={handleChange}
                  error={!!errors.timeSlot}
                  helperText={errors.timeSlot}
                  required
                >
                  {timeSlots.map(time => (
                    <MenuItem key={time} value={time}>{time}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Dietary Restrictions"
                  name="dietaryRestrictions"
                  placeholder="Please let us know about any allergies or dietary preferences"
                  value={formData.dietaryRestrictions}
                  onChange={handleChange}
                />
              </Grid>

              {/* Payment Info */}
              <Grid size={12}>
                <Typography variant="h5" color="text.heading" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2, mt: 2 }}>
                  Payment Information
                </Typography>
                
                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.default', textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Price per person: $75
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Includes 4-course meal, beverages, and matching service
                  </Typography>

                  <Alert severity="warning" icon={false} sx={{ justifyContent: 'center' }}>
                    <strong>Demo Mode:</strong> Payment processing is disabled for testing. No credit card required.
                  </Alert>
                </Paper>
              </Grid>

              <Grid size={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{ mt: 2, height: 56 }}
                >
                  {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Complete Reservation - $75'}
                </Button>
              </Grid>

            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  )
}

export default Reservation
