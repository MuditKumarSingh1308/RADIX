import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-navy)',
          color: 'var(--text-muted)',
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: '2px solid var(--accent-cyan)',
            borderTopColor: 'transparent',
          }}
          className="spin-animation"
        />
      </div>
    );
  }

  if (isAuthenticated) {
    // Already authenticated, redirect to platform dashboard
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}
