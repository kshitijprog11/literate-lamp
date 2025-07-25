import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'

function Confirmation() {
  const navigate = useNavigate()
  const [reservationData, setReservationData] = useState(null)
  const [personalityResults, setPersonalityResults] = useState(null)

  useEffect(() => {
    // Get reservation and personality data from session storage
    const storedReservationData = sessionStorage.getItem('reservationData')
    const storedPersonalityResults = sessionStorage.getItem('personalityResults')
    
    if (storedReservationData) {
      setReservationData(JSON.parse(storedReservationData))
    }
    
    if (storedPersonalityResults) {
      setPersonalityResults(JSON.parse(storedPersonalityResults))
    }

    // If no data found, redirect to home
    if (!storedReservationData) {
      alert('No reservation found. Please make a reservation first.')
      navigate('/')
    }
  }, [navigate])

  const handleNewReservation = () => {
    // Clear session storage and go to reservation page
    sessionStorage.clear()
    navigate('/reservation')
  }

  const handleHomeReturn = () => {
    navigate('/')
  }

  if (!reservationData) {
    return (
      <div className="confirmation-page">
        <header className="page-header">
          <Navbar />
        </header>
        <main className="confirmation-main">
          <div className="container">
            <div className="confirmation-container">
              <div className="loading">Loading...</div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="confirmation-page">
      <header className="page-header">
        <Navbar />
      </header>

      <main className="confirmation-main">
        <div className="container">
          <div className="confirmation-container">
            <div className="success-icon">
              <div className="checkmark">✓</div>
            </div>

            <h1>Reservation Confirmed!</h1>
            <p className="confirmation-message">
              Thank you for choosing Mindful Dining! Your reservation has been confirmed 
              and your personality assessment is complete.
            </p>

            <div className="confirmation-details">
              <div className="details-section">
                <h3>Reservation Details</h3>
                <div className="detail-item">
                  <span className="label">Name:</span>
                  <span className="value">{reservationData.firstName} {reservationData.lastName}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Email:</span>
                  <span className="value">{reservationData.email}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Date:</span>
                  <span className="value">{new Date(reservationData.eventDate).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Time:</span>
                  <span className="value">{reservationData.timeSlot}</span>
                </div>
                {reservationData.phone && (
                  <div className="detail-item">
                    <span className="label">Phone:</span>
                    <span className="value">{reservationData.phone}</span>
                  </div>
                )}
                {reservationData.dietaryRestrictions && (
                  <div className="detail-item">
                    <span className="label">Dietary Restrictions:</span>
                    <span className="value">{reservationData.dietaryRestrictions}</span>
                  </div>
                )}
              </div>

              {personalityResults && (
                <div className="details-section">
                  <h3>Your Personality Type</h3>
                  <div className="personality-summary">
                    <h4>{personalityResults.personalityType}</h4>
                    <p>{personalityResults.description}</p>
                    <div className="compatibility-score">
                      <span className="label">Compatibility Score:</span>
                      <span className="score">{personalityResults.averageScore}/5.0</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="next-steps">
              <h3>What's Next?</h3>
              <div className="steps-list">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Table Assignment</h4>
                    <p>We'll match you with compatible dining companions based on your personality assessment.</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Email Notification</h4>
                    <p>You'll receive an email 24 hours before your dining experience with table details.</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Enjoy Your Experience</h4>
                    <p>Arrive on time and get ready for meaningful conversations and great food!</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-info">
              <h3>Questions?</h3>
              <p>
                If you have any questions or need to make changes to your reservation, 
                please contact us at:
              </p>
              <p>
                <strong>Email:</strong> hello@mindfuldining.com<br />
                <strong>Phone:</strong> (555) 123-4567
              </p>
            </div>

            <div className="action-buttons">
              <button onClick={handleHomeReturn} className="secondary-button">
                Return to Home
              </button>
              <button onClick={handleNewReservation} className="primary-button">
                Make Another Reservation
              </button>
            </div>

            <div className="demo-notice">
              <p>
                <strong>Demo Mode:</strong> This is a demonstration. No actual reservation 
                was made and no payment was processed. In a live version, you would receive 
                actual email confirmations and table assignments.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Confirmation