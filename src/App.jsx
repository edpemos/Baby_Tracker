import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import Login from './components/Login';
import Navigation from './components/Navigation';

// Vistas que iré implementando:
import CalendarView from './pages/CalendarView';
import HomeView from './pages/HomeView';
import StatsView from './pages/StatsView';
import AIPanel from './pages/AIPanel';
import SettingsView from './pages/SettingsView';

const AuthenticatedLayout = () => {
  const { isAuthenticated } = useData();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container animate-fade-in">
      <div className="view-container">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/stats" element={<StatsView />} />
          <Route path="/ai" element={<AIPanel />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Navigation />
    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/*" element={<AuthenticatedLayout />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

// Un pequeño componente para saber si ya estamos loggeados antes de mostrar el Login
function LoginRoute() {
  const { isAuthenticated } = useData();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <Login />;
}
