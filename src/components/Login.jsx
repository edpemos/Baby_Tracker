import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Baby } from 'lucide-react';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useData();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!login(password)) {
      setError('Contraseña incorrecta');
      setPassword('');
      document.getElementById('login-form').classList.add('shake');
      setTimeout(() => document.getElementById('login-form').classList.remove('shake'), 500);
    }
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="glass login-card">
        <div className="login-icon-container">
          <Baby size={64} color="#A0C4FF" />
        </div>
        <h1 className="login-title">Baby Tracker</h1>
        <p className="login-subtitle">Registro diario de Ignacio</p>
        
        <form id="login-form" onSubmit={handleLogin} className="login-form">
          <input 
            type="password" 
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
