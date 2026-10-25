import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
    } catch (err) {
      console.error('Password update error:', err);
      setError(err.message || 'Failed to update password. Your reset session may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-navy)',
        padding: '24px 16px',
        position: 'relative',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #45D6FF 0%, #8B7CFF 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px rgba(69, 214, 255, 0.35)',
              marginBottom: '14px',
            }}
          >
            <Zap size={24} color="#0B1020" style={{ fill: '#0B1020' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            RADIX <span style={{ color: 'var(--accent-cyan)' }}>SkillSync</span>
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Choose a new secure password
          </p>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px 28px',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {success ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'rgba(53, 212, 154, 0.12)',
                  border: '1px solid rgba(53, 212, 154, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <CheckCircle2 size={28} color="var(--success)" />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                Password Updated
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                Your password has been changed successfully. Redirecting you to your dashboard...
              </p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Set New Password
                </h2>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  Please enter a new password for your RADIX SkillSync account.
                </p>
              </div>

              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--error-subtle)',
                    border: '1px solid rgba(255, 107, 129, 0.3)',
                    color: 'var(--error)',
                    fontSize: '12.5px',
                    marginBottom: '18px',
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="reset-new-password">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={16}
                      color="var(--text-muted)"
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <input
                      id="reset-new-password"
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      style={{ paddingLeft: '38px', paddingRight: '38px' }}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="reset-confirm-password">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={16}
                      color="var(--text-muted)"
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <input
                      id="reset-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '11px', marginTop: '6px' }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={15} className="spin-animation" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <>
                      <span>Update Password</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
