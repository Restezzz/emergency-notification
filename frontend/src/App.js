import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';

import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ServerList from './components/ServerList';
import EventsList from './components/EventsList';
import DroneData from './components/DroneData';

const theme = createTheme({
  palette: {
    primary: {
      main: '#d32f2f',
    },
    secondary: {
      main: '#f44336',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/servers" element={<ServerList />} />
          <Route path="/events" element={<EventsList />} />
          <Route path="/drones" element={<DroneData />} />
        </Routes>
      </Container>
    </ThemeProvider>
  );
}

export default App; 