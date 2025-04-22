import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import EmergencyNotifications from './pages/EmergencyNotifications';
import DroneManagement from './pages/DroneManagement';
import Settings from './pages/Settings';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import MapPage from './pages/MapPage';
import AuthGuard from './components/AuthGuard';

// Конфигурация маршрутов приложения
const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <MainLayout />,
      children: [
        {
          index: true,
          element: (
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          )
        },
        {
          path: 'map',
          element: (
            <AuthGuard>
              <MapPage />
            </AuthGuard>
          )
        },
        {
          path: 'notifications',
          element: (
            <AuthGuard>
              <EmergencyNotifications />
            </AuthGuard>
          )
        },
        {
          path: 'drones',
          element: (
            <AuthGuard>
              <DroneManagement />
            </AuthGuard>
          )
        },
        {
          path: 'settings',
          element: (
            <AuthGuard>
              <Settings />
            </AuthGuard>
          )
        }
      ]
    },
    {
      path: '/login',
      element: <Login />
    },
    {
      path: '/404',
      element: <NotFound />
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />
    }
  ],
  {
    // Добавляем флаги будущих возможностей для устранения предупреждений
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

export default router; 