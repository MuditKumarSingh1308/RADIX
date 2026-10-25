import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Mail,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function ForgotPasswordPage() {
  const { resetPassword, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }

    if (!isConfigured) {
      setError('Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      console.error('Password reset request error:', err);
      setError(err.message || 'Failed to send reset link. Please check your email.');
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
            Reset your platform password
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
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
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
                Reset Email Dispatched
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                If an account exists for <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>, you will receive a secure password reset link. Please check your inbox and spam folder.
              </p>
              <Link
                to="/login"
                className="btn btn-secondary"
                style={{ width: '100%', padding: '10px' }}
              >
                <ArrowLeft size={15} />
                <span>Return to Sign In</span>
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Forgot your password?
                </h2>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  Enter your email address and we'll send you instructions to safely reset your password.
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
                  <label className="form-label" htmlFor="forgot-email">Account Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail
                      size={16}
                      color="var(--text-muted)"
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <input
                      id="forgot-email"
                      type="email"
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      placeholder="name@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '11px' }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={15} className="spin-animation" />
                      <span>Sending reset link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Instructions</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              <div
                style={{
                  marginTop: '22px',
                  paddingTop: '18px',
                  borderTop: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                  fontSize: '12.5px',
                }}
              >
                <Link
                  to="/login"
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
