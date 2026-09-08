import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-gray-200 shadow-xl space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-[#1e3a5f] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <FileQuestion className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Page Not Found</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          The page you requested could not be located on the campus stationery portal.
        </p>
        <div className="pt-4">
          <Link to="/">
            <Button variant="primary" size="md" icon={ArrowLeft}>
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
