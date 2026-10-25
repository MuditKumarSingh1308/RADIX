import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Zap } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-navy)',
          color: 'var(--text-primary)',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #45D6FF 0%, #8B7CFF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(69, 214, 255, 0.4)',
          }}
        >
          <Zap size={24} color="#0B1020" style={{ fill: '#0B1020' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              border: '2px solid var(--accent-cyan)',
              borderTopColor: 'transparent',
            }}
            className="spin-animation"
          />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Verifying RADIX authentication session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login preserving original intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
