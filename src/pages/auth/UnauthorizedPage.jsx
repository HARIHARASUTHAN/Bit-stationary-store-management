import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ROLE_HOME_ROUTES } from '@/utils/roleGuards';

export default function UnauthorizedPage() {
  const { role } = useAuth();
  const homeRoute = ROLE_HOME_ROUTES[role] || '/login';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-gray-200 shadow-xl space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Restricted Access</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Your account role (<span className="font-semibold text-gray-900 uppercase">{role || 'unassigned'}</span>) does not possess clearance to view this route or resource.
        </p>
        <div className="pt-4">
          <Link to={homeRoute}>
            <Button variant="primary" size="md" icon={ArrowLeft}>
              Return to Your Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
