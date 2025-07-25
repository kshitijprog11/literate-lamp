import { useNavigate } from 'react-router-dom'
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

  return (
    <div className="home">
      <header className="hero-section">
        <Navbar onNavigate={scrollToSection} />
        
        <div className="hero-content">
          <h1 className="hero-title">Connect Through Food</h1>
          <p className="hero-subtitle">
            Join like-minded people for an unforgettable dining experience. 
            Take our personality test and get matched with your perfect dining companions.
          </p>
          <button className="cta-button" onClick={handleReservation}>
            Make a Reservation
          </button>
        </div>
      </header>

      <section id="about" className="about-section">
        <div className="container">
          <h2>About Mindful Dining</h2>
          <p>
            We believe that the best conversations happen over great food. Our unique dining 
            experience combines exceptional cuisine with carefully curated social connections. 
            Through our personality assessment, we match you with fellow diners who share your 
            interests, communication style, and dining preferences.
          </p>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works-section">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Reserve Your Spot</h3>
              <p>Choose your preferred date and complete your reservation with secure payment.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Take the Personality Test</h3>
              <p>Complete our brief personality assessment to help us understand your dining style.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Matched</h3>
              <p>We'll group you with 2-12 compatible diners for the perfect evening.</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Enjoy Your Experience</h3>
              <p>Meet your table companions and enjoy an evening of great food and conversation.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="container">
          <h2>Contact Us</h2>
          <p>Questions? We'd love to hear from you.</p>
          <p>Email: hello@mindfuldining.com | Phone: (555) 123-4567</p>
        </div>
      </section>

      <footer>
        <div className="container">
          <p>&copy; 2024 Mindful Dining. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home