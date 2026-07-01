import { useState } from 'react';
import { color, font } from '../lib/tokens.js';
import { signIn, signUp } from '../lib/auth.js';

// Shown only when Supabase is configured and there is no session. Email/password
// auth; toggles between sign in and create account. In local mode this screen is
// never rendered (the app skips auth entirely).
export default function Login() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
        setNotice('Account created. If email confirmation is on, check your inbox, then sign in.');
        setMode('signin');
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const input = { height: 42, padding: '0 13px', border: '1px solid #E1DDD5', borderRadius: 10, fontSize: 14, background: '#fff', width: '100%' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, color: color.ink }}>
      <div style={{ width: 'min(400px, 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 26, justifyContent: 'center' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: color.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: '#fff' }}>R</div>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>RealTrack</div>
            <div style={{ fontFamily: font.mono, fontSize: 10.5, color: color.faint, letterSpacing: '0.04em' }}>PROJECT WORKSPACE</div>
          </div>
        </div>

        <form onSubmit={submit} style={{ background: '#fff', border: `1px solid ${color.hairline}`, borderRadius: 16, padding: '26px 24px' }}>
          <h1 style={{ margin: '0 0 4px', fontSize: 21, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </h1>
          <div style={{ fontSize: 13.5, color: color.muted, marginBottom: 20 }}>
            {mode === 'signin' ? 'Access your private projects.' : 'Your projects are private to your account.'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoFocus style={input} />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" minLength={6} style={input} />
          </div>

          {error && <div style={{ marginTop: 14, fontSize: 13, color: color.red }}>{error}</div>}
          {notice && <div style={{ marginTop: 14, fontSize: 13, color: color.greenInk }}>{notice}</div>}

          <button type="submit" disabled={busy} className="rt-btn-primary" style={{ marginTop: 18, width: '100%', height: 44, background: color.accent, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>

          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: color.muted }}>
            {mode === 'signin' ? "No account yet? " : 'Already have an account? '}
            <button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setNotice(''); }} style={{ background: 'none', border: 'none', color: color.accent, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 13 }}>
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
