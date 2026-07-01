import { useState, useEffect } from 'react';
import { useStore } from './lib/useStore.js';
import { usingSupabase } from './lib/backend.js';
import { getSession, onAuthChange } from './lib/auth.js';
import { color, font } from './lib/tokens.js';
import ProjectPicker from './components/ProjectPicker.jsx';
import Dashboard from './components/Dashboard.jsx';
import Login from './components/Login.jsx';

// The store-backed UI. Same in both backends — it never knows which one is live.
function Workspace() {
  const store = useStore();
  return store.view === 'dashboard' ? <Dashboard store={store} /> : <ProjectPicker store={store} />;
}

function Splash({ label }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.mono, fontSize: 12, color: color.faint, letterSpacing: '0.04em' }}>
      {label}
    </div>
  );
}

export default function App() {
  // Local mode (no Supabase configured): no auth, render the workspace directly.
  if (!usingSupabase) return <Workspace />;

  // Supabase mode: gate the workspace behind a session.
  return <AuthGate />;
}

function AuthGate() {
  const [session, setSession] = useState(undefined); // undefined = still checking

  useEffect(() => {
    getSession().then(setSession);
    return onAuthChange(setSession);
  }, []);

  if (session === undefined) return <Splash label="LOADING…" />;
  if (!session) return <Login />;
  return <Workspace />;
}
