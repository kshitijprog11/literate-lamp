import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar
} from '@mui/material'
import Navbar from './Navbar'

function Home() {
  const navigate = useNavigate()

  const handleReservation = () => {
    navigate('/reservation')
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const steps = [
    { number: 1, title: 'Reserve Your Spot', description: 'Choose your preferred date and complete your reservation with secure payment.' },
    { number: 2, title: 'Take the Personality Test', description: 'Complete our brief personality assessment to help us understand your dining style.' },
    { number: 3, title: 'Get Matched', description: 'We\'ll group you with 2-12 compatible diners for the perfect evening.' },
    { number: 4, title: 'Enjoy Your Experience', description: 'Meet your table companions and enjoy an evening of great food and conversation.' },
  ]

  return (
    <Box>
      <Navbar onNavigate={scrollToSection} />

      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          pt: '76px', // Navbar height
          background: 'linear-gradient(135deg, rgba(160, 115, 95, 0.08) 0%, rgba(212, 165, 116, 0.05) 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ animation: 'fadeInUp 0.8s ease-out' }}>
            <Typography variant="h1" component="h1" gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '4rem' } }}>
              Connect Through Food
            </Typography>
            <Typography variant="h5" component="p" color="text.secondary" sx={{ mb: 4, maxWidth: '720px', mx: 'auto', lineHeight: 1.6 }}>
              Join like-minded people for an unforgettable dining experience.
              Take our personality test and get matched with your perfect dining companions.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleReservation}
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              Make a Reservation
            </Button>
          </Box>
        </Container>
      </Box>

      {/* About Section */}
      <Box id="about" sx={{ py: 10, bgcolor: 'background.paper' }}>
        <Container maxWidth="md">
          <Typography variant="h2" component="h2" align="center" gutterBottom color="primary">
            About Mindful Dining
          </Typography>
          <Typography variant="body1" align="center" sx={{ fontSize: '1.125rem', lineHeight: 1.8, maxWidth: '800px', mx: 'auto', color: 'text.primary' }}>
            We believe that the best conversations happen over great food. Our unique dining 
            experience combines exceptional cuisine with carefully curated social connections. 
            Through our personality assessment, we match you with fellow diners who share your 
            interests, communication style, and dining preferences.
          </Typography>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box id="how-it-works" sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" component="h2" align="center" gutterBottom color="primary" sx={{ mb: 6 }}>
            How It Works
          </Typography>
          <Grid container spacing={4}>
            {steps.map((step) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={step.number}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 3, border: '1px solid', borderColor: 'divider' }} elevation={0}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', mb: 2, fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {step.number}
                  </Avatar>
                  <CardContent>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box id="contact" sx={{ py: 10, bgcolor: 'background.paper', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h2" component="h2" gutterBottom color="primary">
            Contact Us
          </Typography>
          <Typography variant="h6" gutterBottom color="text.secondary">
            Questions? We'd love to hear from you.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Email: hello@mindfuldining.com | Phone: (555) 123-4567
          </Typography>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ py: 6, bgcolor: 'text.primary', color: 'background.paper', textAlign: 'center' }}>
        <Container>
          <Typography variant="body2">
            &copy; 2024 Mindful Dining. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}

export default Home
