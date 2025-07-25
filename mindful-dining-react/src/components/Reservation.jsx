import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

  // Set minimum date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    document.getElementById('eventDate')?.setAttribute('min', today)
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length >= 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
    } else if (value.length >= 3) {
      value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2')
    }
    setFormData(prev => ({
      ...prev,
      phone: value
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    const required = ['firstName', 'lastName', 'email', 'eventDate', 'timeSlot']
    
    for (const field of required) {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = 'This field is required'
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Validate date is in future
    if (formData.eventDate) {
      const selectedDate = new Date(formData.eventDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.eventDate = 'Please select a future date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      console.log('⚡ Demo Mode: Processing instantly...')
      
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
      
      console.log('🚀 Done! Redirecting to personality test...')
      
      // Store data for next step
      sessionStorage.setItem('reservationId', reservationId)
      sessionStorage.setItem('reservationData', JSON.stringify(formData))
      
      // Navigate to personality test
      navigate('/personality-test')
      
    } catch (error) {
      console.error('Error processing reservation:', error)
      alert('Error: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const timeSlots = [
    '6:00 PM',
    '7:00 PM',
    '8:00 PM'
  ]

  return (
    <div className="reservation-page">
      <header className="page-header">
        <Navbar />
      </header>

      <main className="reservation-main">
        <div className="container">
          <div className="reservation-form-container">
            <h1>Make Your Reservation</h1>
            <p className="form-description">
              Reserve your spot for an unforgettable dining experience. After booking, 
              you'll take a quick personality test to be matched with compatible dining companions.
            </p>
            
            <form onSubmit={handleSubmit} className="reservation-form">
              <div className="form-section">
                <h3>Personal Information</h3>
                
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className={errors.firstName ? 'error' : ''}
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className={errors.lastName ? 'error' : ''}
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Reservation Details</h3>
                
                <div className="form-group">
                  <label htmlFor="eventDate">Select Date *</label>
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    required
                    className={errors.eventDate ? 'error' : ''}
                  />
                  {errors.eventDate && <span className="error-message">{errors.eventDate}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="timeSlot">Time Slot *</label>
                  <select
                    id="timeSlot"
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={handleInputChange}
                    required
                    className={errors.timeSlot ? 'error' : ''}
                  >
                    <option value="">Select a time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {errors.timeSlot && <span className="error-message">{errors.timeSlot}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="dietaryRestrictions">Dietary Restrictions</label>
                  <textarea
                    id="dietaryRestrictions"
                    name="dietaryRestrictions"
                    rows="3"
                    placeholder="Please let us know about any allergies or dietary preferences"
                    value={formData.dietaryRestrictions}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Payment Information</h3>
                <div className="pricing-info">
                  <p><strong>Price per person: $75</strong></p>
                  <p>Includes 4-course meal, beverages, and matching service</p>
                  <div style={{
                    background: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    padding: '10px',
                    borderRadius: '5px',
                    marginTop: '10px'
                  }}>
                    <small>
                      <strong>Demo Mode:</strong> This is for testing purposes only. 
                      No credit card information required - payment processing is disabled for testing.
                    </small>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    Processing...
                  </>
                ) : (
                  'Complete Reservation - $75'
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Reservation