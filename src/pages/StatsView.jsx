import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, AreaChart, Area } from 'recharts';
import { subDays, isSameDay, format, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

export default function StatsView() {
  const { entries } = useData();

  const analytics = useMemo(() => {
    // Generar un array de los últimos 7 días (de -6 a hoy)
    const today = startOfDay(new Date());
    const last7DaysData = [];
    
    let totalFood7d = 0;
    let totalDiapers7d = 0;

    for (let i = 6; i >= 0; i--) {
      const currentDay = subDays(today, i);
      
      const dayEntries = entries.filter(e => isSameDay(new Date(e.date), currentDay));
      
      const breast = dayEntries.filter(e => e.type === 'breast').length;
      const bottle = dayEntries.filter(e => e.type === 'bottle').length;
      const pee = dayEntries.filter(e => e.type === 'pee').length;
      const poop = dayEntries.filter(e => e.type === 'poop').length;

      const food = breast + bottle;
      const diapers = pee + poop;

      totalFood7d += food;
      totalDiapers7d += diapers;

      last7DaysData.push({
        name: format(currentDay, 'E', { locale: es }).toUpperCase(), // Lun, Mar...
        dateStr: format(currentDay, 'dd/MM'),
        food,
        breast,
        bottle,
        pee,
        poop,
        diapers
      });
    }

    const avgFood = (totalFood7d / 7).toFixed(1);
    const avgDiapers = (totalDiapers7d / 7).toFixed(1);

    return { last7DaysData, avgFood, avgDiapers };
  }, [entries]);

  return (
    <div className="stats-container animate-fade-in">
      <h2 className="view-title">Análisis de los últimos 7 días</h2>
      
      <div className="kpi-grid">
        <div className="glass kpi-card">
          <div className="kpi-value">{analytics.avgFood}</div>
          <div className="kpi-label">Tomas/día</div>
        </div>
        <div className="glass kpi-card">
          <div className="kpi-value">{analytics.avgDiapers}</div>
          <div className="kpi-label">Pañales/día</div>
        </div>
      </div>

      <div className="stats-content mt-4">
        
        {/* Gráfico 1: Tendencia de Alimentación (Tomas por día) */}
        <div className="glass stat-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="card-title">Frecuencia de Tomas</h3>
          <p className="card-subtitle">Verifica que su apetito es constante</p>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={analytics.last7DaysData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4285F4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4285F4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-light)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-light)' }} />
                <Tooltip 
                  labelFormatter={(v, payload) => payload?.[0]?.payload?.dateStr || v}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="food" name="Total Tomas" stroke="#4285F4" strokeWidth={3} fillOpacity={1} fill="url(#colorFood)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Pañales Sucios por día (Stacked Bar para Pipí y Caca) */}
        <div className="glass stat-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="card-title">Historial de Pañales</h3>
          <p className="card-subtitle">Clave para saber si está bien hidratado</p>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.last7DaysData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-light)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-light)' }} />
                <Tooltip 
                  labelFormatter={(v, payload) => payload?.[0]?.payload?.dateStr || v}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{fill: 'rgba(0,0,0,0.03)'}}
                />
                <Bar dataKey="pee" name="Pipí" stackId="a" fill="#F4B400" radius={[0, 0, 4, 4]} barSize={20} />
                <Bar dataKey="poop" name="Caca" stackId="a" fill="#795548" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
        .kpi-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .kpi-card {
          padding: 1rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .kpi-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--primary);
          line-height: 1;
          margin-bottom: 0.2rem;
        }
        .kpi-label {
          font-size: 0.85rem;
          color: var(--text-light);
          font-weight: 500;
        }
        .stats-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .mt-4 { margin-top: 1.5rem; }
        .stat-card {
          padding: 1.5rem 1rem 1rem 0;
        }
        .card-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.2rem;
          color: var(--text-dark);
          padding-left: 1.5rem;
        }
        .card-subtitle {
          font-size: 0.85rem;
          color: var(--text-light);
          padding-left: 1.5rem;
          margin-bottom: 1.2rem;
        }
        .chart-wrapper {
          position: relative;
        }
      `}</style>
    </div>
  );
}
