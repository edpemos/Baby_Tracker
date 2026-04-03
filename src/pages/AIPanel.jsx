import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { isSameDay, isSameWeek } from 'date-fns';
import { Sparkles, Activity, AlertCircle } from 'lucide-react';

export default function AIPanel() {
  const { entries } = useData();

  const advice = useMemo(() => {
    const today = new Date();
    
    // Contajes de hoy
    const todayEntries = entries.filter(e => isSameDay(new Date(e.date), today));
    const todayFood = todayEntries.filter(e => ['breast', 'bottle'].includes(e.type)).length;
    const todayPee = todayEntries.filter(e => e.type === 'pee').length;
    const todayPoop = todayEntries.filter(e => e.type === 'poop').length;

    // Contajes semanales
    const weekEntries = entries.filter(e => isSameWeek(new Date(e.date), today, { weekStartsOn: 1 }));
    let weekFood = 0;
    
    weekEntries.forEach(e => {
      if (['breast', 'bottle'].includes(e.type)) weekFood++;
    });

    const numDaysInWeek = new Date().getDay() || 7; // Día 1-7
    const averageFoodPerDay = weekFood / numDaysInWeek;

    const tips = [];

    // Consejos basados en reglas:
    if (todayFood === 0) {
      tips.push({
        type: 'warning',
        icon: <AlertCircle color="#DB4437" />,
        title: 'Faltan Tomas',
        text: 'Aún no se han registrado tomas para hoy. Recuerda que la alimentación frecuente es crucial, especialmente si es bajo demanda.'
      });
    } else if (todayFood < averageFoodPerDay - 2) {
      tips.push({
        type: 'info',
        icon: <Activity color="#4285F4" />,
        title: 'Tomas por debajo de su media',
        text: `Ignacio ha tomado ${todayFood} veces hoy, pero su media esta semana es de ${averageFoodPerDay.toFixed(1)}. Vigila sus señales de hambre.`
      });
    } else {
      tips.push({
        type: 'good',
        icon: <Sparkles color="#0F9D58" />,
        title: 'Alimentación Constante',
        text: 'Ignacio sigue un buen ritmo de alimentación hoy. ¡Sigue así!'
      });
    }

    if (todayPee < 4 && today.getHours() > 18) {
      tips.push({
        type: 'warning',
        icon: <AlertCircle color="#DB4437" />,
        title: 'Pocos Pañales Mojados',
        text: 'Se han registrado pocos pañales de pipí hoy. Un bebé bien hidratado suele mojar 5-6 pañales al día. Asegúrate de ofrecer más pausas si toma pecho.'
      });
    }

    if (todayPoop > 0) {
      tips.push({
        type: 'info',
        icon: <Activity color="#4285F4" />,
        title: 'Tránsito Normal',
        text: 'Ignacio ha hecho caca hoy. La frecuencia puede variar mucho, pero indica que su sistema digestivo está activo.'
      });
    }

    // AI general tips
    tips.push({
      type: 'ai',
      icon: <Sparkles color="#F4B400" />,
      title: 'Nota de tu IA Pediátrica',
      text: 'Recuerda: la evidencia científica respalda no mirar el reloj con la lactancia materna, se debe ofrecer "a demanda". Los llantos tardíos no son la primera señal de hambre; busca que se lleve las manos a la boca o busque el pecho.'
    });

    return tips;
  }, [entries]);

  return (
    <div className="ai-container animate-fade-in">
      <h2 className="view-title">Consejos de la IA</h2>
      <p className="subtitle">Análisis basado en los últimos datos de Ignacio y evidencia pediátrica.</p>

      <div className="tips-list">
        {advice.map((tip, idx) => (
          <div key={idx} className={`glass tip-card animate-slide-up tip-${tip.type}`} style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="tip-icon">
              {tip.icon}
            </div>
            <div className="tip-content">
              <h3 className="tip-title">{tip.title}</h3>
              <p className="tip-text">{tip.text}</p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .ai-container {
          padding: 1.5rem;
          height: 100%;
          overflow-y: auto;
        }
        .view-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 0.2rem;
        }
        .subtitle {
          color: var(--text-light);
          font-size: 0.95rem;
          margin-bottom: 2rem;
          line-height: 1.4;
        }
        .tips-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .tip-card {
          display: flex;
          padding: 1.25rem;
          gap: 1rem;
          align-items: flex-start;
          border-left: 5px solid transparent;
        }
        .tip-warning { border-left-color: #DB4437; }
        .tip-info { border-left-color: #4285F4; }
        .tip-good { border-left-color: #0F9D58; }
        .tip-ai { border-left-color: #F4B400; background: white; }
        
        .tip-icon {
          background: rgba(255, 255, 255, 0.6);
          padding: 0.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        }
        .tip-content {
          flex: 1;
        }
        .tip-title {
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 0.25rem;
          font-size: 1.05rem;
        }
        .tip-text {
          font-size: 0.9rem;
          color: var(--text-light);
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
