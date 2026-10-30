import React, { useState, useEffect } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/ToastProvider';
import { getProfile, updateProfile, changePassword } from '@/services/authService';
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Save,
  ShieldCheck,
  Sparkles,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';

const DEPARTMENT_OPTIONS = [
  { value: 'Artificial Intelligence and Data Science', label: 'Artificial Intelligence & Data Science' },
  { value: 'Computer Science and Engineering', label: 'Computer Science and Engineering' },
  { value: 'Information Technology', label: 'Information Technology' },
  { value: 'Electronics and Communication Engineering', label: 'Electronics & Communication Engineering' },
  { value: 'Electrical and Electronics Engineering', label: 'Electrical & Electronics Engineering' },
  { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
  { value: 'Civil Engineering', label: 'Civil Engineering' },
  { value: 'Biotechnology', label: 'Biotechnology' },
  { value: 'Mechatronics Engineering', label: 'Mechatronics Engineering' },
];

const YEAR_OPTIONS = [
  { value: '1st Year (Sem I & II)', label: '1st Year (Sem I & II)' },
  { value: '2nd Year (Sem III & IV)', label: '2nd Year (Sem III & IV)' },
  { value: '3rd Year (Sem V & VI)', label: '3rd Year (Sem V & VI)' },
  { value: '4th Year (Sem VII & VIII)', label: '4th Year (Sem VII & VIII)' },
];

export default function StudentProfilePage() {
  const { user, updateUserProfile, role } = useAuth();
  const toast = useToast();
  const isFaculty = role === 'faculty';

  // Profile details states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Artificial Intelligence and Data Science');
  const [rollNumber, setRollNumber] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('4th Year (Sem VII & VIII)');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Initialize data from current user context & fetch saved profile
  useEffect(() => {
    let isMounted = true;

    if (user) {
      setName(user.displayName || user.name || (user.email ? user.email.split('@')[0] : 'Student'));
      setEmail(user.email || 'arjun@bitsathy.ac.in');
      if (user.phone) setPhone(user.phone);
      if (user.department) setDepartment(user.department);
      if (user.rollNumber) setRollNumber(user.rollNumber);
      if (user.yearOfStudy) setYearOfStudy(user.yearOfStudy);
    }

    // Load full profile if available
    getProfile()
      .then((data) => {
        if (isMounted && data) {
          if (data.name) setName(data.name);
          if (data.email) setEmail(data.email);
          if (data.phone) setPhone(data.phone);
          if (data.department) setDepartment(data.department);
          if (data.rollNumber) setRollNumber(data.rollNumber);
          if (data.yearOfStudy) setYearOfStudy(data.yearOfStudy);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handle saving student profile details
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name Required', 'Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error('Email Required', 'Please enter a valid email address.');
      return;
    }

    setSavingProfile(true);
    try {
      const payload = {
        name: name.trim(),
        displayName: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        department: department.trim(),
        rollNumber: rollNumber.trim(),
        yearOfStudy: yearOfStudy.trim(),
      };

      await updateProfile(payload);
      updateUserProfile(payload);

      toast.success('Profile Saved', 'Your student account details and email have been updated.');
    } catch (err) {
      toast.error('Update Failed', err.message || 'Could not update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle changing account password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!newPassword) {
      toast.error('Password Required', 'Please enter your new password.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password Too Short', 'Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords Do Not Match', 'New password and confirmation password must match.');
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(newPassword.trim());
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password Updated', 'Your login password has been changed successfully.');
    } catch (err) {
      toast.error('Password Update Failed', err.message || 'Could not update password.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f5f0e0] border border-[#e5e5e5] text-xs font-semibold uppercase tracking-[1.5px] text-[#0a0a0a] mb-2.5">
            <Sparkles className="h-3.5 w-3.5 text-[#ff4d8b]" />
            {isFaculty ? 'Faculty Account Center' : 'Student Account Center'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-medium tracking-[-1.5px] text-[#0a0a0a]">
            My Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#6a6a6a] mt-1 font-normal">
            Manage your personal profile, institutional records, contact info, and security credentials.
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-[#faf5e8] p-6 sm:p-8 rounded-[24px] border border-[#e5e5e5] space-y-6">
          <div className="flex items-center gap-4 border-b border-[#e5e5e5] pb-6">
            <div className="h-16 w-16 rounded-[20px] bg-[#0a0a0a] text-white flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-sm">
              {name ? name[0].toUpperCase() : (isFaculty ? 'F' : 'S')}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-[#0a0a0a] truncate">{name || (isFaculty ? 'Faculty Member' : 'Student')}</h3>
                <Badge variant={isFaculty ? 'lavender' : 'peach'} size="sm">
                  {isFaculty ? 'FACULTY' : 'STUDENT'}
                </Badge>
              </div>
              <p className="text-xs text-[#6a6a6a] truncate mt-0.5">{email}</p>
              <p className="text-[11px] text-[#1a3a3a] font-medium mt-1">
                Bannari Amman Institute of Technology
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isFaculty ? 'e.g. Dr. Kavitha M' : 'e.g. Hari Arjun'}
                icon={User}
                required
              />

              <Input
                label={isFaculty ? 'Faculty / Employee ID' : 'Roll / Register Number'}
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder={isFaculty ? 'e.g. FAC-CSE-042' : 'e.g. 7376222AL123'}
                icon={BookOpen}
              />
            </div>

            {/* Editable Campus Email Address */}
            <Input
              label={isFaculty ? 'Campus Official Email' : 'Student Email Address'}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isFaculty ? 'faculty@bitsathy.ac.in' : 'name@bitsathy.ac.in'}
              icon={Mail}
              required
              helperText="Your official campus email used for order confirmations and pickup alerts"
            />

            <div className={`grid grid-cols-1 ${isFaculty ? 'sm:grid-cols-1' : 'sm:grid-cols-2'} gap-4`}>
              <Input
                label="Contact Mobile (For Pickup SMS)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                icon={Phone}
              />

              {!isFaculty && (
                <Select
                  label="Academic Year"
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  options={YEAR_OPTIONS}
                  placeholder=""
                />
              )}
            </div>

            <Select
              label="Department / Program"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={DEPARTMENT_OPTIONS}
              placeholder=""
            />

            <div className="pt-4 flex items-center justify-between border-t border-[#e5e5e5]">
              <span className="text-[11px] text-[#6a6a6a]">
                Changes are synced with your campus pre-order tray
              </span>
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={Save}
                loading={savingProfile}
                className="bg-[#1a3a3a] hover:bg-[#254d4d]"
              >
                Save Profile
              </Button>
            </div>
          </form>
        </div>

        {/* Password Change Card */}
        <div className="bg-[#faf5e8] p-6 sm:p-8 rounded-[24px] border border-[#e5e5e5] space-y-5">
          <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-[12px] bg-[#1a3a3a] text-white flex items-center justify-center">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#0a0a0a]">Change Password</h3>
                <p className="text-xs text-[#6a6a6a]">Update your portal account login credentials</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#065f46] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Secure
            </span>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                icon={Lock}
                required
                endAction={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="p-1 text-[#9a9a9a] hover:text-[#0a0a0a] transition-colors focus:outline-none cursor-pointer"
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                icon={Lock}
                required
                endAction={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-1 text-[#9a9a9a] hover:text-[#0a0a0a] transition-colors focus:outline-none cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[#e5e5e5]">
              <span className="text-[11px] text-[#6a6a6a]">
                Must be at least 6 characters long
              </span>
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={KeyRound}
                loading={changingPassword}
                className="bg-[#1a3a3a] hover:bg-[#254d4d]"
              >
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </StudentLayout>
  );
}
