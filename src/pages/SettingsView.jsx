import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { format, addDays } from 'date-fns';
import { Settings as SettingsIcon, UploadCloud, CheckCircle } from 'lucide-react';

export default function SettingsView() {
  const { addEntry } = useData();
  const [logText, setLogText] = useState('');
  const [baseDate, setBaseDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [feedback, setFeedback] = useState(null);

  const importLogs = () => {
    if (!logText.trim()) return;

    const lines = logText.split('\n');
    const startObjDate = new Date(baseDate);
    
    let currentDayOffset = 0;
    let lastHour = -1;
    let importedCount = 0;

    lines.forEach(line => {
      // Intentar encontrar algo tipo "9:43", "01:30"
      const timeMatch = line.match(/(\d{1,2}):(\d{2})/);
      if (!timeMatch) return; // Ignorar líneas sin hora (ej: "Llamar a ro")

      const hour = parseInt(timeMatch[1], 10);
      const minute = parseInt(timeMatch[2], 10);

      // Lógica simple de salto de día (si pasamos de 23:00 a 01:00 es el día siguiente)
      if (lastHour !== -1 && hour < lastHour && (lastHour - hour > 10)) {
        currentDayOffset++;
      }
      lastHour = hour;

      // Construir la fecha exacta
      const dateToUse = addDays(startObjDate, currentDayOffset);
      dateToUse.setHours(hour, minute, 0, 0);
      const isoString = dateToUse.toISOString();

      const lower = line.toLowerCase();
      
      // Buscar tomas (teta, pecho, bibe, biberon)
      if (lower.includes('teta') || lower.includes('pecho')) {
        addEntry({ type: 'breast', date: isoString });
        importedCount++;
      }
      if (lower.includes('biber') || lower.includes('bibe')) {
        addEntry({ type: 'bottle', date: isoString });
        importedCount++;
      }
      
      // Buscar pañales (pañal pis, caca)
      // Ojo: una línea "teta (pañal caca y pis)" debe sumar pecho, pipi y caca a la misma hora
      if (lower.includes('pis')) {
        addEntry({ type: 'pee', date: isoString });
        importedCount++;
      }
      if (lower.includes('caca')) {
        addEntry({ type: 'poop', date: isoString });
        importedCount++;
      }
    });

    setFeedback(`¡Éxito! Se han detectado e importado ${importedCount} registros automáticamente.`);
    setLogText('');
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="settings-container animate-fade-in">
      <div className="home-header">
        <h2 className="view-title">Ajustes</h2>
        <p className="subtitle">Herramientas y configuración</p>
      </div>

      <div className="glass import-card">
        <div className="card-header">
          <UploadCloud className="header-icon" />
          <h3>Importar notas de texto</h3>
        </div>
        <p className="instruction">
          Pega el texto con las horas (ej: "14:15 teta y pis"). La IA leerá las horas y las meterá al sistema ignorando lo demás.
        </p>

        <div className="input-group">
          <label>Día inicial de la nota:</label>
          <input 
            type="date" 
            value={baseDate} 
            onChange={(e) => setBaseDate(e.target.value)}
            className="settings-input"
          />
        </div>

        <textarea 
          className="settings-textarea"
          placeholder="Ejemplo:&#10;9:43 teta 5/10 (pañal pis)&#10;11:30 biberón 30 mil 10/10&#10;Llamar a tati&#10;1:30 teta (pañal caca)"
          value={logText}
          onChange={(e) => setLogText(e.target.value)}
          rows={8}
        ></textarea>

        <button className="import-btn" onClick={importLogs}>
          Interpretar e Importar
        </button>

        {feedback && (
          <div className="feedback-toast animate-slide-up">
            <CheckCircle size={20} color="#0F9D58" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      <style>{`
        .settings-container {
          padding: 1.5rem;
          height: 100%;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .home-header { margin-bottom: 1.5rem; }
        .view-title { font-size: 1.8rem; font-weight: 700; color: var(--text-dark); margin-bottom: 0.2rem; }
        .subtitle { color: var(--text-light); font-size: 0.95rem; }
        
        .import-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-dark);
        }
        .header-icon { color: var(--primary); }
        .card-header h3 { font-weight: 600; font-size: 1.1rem; }
        .instruction { font-size: 0.85rem; color: var(--text-light); margin-bottom: 0.5rem; }
        
        .input-group { display: flex; flex-direction: column; gap: 0.25rem; }
        .input-group label { font-size: 0.85rem; font-weight: 500; color: var(--text-dark); }
        
        .settings-input, .settings-textarea {
          width: 100%;
          padding: 0.8rem;
          border-radius: 12px;
          border: 1px solid var(--glass-border);
          background: rgba(255, 255, 255, 0.7);
          color: var(--text-dark);
          font-family: inherit;
          font-size: 0.95rem;
          outline: none;
          transition: border 0.2s;
        }
        .settings-input:focus, .settings-textarea:focus { border-color: var(--primary); }
        .settings-textarea { resize: vertical; }
        
        .import-btn {
          width: 100%;
          padding: 0.8rem;
          background: var(--primary);
          color: white;
          font-weight: 600;
          font-size: 1rem;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .import-btn:active { transform: translateY(1px); }
        
        .feedback-toast {
          margin-top: 0.5rem;
          padding: 0.75rem;
          background: #E6F4EA;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #0F9D58;
          font-weight: 500;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
