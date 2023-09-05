import React, { Component, useContext } from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';

import AuthPage from './pages/Auth';
import BookingsPage from './pages/Bookings';
import EventsPage from './pages/Events';
import MainNavigation from './components/Navigation/MainNavigation';
import AuthProvider from './context/auth-provider';
import AuthContext from './context/auth-context';

import './App.css';

class App extends Component {
  render() {
    return (
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    );
  }
}

export default App;

const AppRoutes = () => {
  const authContext = useContext(AuthContext);

  return (
    <BrowserRouter>
      <MainNavigation />
      <main className='main-content'>
        <Routes>
          {authContext.token && (
            <>
              <Route path="/" element={<Navigate to="/events" replace />} />
              <Route path="/auth" element={<Navigate to="/events" replace />} />
              <Route path="/bookings" element={<BookingsPage />} />
            </>
          )}
          {!authContext.token && (
            <>
              <Route path="/" element={<Navigate to="/auth" replace />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/bookings" element={<Navigate to="/auth" replace />} />
            </>
          )}
          <Route path="/events" element={<EventsPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};
