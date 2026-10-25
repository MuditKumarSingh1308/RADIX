import { useState } from 'react';
import { RADIX_CATEGORIES } from '../../lib/radixData';
import { X, Info } from 'lucide-react';

export default function SkillChip({
  skill,
  onRemove = null,
  showEvidence = true,
  editable = false,
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const cat = RADIX_CATEGORIES[skill.category_code] || RADIX_CATEGORIES['OTHER'];

  const confidenceColor =
    skill.confidence === 'high'
      ? '#35D49A'
      : skill.confidence === 'medium'
      ? '#45D6FF'
      : '#F4BE5E';

  return (
    <div
      className="skill-chip"
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--bg-surface-elevated)',
        border: `1px solid ${cat.borderColor || 'var(--border-subtle)'}`,
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        className="cat-code"
        style={{
          background: cat.bgColor,
          color: cat.color,
        }}
      >
        {skill.category_code}
      </span>

      <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
        {skill.skill_name}
      </span>

      {skill.confidence && (
        <span
          className="conf-dot"
          title={`Confidence: ${skill.confidence}`}
          style={{ background: confidenceColor }}
        />
      )}

      {editable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(skill);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            marginLeft: '2px',
          }}
          title="Remove skill"
        >
          <X size={13} />
        </button>
      )}

      {showEvidence && skill.evidence && showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bg-sidebar)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            boxShadow: 'var(--shadow-lg)',
            width: '260px',
            zIndex: 50,
            lineHeight: 1.4,
            pointerEvents: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px', color: cat.color, fontWeight: '600' }}>
            <Info size={11} />
            <span>{cat.name} ({skill.confidence ? `${skill.confidence} confidence` : ''})</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '10.5px' }}>
            "{skill.evidence}"
          </p>
        </div>
      )}
    </div>
  );
}
