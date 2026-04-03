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

    const pediatricTips = [
      { t: "Lactancia a demanda", d: "La lactancia materna no entiende de relojes. Ofrece el pecho si Ignacio cabecea, se lleva las manos a la boca o saca la lengua. El llanto es su última señal de aviso." },
      { t: "El tamaño de su estómago", d: "Al nacer su estómago era como una cereza, y ahora poco a poco crece. Por eso comen poquito pero de forma constante. No te preocupes si parece que siempre tiene hambre." },
      { t: "Seguridad al dormir", d: "Recuerda la regla de oro: siempre boca arriba, sobre un colchón firme, sin almohadas, peluches o mantas sueltas en la cuna (SMSL)." },
      { t: "Estimulación visual", d: "A esta edad los bebés no ven muy lejos. Ponte a unos 25cm de su cara (donde el pecho a tus ojos), mírale directamente y háblale suave. Es lo más estimulante para su cerebro." },
      { t: "Estirones de crecimiento", d: "Existen crisis o 'brotes de crecimiento' (usualmente a los 15-20 días, al mes y medio o a los 3 meses). De repente piden el triple para aumentar tu producción. ¡Mucha paciencia!" },
      { t: "Colores del pañal", d: "Es completamente normal que la caca pase de tonos mostaza a verde parduzco, e incluso cambie su consistencia según lo que tú hayas comido, o alternando pecho/biberón." },
      { t: "Tummy Time", d: "Cuando esté bien descansado y despierto, ponlo un par de minutos boca abajo sobre tu pecho o en una mantita. Hará fuerza levantando la cabeza para potenciar sus músculos cervicales." },
      { t: "Eructos y reflujo", d: "Favorece hacerle eructar llevándotelo al hombro firmemente en mitad de la toma y al terminar. Si a los 5 minutos dando palmaditas no hay eructo, no te obsesiones, a veces no tragan aire." },
      { t: "La hora de las brujas", d: "Si por la tarde noche ves que llora más de lo normal sin motivo aparente (el síndrome del atardecer), bájale las luces, pon ruido blanco (como una campana extractora o agua) y acúnale con contacto piel con piel." },
      { t: "Uñas de recién nacido", d: "Crecen a la velocidad de la luz y están afiladísimas. Conviene limarlas de forma recta usando una lima suave de cristal cuando esté profundamente dormido." }
    ];

    // Pseudo-aleatoriedad basada en el día actual (cambia a medianoche)
    const dayIndex = Math.floor(Date.now() / 86400000);
    const tip1 = pediatricTips[dayIndex % pediatricTips.length];
    const tip2 = pediatricTips[(dayIndex * 3 + 7) % pediatricTips.length];

    tips.push({
      type: 'ai',
      icon: <Sparkles color="#F4B400" />,
      title: tip1.t,
      text: tip1.d
    });
    
    // Si son diferentes, metemos dos tips diarios en vez de uno
    if (tip1.t !== tip2.t) {
      tips.push({
        type: 'ai',
        icon: <Sparkles color="#F4B400" />,
        title: tip2.t,
        text: tip2.d
      });
    }

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
