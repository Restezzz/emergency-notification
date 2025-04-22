import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Компонент для защиты маршрутов, требующих авторизации
 */
const AuthGuard = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем наличие токена авторизации
    const authToken = localStorage.getItem('authToken');
    
    // В реальном приложении здесь была бы проверка валидности токена
    if (authToken) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    // Можно добавить компонент загрузки здесь
    return null;
  }

  // Если не авторизован, перенаправляем на страницу логина
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если авторизован, рендерим дочерние компоненты
  return children;
};

export default AuthGuard; 