import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { isSameDay, subDays, isPast, differenceInMinutes } from 'date-fns';
import { Droplet, Milk, BrainCircuit, Clock } from 'lucide-react';

export default function HomeView() {
  const navigate = useNavigate();
  const { entries } = useData();

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Actualizamos el "now" cada 60 segundos para el contador de tiempo transcurrido
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const metrics = useMemo(() => {
    // Encontrar la última toma (pecho o biberón)
    const sortedFeedings = entries
      .filter(e => ['breast', 'bottle'].includes(e.type))
      .sort((a,b) => new Date(a.date) - new Date(b.date));

    const lastFeeding = sortedFeedings.length > 0 ? sortedFeedings[sortedFeedings.length - 1] : null;

    // Calcular la predicción estadística (Media de espera para esta franja horaria)
    let forecastMs = 2 * 3600000; // Por defecto empezamos con 2 horas si no hay datos
    let hasEnoughData = false;

    if (lastFeeding && sortedFeedings.length > 2) {
      const gaps = [];
      for (let i = 0; i < sortedFeedings.length - 1; i++) {
        const current = new Date(sortedFeedings[i].date);
        const next = new Date(sortedFeedings[i+1].date);
        const diffMs = next - current;
        
        // Ignorar saltos irreales (más de 8h probables olvidos, o menos de 30 mins)
        if (diffMs > 8 * 3600000 || diffMs < 1800000) continue;
        
        gaps.push({
          startHour: current.getHours(),
          diffMs
        });
      }

      const targetHour = new Date(lastFeeding.date).getHours();
      
      // Filtrar aquellos huecos históricos de tomas que ocurrieron en la misma franja de +-3 horas
      const relevantGaps = gaps.filter(g => {
        const hDiff = Math.abs(g.startHour - targetHour);
        return hDiff <= 3 || hDiff >= 21; // contempla el cruce de medianoche
      });

      if (relevantGaps.length >= 2) {
        hasEnoughData = true;
        const sumMs = relevantGaps.reduce((acc, g) => acc + g.diffMs, 0);
        forecastMs = sumMs / relevantGaps.length;
      }
    }

    let nextFeedingRefDate = null;  // La regla de las 2 horas
    let nextFeedingForecast = null; // La bola de crista de la IA
    let isAlertRef = false;
    let isAlertForecast = false;

    if (lastFeeding) {
      nextFeedingRefDate = new Date(new Date(lastFeeding.date).getTime() + (2 * 3600000));
      nextFeedingForecast = new Date(new Date(lastFeeding.date).getTime() + forecastMs);
      
      isAlertRef = isPast(nextFeedingRefDate);
      isAlertForecast = isPast(nextFeedingForecast);
    }

    return { 
      lastFeeding, 
      nextFeedingRefDate, 
      nextFeedingForecast,
      isAlertRef,
      isAlertForecast,
      hasEnoughData
    };
  }, [entries]);

  // Format Helper
  const formatTime = (date) => {
    return date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
  };

  const formatTimeAgo = (lastDate) => {
    if (!lastDate) return '';
    const diff = differenceInMinutes(now, new Date(lastDate));
    if (diff < 1) return 'hace un momento';
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    
    if (hours === 0) return `hace ${mins} min`;
    if (mins === 0) return `hace ${hours} h`;
    return `hace ${hours} h y ${mins} min`;
  };

  return (
    <div className="home-container animate-fade-in">
      <div className="home-header">
        <h1 className="greeting">¡Hola! 👋</h1>
        <p className="subtitle">Resumen diario de Ignacio</p>
      </div>

      <div className="main-cards">
        
        {/* Tarjeta de Modelado Inteligente */}
        <div className={`glass timer-card animate-slide-up ${metrics.isAlertForecast ? 'alert' : ''}`}>
          <div className="timer-header">
            <BrainCircuit size={18} />
            <h2>Pronóstico Inteligente</h2>
          </div>
          <div className="timer-value">
            {formatTime(metrics.nextFeedingForecast)}
          </div>
          <div className="timer-footer">
            {metrics.hasEnoughData 
              ? "Calculado según el ritmo histórico a esta hora."
              : "Recopilando datos para el algoritmo..."}
          </div>
        </div>

        {/* Tarjeta de Regla de 2 horas */}
        <div className={`glass timer-card secondary animate-slide-up ${metrics.isAlertRef ? 'alert' : ''}`} style={{animationDelay: '0.1s'}}>
          <div className="timer-header">
            <Clock size={16} />
            <h2>Referencia Base (2h)</h2>
          </div>
          <div className="timer-value small">
            {formatTime(metrics.nextFeedingRefDate)}
          </div>
        </div>

      </div>

      <div className="last-record animate-fade-in" style={{animationDelay: '0.2s'}}>
        <h3>Última Toma Registrada:</h3>
        {metrics.lastFeeding ? (
          <div className="last-record-box glass">
            <div className="icon-wrapper">
              {metrics.lastFeeding.type === 'breast' ? <Droplet size={20} color="#F06292"/> : <Milk size={20} color="#4285F4"/>}
            </div>
            <div className="record-details">
              <strong>{metrics.lastFeeding.type === 'breast' ? 'Pecho' : 'Biberón'}</strong>
              <span className="time-exact">a las {formatTime(new Date(metrics.lastFeeding.date))}</span>
              <span className="time-ago">{formatTimeAgo(metrics.lastFeeding.date)}</span>
            </div>
          </div>
        ) : (
          <p className="empty-state">No hay tomas registradas.</p>
        )}
      </div>

      <button className="primary-btn mt-auto" onClick={() => navigate('/calendar')}>
        Ir al Calendario
      </button>

      <style>{`
        .home-container {
          padding: 1.5rem;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .home-header {
          margin-bottom: 2rem;
        }
        .greeting {
          font-size: 2.2rem;
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 0.2rem;
        }
        .subtitle {
          color: var(--text-light);
          font-size: 1rem;
        }
        .main-cards {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .timer-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          border: 2px solid transparent;
          transition: border-color 0.3s;
        }
        .timer-card.secondary {
          padding: 1rem;
        }
        .timer-card.alert {
          border-color: rgba(244, 180, 0, 0.5);
          background: rgba(244, 180, 0, 0.05);
        }
        .timer-card.alert .timer-value, .timer-card.alert .timer-header {
          color: #F4B400;
        }
        .timer-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-light);
          margin-bottom: 0.5rem;
        }
        .timer-header h2 {
          font-size: 1rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .timer-card.secondary .timer-header h2 {
          font-size: 0.85rem;
        }
        .timer-value {
          font-size: 3.5rem;
          font-weight: 800;
          color: var(--primary);
          line-height: 1;
          margin-bottom: 0.5rem;
        }
        .timer-value.small {
          font-size: 2rem;
          color: var(--text-dark);
          margin-bottom: 0;
        }
        .timer-footer {
          font-size: 0.8rem;
          color: var(--text-light);
        }
        .last-record h3 {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-light);
          margin-bottom: 0.8rem;
          text-transform: uppercase;
        }
        .last-record-box {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
        }
        .icon-wrapper {
          background: rgba(255,255,255,0.6);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .record-details {
          display: flex;
          flex-direction: column;
        }
        .record-details strong {
          color: var(--text-dark);
          font-size: 1.1rem;
        }
        .record-details span.time-exact {
          color: var(--text-light);
          font-size: 0.85rem;
        }
        .record-details span.time-ago {
          color: #DB4437;
          font-weight: 600;
          font-size: 0.95rem;
          margin-top: 2px;
          background: rgba(219, 68, 55, 0.05);
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .empty-state {
          color: var(--text-light);
          font-style: italic;
          font-size: 0.9rem;
        }
        .primary-btn {
          width: 100%;
          padding: 1rem;
          margin-top: auto;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 1.1rem;
          font-weight: 600;
          box-shadow: 0 4px 14px rgba(66, 133, 244, 0.4);
          cursor: pointer;
        }
        .primary-btn:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}
