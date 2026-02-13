import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import GroupIcon from '@mui/icons-material/Group'
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
      // Ensure data is array
      setReservations(Array.isArray(data) ? data : [])
      console.log('Loaded reservations:', data)
    } catch (error) {
      console.error('Error loading reservations:', error)
      setReservations([])
    } finally {
      setLoading(false)
    }
  }

  const createGroups = () => {
    if (!selectedDate) {
      alert('Please select a date to create groups for.')
      return
    }

    const dateReservations = reservations.filter(res => 
      res.eventDate === selectedDate && res.personalityResults
    )

    if (dateReservations.length === 0) {
      alert('No reservations with personality results found for this date.')
      return
    }

    const sortedReservations = [...dateReservations].sort((a, b) =>
      a.personalityResults.averageScore - b.personalityResults.averageScore
    )

    const newGroups = []
    const minGroupSize = 2
    const maxGroupSize = 6
    let currentGroup = []

    // Helper to calc average
    const calcAvg = (group) => group.reduce((sum, res) => sum + res.personalityResults.averageScore, 0) / group.length

    for (const reservation of sortedReservations) {
      if (currentGroup.length === 0) {
        currentGroup.push(reservation)
      } else {
        const groupScore = calcAvg(currentGroup)
        const scoreDifference = Math.abs(reservation.personalityResults.averageScore - groupScore)

        if (scoreDifference <= 1.0 && currentGroup.length < maxGroupSize) {
          currentGroup.push(reservation)
        } else {
          if (currentGroup.length >= minGroupSize) {
            newGroups.push({
              id: newGroups.length + 1,
              table: `Table ${newGroups.length + 1}`,
              members: [...currentGroup],
              averageScore: calcAvg(currentGroup)
            })
            currentGroup = [reservation]
          } else {
            currentGroup.push(reservation)
          }
        }
      }
    }

    if (currentGroup.length >= minGroupSize) {
      newGroups.push({
        id: newGroups.length + 1,
        table: `Table ${newGroups.length + 1}`,
        members: [...currentGroup],
        averageScore: calcAvg(currentGroup)
      })
    } else if (currentGroup.length > 0 && newGroups.length > 0) {
      newGroups[newGroups.length - 1].members.push(...currentGroup)
      newGroups[newGroups.length - 1].averageScore = calcAvg(newGroups[newGroups.length - 1].members)
    }

    setGroups(newGroups)
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
      Object.keys(csvData[0] || {}).join(','),
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
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ pt: '100px', textAlign: 'center' }}>
          <CircularProgress />
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ pt: '100px' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom color="primary">
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage reservations and create compatible dining groups
          </Typography>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary">Total Reservations</Typography>
              <Typography variant="h4" color="primary">{reservations.length}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary">Personality Tests</Typography>
              <Typography variant="h4" color="primary">{reservationsWithPersonality.length}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary">Completion Rate</Typography>
              <Typography variant="h4" color="primary">{completionRate}%</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary">Event Dates</Typography>
              <Typography variant="h4" color="primary">{uniqueDates.length}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Grouping Section */}
        <Paper elevation={0} variant="outlined" sx={{ p: 4, mb: 6, bgcolor: 'background.paper' }}>
          <Typography variant="h5" gutterBottom color="primary">
            Create Dining Groups
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 4 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Select Date</InputLabel>
              <Select
                value={selectedDate}
                label="Select Date"
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {uniqueDates.map(date => (
                  <MenuItem key={date} value={date}>
                    {new Date(date).toLocaleDateString()} 
                    ({reservations.filter(res => res.eventDate === date).length})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<GroupIcon />}
              onClick={createGroups}
              disabled={!selectedDate}
            >
              Create Compatible Groups
            </Button>
          </Stack>

          {groups.length > 0 && (
            <Grid container spacing={3}>
              {groups.map(group => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={group.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h6">{group.table}</Typography>
                        <Chip label={`Avg: ${group.averageScore.toFixed(2)}`} size="small" color="secondary" />
                      </Stack>
                      <Stack spacing={1}>
                        {group.members.map((member, idx) => (
                          <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                            <span>{member.firstName} {member.lastName}</span>
                            <span style={{ color: 'gray' }}>{member.personalityResults.averageScore}</span>
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        {/* Reservations Table */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" color="primary">All Reservations</Typography>
          <Button
            startIcon={<DownloadIcon />}
            onClick={exportData}
            variant="outlined"
            disabled={reservations.length === 0}
          >
            Export CSV
          </Button>
        </Box>

        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Personality Type</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    No reservations found.
                  </TableCell>
                </TableRow>
              ) : (
                reservations.map(reservation => (
                  <TableRow key={reservation.id || Math.random()}>
                    <TableCell>{reservation.firstName} {reservation.lastName}</TableCell>
                    <TableCell>{reservation.email}</TableCell>
                    <TableCell>{new Date(reservation.eventDate).toLocaleDateString()}</TableCell>
                    <TableCell>{reservation.timeSlot}</TableCell>
                    <TableCell>
                      {reservation.personalityResults?.personalityType ? (
                        <Chip
                          label={reservation.personalityResults.personalityType}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">Not completed</Typography>
                      )}
                    </TableCell>
                    <TableCell>{reservation.personalityResults?.averageScore || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={reservation.status || 'pending'}
                        size="small"
                        color={reservation.status === 'confirmed' ? 'success' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Alert severity="info" sx={{ mt: 4 }}>
          <strong>Demo Mode Notice:</strong> This dashboard shows data from localStorage/Firebase.
          Authentication is disabled for demonstration purposes.
        </Alert>

      </Container>
    </Box>
  )
}

export default AdminDashboard
