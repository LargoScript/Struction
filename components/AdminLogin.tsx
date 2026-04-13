"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const DEMO_LOGIN = 'demo';
const DEMO_PASSWORD = 'struction24';

const AdminLogin: React.FC = () => {
  const router = useRouter();
  const [login, setLogin] = useState(DEMO_LOGIN);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (login === DEMO_LOGIN && password === DEMO_PASSWORD) {
        sessionStorage.setItem('cms_auth', '1');
        router.push('/admin/cms');
      } else {
        setError('Invalid username or password.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-3xl font-bold text-white tracking-tight mb-1">Struction</div>
          <div className="text-zinc-400 text-sm">CMS Admin Panel</div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4"
        >
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Username</label>
            <input
              type="text"
              autoComplete="username"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="admin"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Password</label>
            <input
              type="password"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !login || !password}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 space-y-3">
          <div className="text-xs text-zinc-600 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 font-mono text-center">
            demo: <span className="text-zinc-400">demo</span> / <span className="text-zinc-400">struction24</span>
          </div>

          <div className="bg-amber-950/40 border border-amber-800/50 rounded-lg px-4 py-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Demo version
            </div>
            <p className="text-[11px] text-amber-200/70 leading-relaxed">
              This is a live demo of the CMS. All changes are saved locally in your browser only — nothing is shared or stored globally. To reset everything back to defaults, use the <span className="text-amber-300 font-medium">Reset defaults</span> button inside the panel.
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Back to site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
