import React, { useState } from 'react';
import { format, startOfMonth, startOfWeek, endOfMonth, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useData } from '../context/DataContext';
import { Droplet, Milk, Baby, X } from 'lucide-react';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryTime, setEntryTime] = useState('');
  const { entries, addEntry } = useData();

  // Helper arrays for calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  const openDrawer = (d) => {
    setSelectedDate(d);
    // Auto-set the time input. If it's today, set current time, otherwise default 12:00
    if (isSameDay(d, new Date())) {
      setEntryTime(format(new Date(), 'HH:mm'));
    } else {
      setEntryTime('12:00');
    }
    setIsModalOpen(true);
  };

  const closeDrawer = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedDate(null), 300);
  };

  const handleAdd = (type) => {
    if (!selectedDate) return;
    
    // Replace the time of selectedDate with the chosen time
    const [hours, minutes] = entryTime.split(':');
    const finalDate = new Date(selectedDate);
    finalDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    addEntry({
      type,
      date: finalDate.toISOString()
    });
    // Optional: closeDrawer() here if we want to dismiss it immediately
  };

  const getEntriesForSelectedDay = () => {
    if (!selectedDate) return [];
    return entries.filter(e => isSameDay(new Date(e.date), selectedDate))
      .sort((a,b) => new Date(b.date) - new Date(a.date));
  };

  const dayEntriesList = getEntriesForSelectedDay();

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      const dayEntries = entries.filter(e => isSameDay(new Date(e.date), cloneDay));
      const hasBreast = dayEntries.some(e => e.type === 'breast');
      const hasBottle = dayEntries.some(e => e.type === 'bottle');
      const hasPee = dayEntries.some(e => e.type === 'pee');
      const hasPoop = dayEntries.some(e => e.type === 'poop');

      days.push(
        <div
          className={`calendar-day ${!isSameMonth(day, monthStart) ? "disabled" : ""} ${isSameDay(day, new Date()) ? "today" : ""}`}
          key={day}
          onClick={() => openDrawer(cloneDay)}
        >
          <span className="day-number">{formattedDate}</span>
          <div className="day-indicators">
            {hasBreast && <div className="indicator dot-breast"></div>}
            {hasBottle && <div className="indicator dot-bottle"></div>}
            {hasPee && <div className="indicator dot-pee"></div>}
            {hasPoop && <div className="indicator dot-poop"></div>}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="calendar-row" key={day}>
        {days}
      </div>
    );
    days = [];
  }

  const renderIconForType = (type) => {
    switch(type) {
      case 'breast': return <Milk size={18} color="var(--color-breast)"/>;
      case 'bottle': return <Milk size={18} fill="currentColor" color="var(--color-bottle)"/>;
      case 'pee': return <Droplet size={18} color="var(--color-pee)"/>;
      case 'poop': return <Baby size={18} color="var(--color-poop)"/>;
      default: return null;
    }
  };

  const typeLabels = { breast: 'Pecho', bottle: 'Biberón', pee: 'Pipí', poop: 'Caca' };

  return (
    <div className="calendar-container animate-fade-in">
      <div className="calendar-header glass">
        <h2 className="month-title">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h2>
      </div>

      <div className="calendar-grid glass">
        <div className="calendar-weekdays">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
            <div key={d} className="weekday">{d}</div>
          ))}
        </div>
        {rows}
      </div>

      {isModalOpen && (
        <div className="drawer-overlay" onClick={closeDrawer}>
          <div className="drawer-content animate-slide-up glass" onClick={e => e.stopPropagation()}>
            <div className="drawer-handle"></div>
            
            <div className="drawer-header-row">
              <h3 className="drawer-title" style={{ margin: 0 }}>
                {format(selectedDate, "d MMMM", { locale: es })}
              </h3>
              <input 
                type="time" 
                value={entryTime}
                onChange={(e) => setEntryTime(e.target.value)}
                className="time-picker"
              />
            </div>
            
            <div className="actions-grid">
              <button className="action-btn breast-btn" onClick={() => handleAdd('breast')}>
                <Milk size={32} />
                <span>Pecho</span>
              </button>
              <button className="action-btn bottle-btn" onClick={() => handleAdd('bottle')}>
                <Milk size={32} fill="currentColor" />
                <span>Biberón</span>
              </button>
              <button className="action-btn pee-btn" onClick={() => handleAdd('pee')}>
                <Droplet size={32} />
                <span>Pipí</span>
              </button>
              <button className="action-btn poop-btn" onClick={() => handleAdd('poop')}>
                <Baby size={32} />
                <span>Caca</span>
              </button>
            </div>

            {dayEntriesList.length > 0 && (
              <div className="day-entries-list">
                <h4 className="list-title">Registros del día</h4>
                <div className="list-items">
                  {dayEntriesList.map(entry => (
                    <div key={entry.id} className="entry-item">
                      <div className="entry-time">{format(new Date(entry.date), "HH:mm")}</div>
                      <div className="entry-icon">{renderIconForType(entry.type)}</div>
                      <div className="entry-label">{typeLabels[entry.type]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <button className="close-btn" onClick={closeDrawer}>
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .calendar-container {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          height: 100%;
        }
        .calendar-header {
          padding: 1rem;
          text-align: center;
          text-transform: capitalize;
        }
        .month-title {
          font-weight: 700;
          font-size: 1.5rem;
        }
        .calendar-grid {
          padding: 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .calendar-weekdays {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .weekday {
          width: calc(100% / 7);
          text-align: center;
          font-weight: 600;
          color: var(--text-light);
          font-size: 0.9rem;
        }
        .calendar-row {
          display: flex;
          justify-content: space-between;
          flex: 1;
        }
        .calendar-day {
          width: calc(100% / 7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 0.5rem 0;
          cursor: pointer;
          border-radius: 12px;
          transition: background 0.2s;
          margin: 2px;
        }
        .calendar-day.disabled { opacity: 0.3; }
        .calendar-day.today {
          background: rgba(66, 133, 244, 0.1);
          border: 1px solid var(--primary);
        }
        .calendar-day:active { background: rgba(0,0,0,0.05); }
        .day-number {
          font-weight: 500;
          font-size: 1.1rem;
        }
        .day-indicators {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 3px;
          margin-top: 4px;
          height: 14px;
          padding: 0 4px;
        }
        .indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .dot-breast { background: var(--color-breast); }
        .dot-bottle { background: var(--color-bottle); }
        .dot-pee { background: var(--color-pee); }
        .dot-poop { background: var(--color-poop); }

        .drawer-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 100;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          backdrop-filter: blur(2px);
        }
        .drawer-content {
          background: var(--bg-color);
          border-radius: 30px 30px 0 0;
          padding: 1.5rem 1.5rem 2rem 1.5rem;
          position: relative;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
        }
        .drawer-handle {
          width: 40px;
          height: 5px;
          background: rgba(0,0,0,0.1);
          border-radius: 3px;
          margin: 0 auto 1.5rem auto;
          flex-shrink: 0;
        }
        .drawer-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding: 0 0.5rem;
          flex-shrink: 0;
        }
        .drawer-title {
          color: var(--text-dark);
          font-size: 1.2rem;
          font-weight: 600;
        }
        .time-picker {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid var(--glass-border);
          background: white;
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--text-dark);
          outline: none;
        }
        .actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-shrink: 0;
        }
        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          border-radius: 16px;
          border: 1px solid var(--glass-border);
          gap: 0.5rem;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          background: white;
          transition: transform 0.1s, box-shadow 0.2s;
        }
        .action-btn:active { transform: scale(0.96); }
        .breast-btn { color: var(--color-breast); }
        .bottle-btn { color: var(--color-bottle); }
        .pee-btn { color: var(--color-pee); }
        .poop-btn { color: var(--color-poop); }
        
        .day-entries-list {
          flex: 1;
          overflow-y: auto;
          border-top: 1px solid var(--glass-border);
          padding-top: 1.5rem;
        }
        .list-title {
          font-size: 1rem;
          color: var(--text-light);
          margin-bottom: 1rem;
        }
        .list-items {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .entry-item {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          background: white;
          border-radius: 12px;
          border: 1px solid var(--glass-border);
          gap: 1rem;
        }
        .entry-time {
          font-weight: 600;
          color: var(--text-dark);
          font-size: 0.95rem;
        }
        .entry-icon {
          display: flex;
        }
        .entry-label {
          font-weight: 500;
          color: var(--text-dark);
          font-size: 0.95rem;
        }
        
        .close-btn {
          position: absolute;
          top: 1rem;
          right: 1.5rem;
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
