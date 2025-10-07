import { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('analyst@phishsentry.local');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login(email, 'placeholder-token');
    const target = (location.state as { from?: string })?.from ?? '/';
    navigate(target, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 rounded-lg border border-slate-200 bg-white p-8 shadow"
      >
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Sign in to PhishSentry</h1>
          <p className="text-sm text-slate-500">Use your SOC credentials to access the operations dashboard.</p>
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-brand focus:ring-2 focus:ring-brand/40"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Continue
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
