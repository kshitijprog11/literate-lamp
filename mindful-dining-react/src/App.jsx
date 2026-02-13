import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { FirebaseProvider } from './context/FirebaseContext'
import theme from './theme'
import './styles.css'

// Import components
import Home from './components/Home'
import Reservation from './components/Reservation'
import PersonalityTest from './components/PersonalityTest'
import Confirmation from './components/Confirmation'
import AdminDashboard from './components/AdminDashboard'
import TableAssignment from './components/TableAssignment'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FirebaseProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/reservation" element={<Reservation />} />
              <Route path="/personality-test" element={<PersonalityTest />} />
              <Route path="/confirmation" element={<Confirmation />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/table-assignment" element={<TableAssignment />} />
            </Routes>
          </div>
        </Router>
      </FirebaseProvider>
    </ThemeProvider>
  )
}

export default App
