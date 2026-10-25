export default function ScoreRing({
  score = 0,
  size = 120,
  strokeWidth = 10,
  sublabel = '/ 100',
  color = '#45D6FF',
  gradientId = 'score-grad-cyan',
  showGlow = true
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={size} height={size} className="score-ring-svg">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#45D6FF" />
            <stop offset="100%" stopColor={color || '#8B7CFF'} />
          </linearGradient>
          {showGlow && (
            <filter id={`glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          )}
        </defs>

        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          className="score-ring-circle"
          filter={showGlow ? `url(#glow-${gradientId})` : undefined}
        />
      </svg>

      {/* Center Label */}
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: size > 130 ? '34px' : size > 90 ? '24px' : '18px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            lineHeight: 1,
            letterSpacing: '-0.03em',
          }}
        >
          {score}
        </span>
        {sublabel && (
          <span
            style={{
              fontSize: size > 100 ? '11px' : '9px',
              color: 'var(--text-muted)',
              marginTop: '2px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
