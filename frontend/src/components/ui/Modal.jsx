import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 600,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <h3 style={{ fontSize: '17px', color: 'var(--text-primary)' }}>{title}</h3>
            {subtitle && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ borderRadius: 'var(--radius-sm)', padding: '6px' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto' }}>
          {children}
        </div>

        {footer && (
          <div
            style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
