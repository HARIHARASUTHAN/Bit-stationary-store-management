import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/ToastProvider';
import {
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  Building2,
  Store,
  ShieldCheck,
  Clock,
  Layers,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const ROLES = [
  {
    id: 'student',
    name: 'Student',
    tagline: 'Stationery & slot pre-orders',
    domainHint: '@bitsathy.ac.in / @student.ac.in',
    placeholder: 'rollno@bitsathy.ac.in',
    icon: GraduationCap,
  },
  {
    id: 'faculty',
    name: 'Faculty',
    tagline: 'Teaching & department indents',
    domainHint: '@bitsathy.ac.in only',
    placeholder: 'facultyname@bitsathy.ac.in',
    icon: Building2,
  },
  {
    id: 'shopadmin',
    name: 'Shop Admin',
    tagline: 'Store operations & dispatch',
    domainHint: '@shopadmin.ac.in',
    placeholder: 'operator@shopadmin.ac.in',
    icon: Store,
  },
  {
    id: 'admin',
    name: 'Campus Admin',
    tagline: 'Central governance & accounts',
    domainHint: '@admin.ac.in',
    placeholder: 'admin@admin.ac.in',
    icon: ShieldCheck,
  },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const selectedRoleObj = ROLES.find((r) => r.id === selectedRole) || null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) {
      setError('Please select your role (Student, Faculty, Shop Admin, or Campus Admin) before signing in.');
      return;
    }

    const cleanEmail = email.toLowerCase().trim();

    if (selectedRole === 'faculty') {
      if (cleanEmail.endsWith('@faculty.ac.in')) {
        setError('Faculty must log in through @bitsathy.ac.in institutional email address.');
        return;
      }
      if (!cleanEmail.endsWith('@bitsathy.ac.in')) {
        setError('Faculty role requires an official @bitsathy.ac.in institutional email address.');
        return;
      }
    } else if (selectedRole === 'student') {
      if (!cleanEmail.endsWith('@bitsathy.ac.in') && !cleanEmail.endsWith('@student.ac.in')) {
        setError('Student role requires an official @bitsathy.ac.in or @student.ac.in email address.');
        return;
      }
    } else if (selectedRole === 'shopadmin') {
      if (!cleanEmail.endsWith('@shopadmin.ac.in')) {
        setError('Shop Admin role requires an authorized @shopadmin.ac.in store operator email.');
        return;
      }
    } else if (selectedRole === 'admin') {
      if (!cleanEmail.endsWith('@admin.ac.in')) {
        setError('Campus Admin role requires an authorized @admin.ac.in governance email.');
        return;
      }
    }

    setLoading(true);
    try {
      const role = await login(email, password, selectedRole);
      toast.success('Welcome back', `Signed in as ${selectedRoleObj?.name || role}`);
      navigate(`/${selectedRole}/dashboard`, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');

    if (!selectedRole) {
      setError('Please select your role (Student, Faculty, Shop Admin, or Campus Admin) before signing in with Google.');
      return;
    }

    setGoogleLoading(true);
    try {
      const role = await loginWithGoogle(selectedRole);
      toast.success('Google Authentication Successful', `Signed in as ${selectedRoleObj?.name || role}`);
      navigate(`/${selectedRole}/dashboard`, { replace: true });
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      setError(err.message || 'Failed to authenticate with Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#0a0a0a] flex flex-col justify-between">
      {/* Top minimal institutional brand bar */}
      <header className="px-6 lg:px-12 py-5 flex items-center justify-between border-b border-[#e5e5e5] bg-[#fffaf0]/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-[12px] bg-[#0a0a0a] flex items-center justify-center text-white font-bold text-sm shadow-xs">
            B·S
          </div>
          <div>
            <span className="font-semibold text-base tracking-tight block text-[#0a0a0a] leading-tight">
              BIT Campus Stationery
            </span>
            <span className="text-[10.5px] uppercase tracking-[1.5px] font-semibold text-[#6a6a6a]">
              Store Pre-Ordering Portal
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#faf5e8] border border-[#e5e5e5] text-xs font-medium text-[#4a4a4a]">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Bannari Amman Institute of Technology</span>
        </div>
      </header>

      {/* Main Content: Perfectly Aligned 7-5 Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Institutional Value Pillars */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f0e0] border border-[#e5e5e5] text-[11px] font-semibold uppercase tracking-[1.5px] text-[#0a0a0a]">
                <Sparkles className="h-3.5 w-3.5 text-[#ff4d8b]" />
                Institutional Supply Desk
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-1.5px] text-[#0a0a0a] leading-[1.1]">
                Reserve campus stationery.
                <span className="block text-[#6a6a6a] font-normal text-2xl sm:text-3xl lg:text-4xl mt-1">
                  Pick up at counter without queues.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#6a6a6a] max-w-xl font-normal leading-relaxed">
                Official pre-ordering and express store clearance for students, faculty, and academic departments across all BIT Sathy branches.
              </p>
            </div>

            {/* 3 Balanced Feature Highlights */}
            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3.5 p-3.5 rounded-[16px] bg-[#faf5e8] border border-[#e5e5e5]/80">
                <div className="h-9 w-9 rounded-[10px] bg-[#0a0a0a] text-white flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-[#0a0a0a]">Hourly Pickup Slots</h3>
                  <p className="text-xs text-[#6a6a6a] leading-relaxed">
                    Lock in 30–60 minute pickup windows aligned with class breaks. Orders are bagged and ready at the counter before you arrive.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-[16px] bg-[#faf5e8] border border-[#e5e5e5]/80">
                <div className="h-9 w-9 rounded-[10px] bg-[#1a3a3a] text-[#a4d4c5] flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-[#0a0a0a]">Faculty Requisitions & Indents</h3>
                  <p className="text-xs text-[#6a6a6a] leading-relaxed">
                    Priority department desk for classroom chalk, whiteboard markers, examination reams, and laboratory consumables.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-[16px] bg-[#faf5e8] border border-[#e5e5e5]/80">
                <div className="h-9 w-9 rounded-[10px] bg-[#ff4d8b] text-white flex items-center justify-center shrink-0">
                  <Layers className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-[#0a0a0a]">4 Campus Stationery Outlets</h3>
                  <p className="text-xs text-[#6a6a6a] leading-relaxed">
                    Live inventory lookup across LCU Stationery, SIS BIT, HIQ PRINTERS, and RASE Mech store locations.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom trust strip */}
            <div className="pt-1 flex items-center gap-4 text-[11px] font-medium text-[#6a6a6a]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#065f46]" />
                Domain Authenticated
              </span>
              <span>•</span>
              <span>Instant Confirmation</span>
              <span>•</span>
              <span>Direct Counter Handover</span>
            </div>
          </div>

          {/* Right Column: Clean, Professional Sign-In Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#faf5e8] p-6 sm:p-8 rounded-[24px] border border-[#e5e5e5] shadow-soft space-y-5">
              {/* Card Header */}
              <div className="border-b border-[#e5e5e5] pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#6a6a6a]">
                    Portal Authentication
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#0a0a0a]"></span>
                </div>
                <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#0a0a0a] mt-1">
                  Sign in to your account
                </h2>
                <p className="text-xs text-[#6a6a6a] mt-0.5">
                  Select your campus role and enter your institutional credentials
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3 bg-[#ff4d8b]/10 border border-[#ff4d8b]/30 text-[#ff4d8b] text-xs font-medium rounded-[12px] flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: Role Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-[1px] text-[#0a0a0a] flex items-center gap-1.5">
                    <span>Select Your Role</span>
                    <span className="text-[#ff4d8b]">*</span>
                  </label>
                  {selectedRole ? (
                    <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#065f46] bg-[#065f46]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      {selectedRoleObj?.name}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-[#ff4d8b] bg-[#ff4d8b]/10 px-2 py-0.5 rounded-full">
                      Required
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => {
                    const isSelected = selectedRole === r.id;
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setSelectedRole(r.id);
                          setError('');
                        }}
                        className={`p-3 rounded-[14px] text-left transition-all border flex flex-col justify-between cursor-pointer relative ${
                          isSelected
                            ? 'bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-xs ring-2 ring-[#0a0a0a]/20'
                            : 'bg-white text-[#0a0a0a] border-[#e5e5e5] hover:border-[#0a0a0a]/40 hover:bg-[#fffaf0]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div
                            className={`p-1.5 rounded-[8px] ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-[#f5f0e0] text-[#0a0a0a]'
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          {isSelected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#ff4d8b]"></span>
                          )}
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-semibold tracking-tight">{r.name}</p>
                          <p
                            className={`text-[9.5px] mt-0.5 leading-tight truncate ${
                              isSelected ? 'text-white/70' : 'text-[#6a6a6a]'
                            }`}
                          >
                            {r.tagline}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Credentials Form */}
              <form onSubmit={handleLogin} className="space-y-3.5 pt-1">
                <Input
                  label={
                    selectedRoleObj
                      ? `${selectedRoleObj.name} Institutional Email`
                      : 'Institutional Email'
                  }
                  type="email"
                  placeholder={selectedRoleObj ? selectedRoleObj.placeholder : 'name@bitsathy.ac.in'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={Mail}
                  required
                  helperText={
                    selectedRoleObj
                      ? `Accepted domain: ${selectedRoleObj.domainHint}`
                      : 'Select your role above to see domain rules'
                  }
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

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-[#6a6a6a] text-[11px] flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-[#065f46]" />
                    Institutional Domain
                  </span>
                  <Link
                    to="/forgot-password"
                    className="font-medium text-[#0a0a0a] hover:underline text-[11.5px]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full text-xs font-semibold min-h-[44px]"
                  loading={loading}
                  icon={ArrowRight}
                >
                  {selectedRoleObj ? `Sign In as ${selectedRoleObj.name}` : 'Sign In'}
                </Button>
              </form>

              {/* Step 3: Google SSO */}
              <div className="space-y-3 pt-1">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-[#e5e5e5] w-full"></div>
                  <span className="bg-[#faf5e8] px-3 text-[10px] font-bold text-[#8a8a8a] uppercase tracking-wider relative">
                    or continue with
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading || loading}
                  className="w-full py-2.5 px-4 bg-white hover:bg-[#fffaf0] text-[#0a0a0a] border border-[#e5e5e5] hover:border-[#0a0a0a]/40 rounded-[12px] text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 min-h-[42px]"
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

              {/* Security & Support Guarantee */}
              <div className="pt-2 border-t border-[#e5e5e5] flex items-center justify-center gap-1.5 text-[10.5px] text-[#8a8a8a]">
                <Lock className="h-3 w-3 text-[#6a6a6a]" />
                <span>Protected by BIT Sathy Identity Management</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Cream-tinted institutional footer */}
      <footer className="bg-[#faf5e8] border-t border-[#e5e5e5] py-5 px-6 text-center text-xs text-[#6a6a6a]">
        <p className="font-medium text-[#0a0a0a]">
          Bannari Amman Institute of Technology (Autonomous)
        </p>
        <p className="text-[11px] text-[#6a6a6a] mt-0.5">
          Campus Stationery Pre-Ordering & Store Clearance Portal • Sathyamangalam, Tamil Nadu 638401
        </p>
      </footer>
    </div>
  );
}
