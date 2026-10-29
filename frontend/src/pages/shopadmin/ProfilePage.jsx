import React, { useState, useEffect } from 'react';
import ShopAdminLayout from '@/components/layout/ShopAdminLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/ToastProvider';
import { getProfile, updateProfile } from '@/services/authService';
import {
  Store,
  User,
  Mail,
  Phone,
  Building,
  Save,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function ShopAdminProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('+91 98422 10045');
  const [counterLocation, setCounterLocation] = useState('Main Academic Block (Ground Floor)');
  const [operatingHours, setOperatingHours] = useState('8:30 AM – 6:00 PM');
  const [department, setDepartment] = useState('Stationery Store');

  useEffect(() => {
    let isMounted = true;
    const localCustomShopName = localStorage.getItem('bsp_custom_shop_name') || '';

    // Initialize from context first
    if (user) {
      setName(user.displayName || user.name || (user.email === 'suresh@shopadmin.ac.in' ? 'Suresh Kumar' : 'Shop Operator'));
      setEmail(user.email || 'suresh@shopadmin.ac.in');
      setShopName(user.shopName || (user.email === 'suresh@shopadmin.ac.in' ? 'RASE MECH' : localCustomShopName) || 'RASE MECH');
      if (user.phone) setPhone(user.phone);
      if (user.department) setDepartment(user.department);
    }

    // Then fetch latest from backend
    getProfile()
      .then((data) => {
        if (isMounted && data) {
          if (data.name) setName(data.name);
          if (data.email) setEmail(data.email);
          if (data.shopName) setShopName(data.shopName);
          else if (localCustomShopName) setShopName(localCustomShopName);
          if (data.phone) setPhone(data.phone);
          if (data.department) setDepartment(data.department);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setInitialLoading(false);
      });

    return () => { isMounted = false; };
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shopName.trim()) {
      toast.error('Validation Error', 'Shop name cannot be blank.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        shopName: shopName.trim(),
        phone: phone.trim(),
        department: department.trim(),
      };

      // 1. Sync to backend API (updates Firestore / memory & global shop settings)
      await updateProfile(payload);

      // 2. Persist in localStorage so student dashboard immediately reflects change
      localStorage.setItem('bsp_custom_shop_name', shopName.trim());

      // 3. Update Auth context state
      updateUserProfile({
        name: name.trim(),
        displayName: name.trim(),
        shopName: shopName.trim(),
        phone: phone.trim(),
        department: department.trim(),
      });

      toast.success(
        'Profile & Shop Name Saved',
        `"${shopName.trim()}" is now live across the portal and student dashboard!`
      );
    } catch (err) {
      toast.error('Update Failed', err.message || 'Could not save profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShopAdminLayout>
      <div className="space-y-8 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f0e0] border border-[#e5e5e5] text-xs font-semibold uppercase tracking-[1.5px] text-[#0a0a0a] mb-2">
              <Store className="h-3.5 w-3.5 text-[#ff4d8b]" />
              Store Operator Settings
            </div>
            <h1 className="text-3xl sm:text-4xl font-medium tracking-[-1.5px] text-[#0a0a0a]">
              Shop Profile & Store Identity
            </h1>
            <p className="text-xs sm:text-sm text-[#6a6a6a] mt-1 font-normal">
              Manage your operator details and customize the shop name displayed to students on their portal.
            </p>
          </div>
        </div>

        {/* Live Preview Banner */}
        <div className="bg-[#1a3a3a] text-white p-6 sm:p-7 rounded-[24px] shadow-soft border border-[#2b5555] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] uppercase tracking-[1.5px] font-bold text-[#a4d4c5] block">
              Active Student Portal Display
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white flex items-center gap-2.5">
              <span>{shopName || 'BIT Central Stationery Store'}</span>
              <span className="text-xs bg-[#a4d4c5]/20 text-[#a4d4c5] px-2.5 py-0.5 rounded-full border border-[#a4d4c5]/30 font-mono">
                Live
              </span>
            </h2>
            <p className="text-xs text-white/80 leading-relaxed font-normal">
              Students see this exact shop title on their dashboard when selecting stationery items for pre-order and pickup.
            </p>
          </div>

          <div className="flex flex-col gap-2 bg-white/10 p-4 rounded-[16px] text-xs border border-white/15 min-w-[240px]">
            <div className="flex items-center gap-2 text-[#a4d4c5] font-semibold">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{counterLocation}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{operatingHours}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70 pt-1 text-[11px] border-t border-white/10">
              <ShieldCheck className="h-3.5 w-3.5 text-[#a4d4c5]" />
              <span>Operator: {name || 'Shop Admin'}</span>
            </div>
          </div>
        </div>

        {/* Form Grid */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-[#faf5e8] p-7 sm:p-8 rounded-[24px] border border-[#e5e5e5] space-y-6">
            <div className="flex items-center gap-2.5 border-b border-[#e5e5e5] pb-4">
              <div className="h-9 w-9 rounded-[12px] bg-[#ff4d8b]/15 text-[#ff4d8b] flex items-center justify-center font-bold">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-[#0a0a0a]">Shop & Store Details</h3>
                <p className="text-xs text-[#6a6a6a]">Configure how your shop appears to students</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Input
                  label="Campus Shop Name *"
                  type="text"
                  placeholder="e.g. BIT Central Stationery Store"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  icon={Store}
                  required
                />
                <p className="text-[11px] text-[#6a6a6a] mt-1.5">
                  ⭐ This name appears directly in the <strong>Student Dashboard</strong> shop selector and catalog headlines.
                </p>
              </div>

              <div>
                <Input
                  label="Store Location & Window"
                  type="text"
                  placeholder="e.g. Main Academic Block (Ground Floor)"
                  value={counterLocation}
                  onChange={(e) => setCounterLocation(e.target.value)}
                  icon={MapPin}
                />
              </div>

              <div>
                <Input
                  label="Store Operating Hours"
                  type="text"
                  placeholder="e.g. 8:30 AM – 6:00 PM"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  icon={Clock}
                />
              </div>
            </div>
          </div>

          {/* Personal & Operator Info */}
          <div className="bg-[#faf5e8] p-7 sm:p-8 rounded-[24px] border border-[#e5e5e5] space-y-6">
            <div className="flex items-center gap-2.5 border-b border-[#e5e5e5] pb-4">
              <div className="h-9 w-9 rounded-[12px] bg-[#1a3a3a]/15 text-[#1a3a3a] flex items-center justify-center font-bold">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-[#0a0a0a]">Operator Account Details</h3>
                <p className="text-xs text-[#6a6a6a]">Store manager profile and communication info</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Input
                  label="Operator Full Name"
                  type="text"
                  placeholder="e.g. Suresh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={User}
                  required
                />
              </div>

              <div>
                <Input
                  label="Institutional Email"
                  type="email"
                  value={email}
                  disabled
                  icon={Mail}
                  className="bg-[#f0ebe0] cursor-not-allowed opacity-80"
                />
                <span className="text-[10px] text-[#6a6a6a] mt-1 block">
                  Campus login email is managed by Campus Admin
                </span>
              </div>

              <div>
                <Input
                  label="Contact Phone / Extension"
                  type="text"
                  placeholder="+91 98422 10045"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={Phone}
                />
              </div>

              <div>
                <Input
                  label="Assigned Department"
                  type="text"
                  placeholder="Stationery Store"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  icon={Building}
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={Save}
              className="bg-[#0a0a0a] hover:bg-[#252525]"
            >
              Save Profile & Update Shop Name
            </Button>
          </div>
        </form>
      </div>
    </ShopAdminLayout>
  );
}
