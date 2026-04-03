import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, BarChart2, Home, Sparkles, Settings } from 'lucide-react';

export default function Navigation() {
  return (
    <nav className="glass bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
        <Home size={24} />
        <span>Inicio</span>
      </NavLink>
      <NavLink to="/calendar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Calendar size={24} />
        <span>Calendario</span>
      </NavLink>
      <NavLink to="/stats" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <BarChart2 size={24} />
        <span>Datos</span>
      </NavLink>
      <NavLink to="/ai" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Sparkles size={24} />
        <span style={{ fontSize: '0.65rem' }}>Consejos</span>
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Settings size={24} />
        <span style={{ fontSize: '0.65rem' }}>Ajustes</span>
      </NavLink>
    </nav>
  );
}
