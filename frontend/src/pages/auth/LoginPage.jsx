import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { validateEmailDomain } from '@/utils/roleGuards';
import { useToast } from '@/components/ui/ToastProvider';
import { Lock, Mail, ArrowRight, Sparkles, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmailDomain(email)) {
      setError(
        'Campus email domain required: @bitsathy.ac.in, @student.ac.in, @faculty.ac.in, @shopadmin.ac.in, or @admin.ac.in'
      );
      return;
    }

    setLoading(true);
    try {
      const role = await login(email, password);
      toast.success('Welcome back', `Signed in as ${role}`);
      navigate(`/${role}/dashboard`, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const role = await loginWithGoogle();
      toast.success('Google Authentication Successful', `Signed in as ${role}`);
      navigate(`/${role}/dashboard`, { replace: true });
    } catch (err) {
      // Don't show scary error if user closed the popup
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      setError(err.message || 'Failed to authenticate with Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#0a0a0a] flex flex-col justify-between">
      {/* Top minimal brand bar */}
      <header className="px-6 lg:px-12 py-6 flex items-center justify-between border-b border-[#e5e5e5]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-[12px] bg-[#0a0a0a] flex items-center justify-center text-white font-bold text-sm">
            B·S
          </div>
          <div>
            <span className="font-medium text-base tracking-[-0.5px] block text-[#0a0a0a]">
              BIT Campus Stationery
            </span>
            <span className="text-[10px] uppercase tracking-[1.5px] font-semibold text-[#6a6a6a]">
              Pre-Ordering Portal
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-[#6a6a6a]">
          <span className="h-2 w-2 rounded-full bg-[#1a3a3a]"></span>
          <span>Official Campus Supply Desk</span>
        </div>
      </header>

      {/* Main Hero & Form Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-12 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: 7 cols - Clay Display Headline & Feature Cards */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f5f0e0] border border-[#e5e5e5] text-xs font-semibold uppercase tracking-[1.5px] text-[#0a0a0a]">
              <Sparkles className="h-3.5 w-3.5 text-[#ff4d8b]" />
              Campus Pre-Ordering Experience
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-[-2px] text-[#0a0a0a] leading-[1.05]">
              Reserve stationery without standing in queue.
            </h1>

            <p className="text-base text-[#6a6a6a] max-w-xl leading-relaxed font-normal">
              Pre-order engineering notebooks, technical pens, scientific calculators, and laboratory record books. Collect from the dedicated pickup window in seconds.
            </p>
          </div>

          {/* Clay Saturated 6-Color Showcase Cards Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Pink Card */}
            <div className="bg-[#ff4d8b] text-white p-6 rounded-[24px] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-white/80">
                Fast Store Clearance
              </span>
              <h3 className="text-lg font-medium tracking-[-0.5px] text-white">
                Scheduled Pickup Slots
              </h3>
              <p className="text-xs text-white/90 leading-relaxed">
                Choose hourly pickup windows matching your class breaks and lab timings.
              </p>
            </div>

            {/* Teal Card */}
            <div className="bg-[#1a3a3a] text-white p-6 rounded-[24px] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#a4d4c5]">
                Faculty & Department Desks
              </span>
              <h3 className="text-lg font-medium tracking-[-0.5px] text-white">
                Bulk Lab Indents
              </h3>
              <p className="text-xs text-white/80 leading-relaxed">
                Requisition classroom supplies with priority desk collection.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: 5 cols - Login Card */}
        <div className="lg:col-span-5">
          <div className="bg-[#faf5e8] p-8 sm:p-10 rounded-[24px] border border-[#e5e5e5] shadow-soft space-y-6">
            <div>
              <h2 className="text-2xl font-medium tracking-[-1px] text-[#0a0a0a]">
                Sign in to your portal
              </h2>
              <p className="text-xs text-[#6a6a6a] mt-1">
                Enter your institutional credentials to access pre-ordering
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-[#ff4d8b]/10 border border-[#ff4d8b]/30 text-[#ff4d8b] text-xs font-medium rounded-[12px]">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Institutional Email"
                type="email"
                placeholder="name@bitsathy.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                required
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                required
                endAction={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-[#9a9a9a] hover:text-[#0a0a0a] transition-colors focus:outline-none rounded-md cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#6a6a6a]">Domain-restricted access</span>
                <Link
                  to="/forgot-password"
                  className="font-medium text-[#0a0a0a] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                loading={loading}
                icon={ArrowRight}
              >
                Sign In
              </Button>
            </form>

            {/* Google Authentication Option */}
            <div className="space-y-3">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-[#e5e5e5] w-full"></div>
                <span className="bg-[#faf5e8] px-3 text-[11px] font-medium text-[#6a6a6a] uppercase tracking-wider relative">
                  or continue with
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="w-full py-2.5 px-4 bg-white hover:bg-[#f5f0e0] text-[#0a0a0a] border border-[#e5e5e5] hover:border-[#0a0a0a] rounded-[14px] text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {googleLoading ? (
                  <div className="h-4 w-4 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Sign in with Google</span>
              </button>
            </div>

            {/* Clay-style Saturated 1-Click Role Demo Badges */}
            <div className="pt-6 border-t border-[#e5e5e5] space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#6a6a6a] block text-center">
                One-Click Role Demonstration
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('arjun@bitsathy.ac.in', 'student123')}
                  className="p-3 text-left bg-[#ffb084]/20 hover:bg-[#ffb084]/35 border border-[#ffb084]/50 rounded-[16px] transition-all"
                >
                  <p className="text-xs font-semibold text-[#0a0a0a]">Student</p>
                  <p className="text-[10px] text-[#6a6a6a] truncate">arjun@bitsathy.ac.in</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('kavitha@faculty.ac.in', 'faculty123')}
                  className="p-3 text-left bg-[#b8a4ed]/25 hover:bg-[#b8a4ed]/40 border border-[#b8a4ed]/50 rounded-[16px] transition-all"
                >
                  <p className="text-xs font-semibold text-[#0a0a0a]">Faculty</p>
                  <p className="text-[10px] text-[#6a6a6a] truncate">kavitha@faculty.ac.in</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('suresh@shopadmin.ac.in', 'admin123')}
                  className="p-3 text-left bg-[#e8b94a]/25 hover:bg-[#e8b94a]/40 border border-[#e8b94a]/50 rounded-[16px] transition-all"
                >
                  <p className="text-xs font-semibold text-[#0a0a0a]">Shop Admin</p>
                  <p className="text-[10px] text-[#6a6a6a] truncate">suresh@shopadmin.ac.in</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin@admin.ac.in', 'admin123')}
                  className="p-3 text-left bg-[#1a3a3a] text-white hover:bg-[#254d4d] rounded-[16px] transition-all"
                >
                  <p className="text-xs font-semibold text-white">Campus Admin</p>
                  <p className="text-[10px] text-white/70 truncate">admin@admin.ac.in</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Cream-tinted footer */}
      <footer className="bg-[#faf5e8] border-t border-[#e5e5e5] py-8 text-center text-xs text-[#6a6a6a]">
        <p>© 2026 Bannari Amman Institute of Technology — Campus Stationery Store Pre-Ordering Portal</p>
      </footer>
    </div>
  );
}
