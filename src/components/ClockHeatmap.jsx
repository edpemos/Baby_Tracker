import React from 'react';

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const describeArc = (x, y, innerRadius, outerRadius, startAngle, endAngle) => {
  // SVG arcs for a ring slice
  const startOut = polarToCartesian(x, y, outerRadius, endAngle);
  const endOut = polarToCartesian(x, y, outerRadius, startAngle);
  const startIn = polarToCartesian(x, y, innerRadius, endAngle);
  const endIn = polarToCartesian(x, y, innerRadius, startAngle);

  const arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", startOut.x, startOut.y,
    "A", outerRadius, outerRadius, 0, arcSweep, 0, endOut.x, endOut.y,
    "L", endIn.x, endIn.y,
    "A", innerRadius, innerRadius, 0, arcSweep, 1, startIn.x, startIn.y,
    "Z"
  ].join(" ");
};

export default function ClockHeatmap({ title, icon, data = [] }) {
  // data is an array of 24 integers
  const safeData = data.length === 24 ? data : new Array(24).fill(0);
  const maxVal = Math.max(...safeData, 0);

  const getColor = (val) => {
    if (val === 0) return 'rgba(0,0,0,0.06)';
    
    // Si hay valor, lo mapeamos a un espectro de calor
    // maxVal -> intensidad 1 (Rojo HSL=0), minVal>0 -> intensidad pequeña (Azul HSL=220)
    // Para que no se quede todo del mismo color si los números son pequeños, normalizamos:
    let intensity = maxVal === 0 ? 0 : val / maxVal;
    
    // Aumentamos un poquito la intensidad base para que el valor 1 no parezca demasiado frío si el máximo es muy alto
    intensity = Math.max(0.2, intensity);

    const hue = 240 - (intensity * 240); // 240 = Azul, 0 = Rojo
    return `hsl(${hue}, 85%, 55%)`;
  };

  const getOpacity = (val) => {
    if (val === 0) return 0.5;
    return 1;
  };

  // Dimensiones del SVG
  const cx = 100;
  const cy = 100;
  const outerR1 = 95;  // AM exterior
  const innerR1 = 65;
  const outerR2 = 61;  // PM interior
  const innerR2 = 31;

  // Calculamos los 24 arcos
  const arcs = [];
  for (let h = 0; h < 24; h++) {
    const isAM = h < 12;
    const hourPos = h % 12; // 0 a 11
    
    const startAngle = hourPos * 30; // 0=12 arriba. 1 = 30 grados...
    const endAngle = (hourPos + 1) * 30;
    
    const count = safeData[h] || 0;
    
    arcs.push({
      hour: h,
      pathCode: describeArc(
        cx, cy, 
        isAM ? innerR1 : innerR2, 
        isAM ? outerR1 : outerR2, 
        startAngle, 
        endAngle
      ),
      color: getColor(count),
      opacity: getOpacity(count),
      count,
      isAM
    });
  }

  // Marcas de las horas clave en el exterior
  const labels = [
    { label: '12', a: 0 },
    { label: '3', a: 90 },
    { label: '6', a: 180 },
    { label: '9', a: 270 }
  ].map(m => {
    const pos = polarToCartesian(cx, cy, outerR1 + 14, m.a);
    return { ...m, ...pos };
  });

  return (
    <div className="clock-heatmap-card glass animate-slide-up">
      <div className="ch-header">
        <div className="ch-icon">{icon}</div>
        <h4 className="ch-title">{title}</h4>
      </div>
      
      <div className="ch-svg-container">
        <svg viewBox="0 0 230 230" className="ch-svg">
           {/* Trasladamos 15px para dar espacio a los labels de las horas */}
          <g transform="translate(15, 15)">
            {/* Anillos base traseros para contexto */}
            <circle cx={cx} cy={cy} r={(outerR1+innerR1)/2} stroke="rgba(0,0,0,0.04)" strokeWidth={30} fill="none" />
            <circle cx={cx} cy={cy} r={(outerR2+innerR2)/2} stroke="rgba(0,0,0,0.04)" strokeWidth={30} fill="none" />
            
            {/* Separadores sutiles */}
            <line x1={cx} y1={cy-outerR1} x2={cx} y2={cy+outerR1} stroke="rgba(255,255,255,0.5)" strokeWidth={1}/>
            <line x1={cx-outerR1} y1={cy} x2={cx+outerR1} y2={cy} stroke="rgba(255,255,255,0.5)" strokeWidth={1}/>

            {arcs.map(arc => (
              <path 
                key={arc.hour}
                d={arc.pathCode}
                fill={arc.color}
                opacity={arc.opacity}
                stroke="#ffffff"
                strokeWidth="1.5"
                style={{ transition: 'all 0.3s ease' }}
              >
                <title>{arc.count} {title.toLowerCase()} a las {arc.hour}:00 a {arc.hour}:59</title>
              </path>
            ))}

            {/* Círculo central decorativo vacío */}
            <circle cx={cx} cy={cy} r={innerR2 - 2} fill="#ffffff" />
            
            {/* Etiquetas de hora (12, 3, 6, 9) */}
            {labels.map(l => (
              <text 
                key={l.label} 
                x={l.x} 
                y={l.y} 
                textAnchor="middle" 
                dominantBaseline="middle"
                fontSize="12px"
                fontWeight="700"
                fill="var(--text-light)"
              >
                {l.label}
              </text>
            ))}
          </g>
        </svg>
      </div>

      <div className="ch-legend">
        <span className="chl-am">AM exterior</span>
        <span className="chl-pm">PM interior</span>
      </div>

      <style>{`
        .clock-heatmap-card {
          flex: 1;
          min-width: 250px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.25rem;
          margin-bottom: 1rem;
        }
        .ch-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          width: 100%;
        }
        .ch-icon {
          color: var(--primary);
          background: rgba(66, 133, 244, 0.1);
          padding: 6px;
          border-radius: 8px;
          display: flex;
        }
        .ch-title {
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--text-dark);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .ch-svg-container {
          width: 230px;
          height: 230px;
          flex-shrink: 0;
          filter: drop-shadow(0 8px 16px rgba(0,0,0,0.05));
        }
        .ch-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }
        .ch-legend {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
          font-size: 0.8rem;
          color: var(--text-light);
          font-weight: 600;
        }
        .chl-am::before, .chl-pm::before {
          content: '';
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 4px;
          background: rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
