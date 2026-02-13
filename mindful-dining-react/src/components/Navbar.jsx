import { Link as RouterLink, useLocation } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material'

function Navbar({ onNavigate }) {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  const handleNavClick = (sectionId) => {
    if (isHomePage && onNavigate) {
      onNavigate(sectionId)
    }
  }

  const navItems = isHomePage ? [
    { label: 'About', action: () => handleNavClick('about'), href: '#about' },
    { label: 'How It Works', action: () => handleNavClick('how-it-works'), href: '#how-it-works' },
    { label: 'Contact', action: () => handleNavClick('contact'), href: '#contact' },
  ] : [
    { label: 'Home', to: '/' },
    { label: 'Reserve', to: '/reservation' },
    { label: 'Admin', to: '/admin-dashboard' },
  ]

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={{
        backgroundColor: 'rgba(250, 250, 249, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: 76 }}>
          <Box component={RouterLink} to="/" sx={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              Mindful Dining
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            {navItems.map((item) => (
              item.to ? (
                <Button
                  key={item.label}
                  component={RouterLink}
                  to={item.to}
                  color="inherit"
                  sx={{ fontWeight: 500 }}
                >
                  {item.label}
                </Button>
              ) : (
                <Button
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    item.action();
                  }}
                  color="inherit"
                  sx={{ fontWeight: 500 }}
                >
                  {item.label}
                </Button>
              )
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Navbar
