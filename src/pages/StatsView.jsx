import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { startOfDay, subDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatsView() {
  const { entries } = useData();

  const analytics = useMemo(() => {
    const today = startOfDay(new Date());

    // Fechas para comparar Semana Actual (últimos 7 días) vs Semana Anterior (días -14 a -7)
    const w1Start = subDays(today, 6);
    const w1End = new Date(today.getTime() + 86399999);
    const w2Start = subDays(today, 13);
    const w2End = new Date(subDays(today, 7).getTime() + 86399999);

    const isW1 = (d) => d >= w1Start && d <= w1End;
    const isW2 = (d) => d >= w2Start && d <= w2End;

    // Métricas Semana 1 (Actual)
    let foodW1 = 0, diapersW1 = 0, breastW1 = 0, bottleW1 = 0;
    // Métricas Semana 2 (Anterior)
    let foodW2 = 0, diapersW2 = 0;

    const heatmapMatrix = Array.from({length: 7}).map((_, i) => {
      return { 
        dateObj: subDays(today, 6 - i), 
        name: format(subDays(today, 6 - i), 'E', { locale: es }).toUpperCase(),
        hours: new Array(24).fill(0) 
      };
    });

    entries.forEach(e => {
      const d = new Date(e.date);
      const isFood = e.type === 'breast' || e.type === 'bottle';
      const isDiaper = e.type === 'pee' || e.type === 'poop';

      if (isW1(d)) {
        if (isFood) {
          foodW1++;
          if (e.type === 'breast') breastW1++;
          if (e.type === 'bottle') bottleW1++;

          // Rellenar Heatmap
          const dayDiff = Math.floor((d.getTime() - w1Start.getTime()) / 86400000);
          if (dayDiff >= 0 && dayDiff < 7) {
            heatmapMatrix[dayDiff].hours[d.getHours()]++;
          }
        }
        if (isDiaper) diapersW1++;
      } else if (isW2(d)) {
        if (isFood) foodW2++;
        if (isDiaper) diapersW2++;
      }
    });

    // Porcentajes Pecho vs Biberón
    const breastPct = foodW1 === 0 ? 0 : Math.round((breastW1 / foodW1) * 100);
    const bottlePct = foodW1 === 0 ? 0 : Math.round((bottleW1 / foodW1) * 100);

    // Comparativas
    const foodDiff = foodW2 === 0 ? 100 : Math.round(((foodW1 - foodW2) / foodW2) * 100);
    const diapersDiff = diapersW2 === 0 ? 100 : Math.round(((diapersW1 - diapersW2) / diapersW2) * 100);

    return {
      foodW1, foodW2, foodDiff,
      diapersW1, diapersW2, diapersDiff,
      breastPct, bottlePct,
      heatmapMatrix
    };
  }, [entries]);

  const renderTrend = (value, unit) => {
    if (value > 0) {
      return <div className="trend positive"><TrendingUp size={16} /> +{value}% {unit}</div>;
    } else if (value < 0) {
      return <div className="trend negative"><TrendingDown size={16} /> {value}% {unit}</div>;
    }
    return <div className="trend neutral"><Minus size={16} /> Igual {unit}</div>;
  };

  return (
    <div className="stats-container animate-fade-in">
      <h2 className="view-title">Análisis Clínico</h2>

      <div className="stats-content">
        
        {/* 1. Comparativa Semanal */}
        <div className="glass stat-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="card-title">Tendencia Semanal</h3>
          <p className="card-subtitle">Comparativa vs. 7 días previos</p>
          
          <div className="trend-grid">
            <div className="trend-box">
              <span className="trend-label">Tomas (Alimentación)</span>
              {renderTrend(analytics.foodDiff, "tomas")}
              <span className="trend-subtext">{analytics.foodW1} esta sem. (antes {analytics.foodW2})</span>
            </div>
            <div className="trend-box">
              <span className="trend-label">Pañales</span>
              {renderTrend(analytics.diapersDiff, "pañales")}
              <span className="trend-subtext">{analytics.diapersW1} esta sem. (antes {analytics.diapersW2})</span>
            </div>
          </div>
        </div>

        {/* 2. Ratio Pecho vs Biberón */}
        <div className="glass stat-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="card-title">Distribución de Tetas vs Biberón</h3>
          <p className="card-subtitle">Últimos 7 días</p>
          
          <div className="ratio-container">
            <div className="ratio-bar">
              <div className="ratio-fill breast" style={{ width: `${analytics.breastPct}%` }}></div>
              <div className="ratio-fill bottle" style={{ width: `${analytics.bottlePct}%` }}></div>
            </div>
            <div className="ratio-labels">
              <div className="ratio-legend">
                <span className="dot" style={{background: '#F06292'}}></span>
                <strong>Pecho</strong> {analytics.breastPct}%
              </div>
              <div className="ratio-legend">
                <span className="dot" style={{background: '#4285F4'}}></span>
                <strong>Biberón</strong> {analytics.bottlePct}%
              </div>
            </div>
          </div>
        </div>

        {/* 3. Heatmap Horario */}
        <div className="glass stat-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="card-title">Mapa de Calor: Clústers de Tomas</h3>
          <p className="card-subtitle">Frecuencia por horas (00h - 23h)</p>
          
          <div className="heatmap-wrapper">
            <div className="heatmap-header">
              <div className="hm-label-placeholder"></div>
              {Array.from({length: 24}).map((_, i) => (
                // Solo pintamos números pares por espacio
                <div key={i} className="hm-col-label">{i % 2 === 0 ? i : ''}</div>
              ))}
            </div>
            
            {analytics.heatmapMatrix.map((day, dIdx) => (
              <div key={dIdx} className="heatmap-row">
                <div className="hm-row-label">{day.name}</div>
                {day.hours.map((count, hIdx) => {
                  let opacity = 0.05;
                  if (count === 1) opacity = 0.4;
                  if (count === 2) opacity = 0.7;
                  if (count > 2) opacity = 1;
                  
                  return (
                    <div 
                      key={hIdx} 
                      className="hm-cell"
                      style={{ background: count > 0 ? `rgba(66, 133, 244, ${opacity})` : 'rgba(0,0,0,0.03)' }}
                      title={`${count} tomas a las ${hIdx}:00 el ${day.name}`}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        .stats-container {
          padding: 1.5rem;
          height: 100%;
          overflow-y: auto;
        }
        .view-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 1.5rem;
        }
        .stats-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding-bottom: 2rem;
        }
        .stat-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }
        .card-title {
          font-size: 1.15rem;
          font-weight: 600;
          margin-bottom: 0.2rem;
          color: var(--text-dark);
        }
        .card-subtitle {
          font-size: 0.85rem;
          color: var(--text-light);
          margin-bottom: 1.2rem;
        }
        
        /* Trends */
        .trend-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .trend-box {
          background: rgba(255,255,255,0.6);
          padding: 1rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .trend-label { font-size: 0.85rem; font-weight: 600; color: var(--text-dark); }
        .trend-subtext { font-size: 0.75rem; color: var(--text-light); }
        .trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 1.1rem;
          font-weight: 700;
        }
        .trend.positive { color: #DB4437; } /* Aumento en tomas puede ser neutro pero lo marcamos rojo para destacar actividad */
        .trend.negative { color: #0F9D58; } 
        .trend.neutral { color: var(--text-light); }

        /* Ratio Bar */
        .ratio-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .ratio-bar {
          display: flex;
          height: 24px;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(0,0,0,0.05); /* Por si no hay datos */
        }
        .ratio-fill {
          height: 100%;
          transition: width 0.5s ease-out;
        }
        .ratio-fill.breast { background: #F06292; }
        .ratio-fill.bottle { background: #4285F4; }
        .ratio-labels {
          display: flex;
          justify-content: space-around;
        }
        .ratio-legend {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
          color: var(--text-dark);
        }
        .ratio-legend .dot {
          width: 10px; height: 10px; border-radius: 50%;
        }

        /* Heatmap */
        .heatmap-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-x: auto; /* Por si en móviles muy pequeños no cabe */
          padding-bottom: 0.5rem;
        }
        .heatmap-header {
          display: flex;
          gap: 2px;
          margin-bottom: 2px;
        }
        .hm-label-placeholder {
          width: 35px;
          flex-shrink: 0;
        }
        .hm-col-label {
          flex: 1;
          min-width: 8px; /* Para que cuadre con las celdas */
          font-size: 0.6rem;
          color: var(--text-light);
          text-align: center;
        }
        .heatmap-row {
          display: flex;
          gap: 2px;
          align-items: center;
        }
        .hm-row-label {
          width: 35px;
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--text-dark);
          flex-shrink: 0;
        }
        .hm-cell {
          flex: 1;
          height: 18px; /* Altura de la celda */
          border-radius: 2px;
          min-width: 8px;
        }
      `}</style>
    </div>
  );
}
