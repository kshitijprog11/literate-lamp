import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFirebase } from '../context/FirebaseContext'
import Navbar from './Navbar'

function AdminDashboard() {
  const navigate = useNavigate()
  const { getReservations } = useFirebase()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState([])
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    try {
      setLoading(true)
      const data = await getReservations()
      setReservations(data)
      console.log('Loaded reservations:', data)
    } catch (error) {
      console.error('Error loading reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  const createGroups = async () => {
    if (!selectedDate) {
      alert('Please select a date to create groups for.')
      return
    }

    // Filter reservations for selected date
    const dateReservations = reservations.filter(res => 
      res.eventDate === selectedDate && res.personalityResults
    )

    if (dateReservations.length === 0) {
      alert('No reservations with personality results found for this date.')
      return
    }

    // Simple grouping algorithm based on personality scores
    const sortedReservations = dateReservations.sort((a, b) => 
      a.personalityResults.averageScore - b.personalityResults.averageScore
    )

    const newGroups = []
    const minGroupSize = 2
    const maxGroupSize = 6
    let currentGroup = []

    for (const reservation of sortedReservations) {
      if (currentGroup.length === 0) {
        currentGroup.push(reservation)
      } else {
        const groupScore = currentGroup.reduce((sum, res) => 
          sum + res.personalityResults.averageScore, 0
        ) / currentGroup.length

        const scoreDifference = Math.abs(
          reservation.personalityResults.averageScore - groupScore
        )

        // If score difference is small or group is getting too big, add to current group
        if (scoreDifference <= 1.0 && currentGroup.length < maxGroupSize) {
          currentGroup.push(reservation)
        } else {
          // Start new group if current group has minimum size
          if (currentGroup.length >= minGroupSize) {
            newGroups.push({
              id: newGroups.length + 1,
              table: `Table ${newGroups.length + 1}`,
              members: [...currentGroup],
              averageScore: currentGroup.reduce((sum, res) => 
                sum + res.personalityResults.averageScore, 0
              ) / currentGroup.length
            })
            currentGroup = [reservation]
          } else {
            currentGroup.push(reservation)
          }
        }
      }
    }

    // Add the last group if it has minimum size
    if (currentGroup.length >= minGroupSize) {
      newGroups.push({
        id: newGroups.length + 1,
        table: `Table ${newGroups.length + 1}`,
        members: [...currentGroup],
        averageScore: currentGroup.reduce((sum, res) => 
          sum + res.personalityResults.averageScore, 0
        ) / currentGroup.length
      })
    } else if (currentGroup.length > 0 && newGroups.length > 0) {
      // Add remaining people to the last group
      newGroups[newGroups.length - 1].members.push(...currentGroup)
      // Recalculate average score
      const lastGroup = newGroups[newGroups.length - 1]
      lastGroup.averageScore = lastGroup.members.reduce((sum, res) => 
        sum + res.personalityResults.averageScore, 0
      ) / lastGroup.members.length
    }

    setGroups(newGroups)
    alert(`Created ${newGroups.length} compatible dining groups!`)
  }

  const exportData = () => {
    const csvData = reservations.map(res => ({
      Name: `${res.firstName} ${res.lastName}`,
      Email: res.email,
      Phone: res.phone || '',
      Date: res.eventDate,
      Time: res.timeSlot,
      PersonalityType: res.personalityResults?.personalityType || 'Not completed',
      Score: res.personalityResults?.averageScore || 'N/A',
      DietaryRestrictions: res.dietaryRestrictions || ''
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mindful-dining-reservations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const uniqueDates = [...new Set(reservations.map(res => res.eventDate))].sort()

  const reservationsWithPersonality = reservations.filter(res => res.personalityResults)
  const completionRate = reservations.length > 0 
    ? ((reservationsWithPersonality.length / reservations.length) * 100).toFixed(1)
    : 0

  if (loading) {
    return (
      <div className="admin-dashboard">
        <header className="page-header">
          <Navbar />
        </header>
        <main className="admin-main">
          <div className="container">
            <div className="loading">Loading reservations...</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <header className="page-header">
        <Navbar />
      </header>

      <main className="admin-main">
        <div className="container">
          <div className="admin-header">
            <h1>Admin Dashboard</h1>
            <p>Manage reservations and create compatible dining groups</p>
          </div>

          <div className="stats-section">
            <div className="stat-card">
              <h3>Total Reservations</h3>
              <div className="stat-number">{reservations.length}</div>
            </div>
            <div className="stat-card">
              <h3>Personality Tests Completed</h3>
              <div className="stat-number">{reservationsWithPersonality.length}</div>
            </div>
            <div className="stat-card">
              <h3>Completion Rate</h3>
              <div className="stat-number">{completionRate}%</div>
            </div>
            <div className="stat-card">
              <h3>Event Dates</h3>
              <div className="stat-number">{uniqueDates.length}</div>
            </div>
          </div>

          <div className="grouping-section">
            <h2>Create Dining Groups</h2>
            <div className="grouping-controls">
              <select 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-select"
              >
                <option value="">Select Date</option>
                {uniqueDates.map(date => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString()} 
                    ({reservations.filter(res => res.eventDate === date).length} reservations)
                  </option>
                ))}
              </select>
              <button onClick={createGroups} className="create-groups-btn">
                Create Compatible Groups
              </button>
            </div>

            {groups.length > 0 && (
              <div className="groups-display">
                <h3>Generated Groups for {new Date(selectedDate).toLocaleDateString()}</h3>
                {groups.map(group => (
                  <div key={group.id} className="group-card">
                    <div className="group-header">
                      <h4>{group.table}</h4>
                      <span className="group-score">
                        Avg Score: {group.averageScore.toFixed(2)}
                      </span>
                    </div>
                    <div className="group-members">
                      {group.members.map(member => (
                        <div key={member.id} className="member-item">
                          <span className="member-name">
                            {member.firstName} {member.lastName}
                          </span>
                          <span className="member-type">
                            {member.personalityResults.personalityType}
                          </span>
                          <span className="member-score">
                            {member.personalityResults.averageScore}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="reservations-section">
            <div className="section-header">
              <h2>All Reservations</h2>
              <button onClick={exportData} className="export-btn">
                Export CSV
              </button>
            </div>

            {reservations.length === 0 ? (
              <div className="no-data">
                <p>No reservations found.</p>
                <button onClick={() => navigate('/reservation')} className="create-test-btn">
                  Create Test Reservation
                </button>
              </div>
            ) : (
              <div className="reservations-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Personality Type</th>
                      <th>Score</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map(reservation => (
                      <tr key={reservation.id}>
                        <td>{reservation.firstName} {reservation.lastName}</td>
                        <td>{reservation.email}</td>
                        <td>{new Date(reservation.eventDate).toLocaleDateString()}</td>
                        <td>{reservation.timeSlot}</td>
                        <td>
                          {reservation.personalityResults?.personalityType || (
                            <span className="incomplete">Not completed</span>
                          )}
                        </td>
                        <td>
                          {reservation.personalityResults?.averageScore || 'N/A'}
                        </td>
                        <td>
                          <span className={`status ${reservation.status || 'pending'}`}>
                            {reservation.status || 'pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="demo-notice">
            <h3>Demo Mode Notice</h3>
            <p>
              This admin dashboard shows data from localStorage and Firebase (if configured). 
              In a production environment, this would include authentication, advanced filtering, 
              email sending capabilities, and more sophisticated grouping algorithms.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard