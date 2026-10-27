import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldCheck,
  HeartHandshake,
  ArrowLeft,
  KeyRound,
  Info
} from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { settings } = useContent();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both administrative email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = {};
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? 'Login API endpoint was not found (404). Please ensure the Vercel backend function is deployed.'
              : text.slice(0, 100) || `Server error (${res.status})`
          );
        }
      }

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      login(data.token, data.admin);
      onNavigate('/admin/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F8F9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Back to website button */}
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#075765] hover:text-[#10A8B7] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Public Website</span>
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 max-w-[220px]">
            <ImageWithFallback
              src={settings.logoUrl}
              alt="AFNAAN CARES Logo"
              className="h-11 w-auto object-contain"
              fallbackText="AFNAAN CARES Nurses & Caregiver"
              fallbackIcon={<HeartHandshake className="w-6 h-6 text-[#075765]" />}
              fallbackClassName="h-10 text-[#075765] font-bold text-sm flex items-center"
            />
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-[#075765] tracking-tight">
          Administrative Portal
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Secure management access for authorized AFNAAN CARES staff &amp; coordinators
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-gray-200">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Admin Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="AFNAAN"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="AFNAAN2027"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10A8B7] text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#075765] hover:bg-[#05434e] text-white py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Secure Session...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-[#C9A45C]" />
                    <span>Sign In to Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* First-time deployment helper box */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="w-full flex items-center justify-between text-xs text-gray-500 hover:text-[#075765]"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Info className="w-3.5 h-3.5 text-[#10A8B7]" />
                Official Administrator Access Credentials
              </span>
              <span>{showHelp ? 'Hide' : 'Show'}</span>
            </button>

            {showHelp && (
              <div className="mt-3 p-3.5 rounded-xl bg-[#F3F8F9] border border-gray-200 text-xs text-gray-600 space-y-2 animate-in fade-in duration-200">
                <p>
                  <strong>Default Admin Credentials:</strong>
                </p>
                <div className="font-mono bg-white p-2.5 rounded border border-gray-200 text-xs select-all space-y-1">
                  <div>Username: <span className="text-[#075765] font-bold">AFNAAN</span></div>
                  <div>Password: <span className="text-[#075765] font-bold">AFNAAN2027</span></div>
                </div>
                <p className="text-[11px] text-gray-500">
                  You can click below to autofill or type these credentials directly into the login fields.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('AFNAAN');
                    setPassword('AFNAAN2027');
                  }}
                  className="w-full text-center py-1.5 bg-[#075765] text-white rounded-lg text-xs font-bold hover:bg-[#05434e] transition-colors"
                >
                  Autofill Admin Credentials
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#10A8B7]" />
          <span>Server-side scrypt hashing &bull; Session timeout protected</span>
        </div>
      </div>
    </div>
  );
};
