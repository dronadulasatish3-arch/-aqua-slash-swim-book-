import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { ShieldCheck, Lock, Mail, X } from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const { loginModalOpen, closeLoginModal, login } = useAdmin();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!loginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = login(email, password);
    if (!success) {
      setError('Invalid email or password.');
    } else {
      setEmail('');
      setPassword('');
      setError(null);
    }
  };

  const handleClose = () => {
    setError(null);
    setEmail('');
    setPassword('');
    closeLoginModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border-4 border-black bg-[#fffaf0] p-6 text-slate-900 shadow-[10px_10px_0_#000]">
        <button
          onClick={handleClose}
          type="button"
          className="absolute top-4 right-4 rounded-lg border-2 border-black bg-rose-500 p-1 text-white hover:bg-rose-600 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border-3 border-black bg-yellow-300 shadow-[3px_3px_0_#000]">
            <ShieldCheck className="h-7 w-7 text-black" />
          </div>

          <h2 className="mt-3 font-bangers text-2xl tracking-wide text-slate-950">
            ADMIN LOGIN
          </h2>
          <p className="font-comic text-xs font-bold text-slate-600">
            Enter credentials to unlock editing
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border-2 border-rose-600 bg-rose-50 p-2.5 text-xs font-bold text-rose-700 text-center">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email..."
                className="w-full rounded-xl border-2 border-black bg-white py-2 pl-9 pr-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full rounded-xl border-2 border-black bg-white py-2 pl-9 pr-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer rounded-xl border-3 border-black bg-yellow-400 py-2.5 font-bangers text-lg tracking-wider text-black shadow-[4px_4px_0_#000] hover:bg-yellow-300 active:translate-x-0.5 active:translate-y-0.5 mt-2"
          >
            UNLOCK 🔓
          </button>
        </form>
      </div>
    </div>
  );
};
