import { RADIX_CATEGORIES } from '../../lib/radixData';

export default function CategoryBar({
  categoryCode,
  categoryName,
  candidateLevel = 5,
  requiredLevel = null,
  importance = null,
  description = '',
  compact = false,
}) {
  const meta = RADIX_CATEGORIES[categoryCode] || {
    name: categoryName || categoryCode,
    color: '#45D6FF',
    bgColor: 'rgba(69, 214, 255, 0.12)',
  };

  const displayName = categoryName || meta.name;
  const isGap = requiredLevel !== null && candidateLevel < requiredLevel;
  const isExceed = requiredLevel !== null && candidateLevel > requiredLevel;

  return (
    <div style={{ marginBottom: compact ? '10px' : '16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '5px',
          fontSize: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: '700',
              padding: '2px 6px',
              borderRadius: '4px',
              background: meta.bgColor,
              color: meta.color,
              border: `1px solid ${meta.color}40`,
            }}
          >
            {categoryCode}
          </span>
          <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
            {displayName}
          </span>
          {importance && (
            <span
              style={{
                fontSize: '9px',
                textTransform: 'uppercase',
                padding: '1px 5px',
                borderRadius: '3px',
                background:
                  importance === 'critical'
                    ? 'rgba(255, 107, 129, 0.15)'
                    : importance === 'high'
                    ? 'rgba(244, 190, 94, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                color:
                  importance === 'critical'
                    ? '#FF6B81'
                    : importance === 'high'
                    ? '#F4BE5E'
                    : 'var(--text-muted)',
              }}
            >
              {importance}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: meta.color, fontWeight: '600' }}>
            Lvl {candidateLevel}/10
          </span>
          {requiredLevel !== null && (
            <>
              <span style={{ color: 'var(--text-subtle)' }}>vs</span>
              <span style={{ color: '#8B7CFF', fontWeight: '600' }}>
                Lvl {requiredLevel}
              </span>
              {isGap ? (
                <span
                  style={{
                    color: '#FF6B81',
                    background: 'rgba(255, 107, 129, 0.12)',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    fontSize: '10px',
                  }}
                >
                  -{requiredLevel - candidateLevel} Gap
                </span>
              ) : isExceed ? (
                <span
                  style={{
                    color: '#35D49A',
                    background: 'rgba(53, 212, 154, 0.12)',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    fontSize: '10px',
                  }}
                >
                  +{candidateLevel - requiredLevel} Ahead
                </span>
              ) : (
                <span
                  style={{
                    color: '#35D49A',
                    background: 'rgba(53, 212, 154, 0.12)',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    fontSize: '10px',
                  }}
                >
                  Meets
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Progress track */}
      <div
        style={{
          position: 'relative',
          height: compact ? '6px' : '8px',
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${(candidateLevel / 10) * 100}%`,
            background: isGap
              ? 'linear-gradient(90deg, #F4BE5E 0%, #FF6B81 100%)'
              : `linear-gradient(90deg, ${meta.color}99 0%, ${meta.color} 100%)`,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {requiredLevel !== null && (
          <div
            title={`Required: Level ${requiredLevel}`}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${(requiredLevel / 10) * 100}%`,
              width: '2px',
              background: '#8B7CFF',
              boxShadow: '0 0 6px #8B7CFF',
              zIndex: 2,
            }}
          />
        )}
      </div>

      {description && !compact && (
        <p style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '4px' }}>
          {description}
        </p>
      )}
    </div>
  );
}
