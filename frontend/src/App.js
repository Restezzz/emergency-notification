import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Dashboard from './components/Dashboard';
import EventsList from './components/EventsList';
import ServerList from './components/ServerList';
import DroneData from './components/DroneData';

/**
 * Тема для приложения
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

/**
 * Основной компонент приложения
 * 
 * Определяет структуру маршрутизации и обеспечивает
 * доступ к контексту сервера для всех компонентов.
 * Система использует протоколы:
 * - TCP для оповещений от МЧС (через API)
 * - WebSocket для стихийных бедствий (через ws://)
 * - UDP для данных с дронов (симулируется)
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <Container sx={{ py: 4 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/events" element={<EventsList />} />
          <Route path="/servers" element={<ServerList />} />
          <Route path="/drones" element={<DroneData />} />
        </Routes>
      </Container>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </ThemeProvider>
  );
}

export default App; 