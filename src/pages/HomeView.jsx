import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { format, addHours } from 'date-fns';
import { Clock, Baby, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomeView() {
  const { entries } = useData();

  const nextFeedingInfo = useMemo(() => {
    // Filtrar solo las tomas de alimentación
    const feedings = entries.filter(e => e.type === 'breast' || e.type === 'bottle');
    
    if (feedings.length === 0) return null;

    // Obtener la toma más reciente (suponiendo que ya están ordenadas u ordenándolas)
    const sortedFeedings = [...feedings].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastFeedingDate = new Date(sortedFeedings[0].date);
    
    // Sumar 2 horas
    const nextTime = addHours(lastFeedingDate, 2);

    return {
      lastType: sortedFeedings[0].type,
      lastTimeFormatted: format(lastFeedingDate, 'HH:mm'),
      nextTimeFormatted: format(nextTime, 'HH:mm'),
      isOverdue: new Date() > nextTime
    };
  }, [entries]);

  return (
    <div className="home-container animate-fade-in">
      <div className="home-header">
        <h1 className="view-title">¡Hola!</h1>
        <p className="subtitle">Resumen diario de Ignacio</p>
      </div>

      <div className="home-content">
        {nextFeedingInfo ? (
          <div className="glass next-feeding-card animate-slide-up">
            <div className="card-header">
              <Clock className="header-icon" />
              <h3>Próxima toma sugerida a las:</h3>
            </div>
            
            <div className={`time-display ${nextFeedingInfo.isOverdue ? 'overdue' : ''}`}>
              {nextFeedingInfo.nextTimeFormatted}
            </div>
            
            <p className="last-info">
              (Última toma de {nextFeedingInfo.lastType === 'breast' ? 'Pecho' : 'Biberón'} a las {nextFeedingInfo.lastTimeFormatted})
            </p>
          </div>
        ) : (
          <div className="glass next-feeding-card animate-slide-up">
            <div className="card-header">
              <Baby className="header-icon" />
              <h3>¡Aún no hay tomas!</h3>
            </div>
            <p className="last-info">Registra la primera toma en el calendario para calcular la siguiente.</p>
          </div>
        )}

        <Link to="/calendar" className="glass shortcut-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="shortcut-content">
            <div className="icon-wrapper">
              <Baby color="var(--primary)" />
            </div>
            <div className="shortcut-text">
              <h3>Ir al Calendario</h3>
              <p>Registrar pañales y tomas</p>
            </div>
          </div>
          <ChevronRight color="var(--text-light)" />
        </Link>
      </div>

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
        .view-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 0.25rem;
        }
        .subtitle {
          color: var(--text-light);
          font-size: 1rem;
        }
        .home-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .next-feeding-card {
          padding: 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: linear-gradient(135deg, rgba(66, 133, 244, 0.05) 0%, rgba(255, 255, 255, 0.9) 100%);
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: var(--text-dark);
        }
        .header-icon {
          color: var(--primary);
        }
        .card-header h3 {
          font-weight: 600;
          font-size: 1.1rem;
        }
        .time-display {
          font-size: 4rem;
          font-weight: 700;
          color: var(--primary);
          line-height: 1;
          margin-bottom: 1rem;
        }
        .time-display.overdue {
          color: var(--color-pee); /* Use a warning color if overdue */
        }
        .last-info {
          color: var(--text-light);
          font-size: 0.95rem;
        }
        .shortcut-card {
          display: flex;
          padding: 1.5rem;
          align-items: center;
          justify-content: space-between;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s;
        }
        .shortcut-card:active {
          transform: scale(0.98);
        }
        .shortcut-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .icon-wrapper {
          background: rgba(66, 133, 244, 0.1);
          padding: 0.75rem;
          border-radius: 50%;
          display: flex;
        }
        .shortcut-text h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 0.25rem;
        }
        .shortcut-text p {
          font-size: 0.9rem;
          color: var(--text-light);
        }
      `}</style>
    </div>
  );
}
