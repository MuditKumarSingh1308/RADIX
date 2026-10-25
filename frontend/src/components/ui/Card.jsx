export default function Card({
  title,
  subtitle,
  icon: Icon,
  badge,
  actions,
  children,
  className = '',
  interactive = false,
  onClick,
  style = {},
}) {
  return (
    <div
      className={`radix-card ${interactive ? 'radix-card-interactive' : ''} ${className}`}
      onClick={onClick}
      style={style}
    >
      {(title || Icon || badge || actions) && (
        <div className="card-header">
          <div>
            <div className="card-title">
              {Icon && <Icon size={18} style={{ color: 'var(--accent-cyan)' }} />}
              <span>{title}</span>
              {badge && <span className="card-badge">{badge}</span>}
            </div>
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
