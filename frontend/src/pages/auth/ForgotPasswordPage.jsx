import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { validateEmailDomain } from '@/utils/roleGuards';
import { useToast } from '@/components/ui/ToastProvider';
import { Command, ArrowLeft, Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();
  const toast = useToast();

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmailDomain(email)) {
      setError('Please provide your valid campus email address.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Reset link dispatched', 'Check your college inbox for instructions.');
    } catch (err) {
      setError(err.message || 'Failed to dispatch reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-body flex flex-col justify-between py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center pt-8">
        <div className="mx-auto h-12 w-12 rounded-full bg-ink text-white flex items-center justify-center mb-6 shadow-card">
          <Command className="h-6 w-6" />
        </div>
        <h1 className="text-display-md font-semibold tracking-tight text-ink leading-tight">
          Reset Password.
        </h1>
        <p className="mt-2 text-body text-ink-muted-80 font-normal">
          Enter your registered institutional email to receive reset instructions.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md py-6">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-lg border border-hairline shadow-card space-y-6">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-10 h-10 bg-action-blue/10 text-action-blue rounded-full flex items-center justify-center mx-auto text-sm font-semibold">
                ✓
              </div>
              <h3 className="text-body font-semibold text-ink">Instructions Dispatched</h3>
              <p className="text-caption text-ink-muted-80 leading-relaxed">
                If an account exists for <span className="font-semibold text-ink">{email}</span>, password reset instructions have been dispatched.
              </p>
              <div className="pt-2">
                <Link to="/login">
                  <Button variant="secondary" size="md" className="w-full" icon={ArrowLeft}>
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              {error && (
                <div className="p-3 bg-[#ffebee] border border-[#ffcdd2] text-[#c62828] text-caption rounded-sm">
                  {error}
                </div>
              )}

              <Input
                label="Institutional Email"
                type="email"
                placeholder="rollno@bitsathy.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
                icon={Send}
              >
                Send Reset Link
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center text-caption text-action-blue hover:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-[980px] mx-auto text-center text-fine-print text-ink-muted-48 pt-6">
        <p>Copyright © 2026 Bannari Amman Institute of Technology. All rights reserved.</p>
      </div>
    </div>
  );
}
