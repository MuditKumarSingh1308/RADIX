import { useState } from 'react';
import { RADIX_CATEGORIES } from '../../lib/radixData';

const ORDERED_KEYS = [
  'COD', 'DSA', 'OOD', 'APTI', 'COMM', 'AI',
  'CLOUD', 'SQL', 'SWE', 'SYSD', 'NETW', 'OS'
];

export default function RadarChart({
  candidateScores = {},
  benchmarkScores = null,
  size = 360,
  interactive = true,
  onCategorySelect = null,
}) {
  const [hoveredKey, setHoveredKey] = useState(null);

  const center = size / 2;
  const radius = (size / 2) - 45;
  const total = ORDERED_KEYS.length;

  const getCoordinates = (index, value, maxVal = 10) => {
    const angle = (Math.PI * 2 / total) * index - (Math.PI / 2);
    const r = (Math.min(10, Math.max(0, value)) / maxVal) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  const rings = [2, 4, 6, 8, 10];
  const ringPolygons = rings.map((level) => {
    const points = ORDERED_KEYS.map((_, i) => {
      const { x, y } = getCoordinates(i, level, 10);
      return `${x},${y}`;
    }).join(' ');
    return { level, points };
  });

  const candidatePoints = ORDERED_KEYS.map((key, i) => {
    const val = candidateScores[key] || 0;
    const { x, y } = getCoordinates(i, val, 10);
    return `${x},${y}`;
  }).join(' ');

  let benchmarkPoints = null;
  if (benchmarkScores) {
    benchmarkPoints = ORDERED_KEYS.map((key, i) => {
      const val = benchmarkScores[key] || 0;
      const { x, y } = getCoordinates(i, val, 10);
      return `${x},${y}`;
    }).join(' ');
  }

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="radar-bg-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(69, 214, 255, 0.08)" />
            <stop offset="100%" stopColor="rgba(11, 16, 32, 0)" />
          </radialGradient>
          <linearGradient id="cand-poly-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(69, 214, 255, 0.45)" />
            <stop offset="100%" stopColor="rgba(139, 124, 255, 0.3)" />
          </linearGradient>
        </defs>

        <circle cx={center} cy={center} r={radius} fill="url(#radar-bg-glow)" />

        {ringPolygons.map(({ level, points }) => (
          <polygon
            key={`ring-${level}`}
            points={points}
            fill="none"
            stroke="rgba(255, 255, 255, 0.07)"
            strokeWidth={level === 10 ? '1.5' : '1'}
            strokeDasharray={level === 10 ? undefined : '2 3'}
          />
        ))}

        {ORDERED_KEYS.map((key, i) => {
          const { x, y } = getCoordinates(i, 10, 10);
          return (
            <line
              key={`spoke-${key}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
            />
          );
        })}

        {benchmarkPoints && (
          <polygon
            points={benchmarkPoints}
            fill="rgba(139, 124, 255, 0.12)"
            stroke="#8B7CFF"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.9"
          />
        )}

        <polygon
          points={candidatePoints}
          fill="url(#cand-poly-grad)"
          stroke="#45D6FF"
          strokeWidth="2.5"
          filter="drop-shadow(0 0 8px rgba(69, 214, 255, 0.35))"
        />

        {ORDERED_KEYS.map((key, i) => {
          const candVal = candidateScores[key] || 0;
          const { x: cx, y: cy } = getCoordinates(i, candVal, 10);
          const { x: lx, y: ly } = getCoordinates(i, 11.8, 10);
          const isHovered = hoveredKey === key;
          const cat = RADIX_CATEGORIES[key] || { name: key, color: '#45D6FF' };

          return (
            <g
              key={`label-group-${key}`}
              style={{ cursor: interactive ? 'pointer' : 'default' }}
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
              onClick={() => onCategorySelect && onCategorySelect(key)}
            >
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 6 : 4}
                fill={cat.color || '#45D6FF'}
                stroke="#0B1020"
                strokeWidth="2"
                style={{ transition: 'all 0.15s ease' }}
              />

              {benchmarkScores && benchmarkScores[key] !== undefined && (
                (() => {
                  const { x: bx, y: by } = getCoordinates(i, benchmarkScores[key], 10);
                  return (
                    <circle
                      cx={bx}
                      cy={by}
                      r="3.5"
                      fill="#8B7CFF"
                      stroke="#0B1020"
                      strokeWidth="1.5"
                    />
                  );
                })()
              )}

              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={isHovered ? '11px' : '9.5px'}
                fontWeight={isHovered ? '700' : '600'}
                fill={isHovered ? cat.color : 'var(--text-muted)'}
                fontFamily="var(--font-mono)"
                style={{ transition: 'all 0.15s ease' }}
              >
                {key} ({candVal})
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredKey && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            fontSize: '11px',
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-md)',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <strong style={{ color: RADIX_CATEGORIES[hoveredKey]?.color }}>
            {RADIX_CATEGORIES[hoveredKey]?.name} ({hoveredKey})
          </strong>: Level {candidateScores[hoveredKey] || 0}/10
          {benchmarkScores && benchmarkScores[hoveredKey] !== undefined && (
            <span style={{ color: '#8B7CFF', marginLeft: '6px' }}>
              · Required: {benchmarkScores[hoveredKey]}/10
            </span>
          )}
        </div>
      )}
    </div>
  );
}
