import React from 'react';
import { Check, XCircle } from 'lucide-react';
import { formatDateTime } from '@/utils/formatDate';

const STEPS = ['Pending', 'Approved', 'Ready', 'Collected'];

export default function OrderTimeline({ status, timeline = [] }) {
  const isCancelled = status === 'Cancelled';
  const currentIndex = STEPS.indexOf(status);

  if (isCancelled) {
    return (
      <div className="p-4 bg-[#ff4d8b]/10 border border-[#ff4d8b]/30 rounded-[16px] text-[#ff4d8b] flex items-start gap-3">
        <XCircle className="h-5 w-5 text-[#ff4d8b] flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold">Order Cancelled</h4>
          <p className="text-xs text-[#ff4d8b]/90 mt-1">
            {timeline.find((t) => t.status === 'Cancelled')?.note || 'This order reservation has been cancelled.'}
          </p>
          <span className="text-[11px] text-[#ff4d8b]/70 mt-1 block">
            {formatDateTime(timeline.find((t) => t.status === 'Cancelled')?.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#e5e5e5] w-full z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#0a0a0a] transition-all duration-500 z-0"
          style={{ width: `${Math.max(0, (currentIndex / (STEPS.length - 1)) * 100)}%` }}
        />

        {STEPS.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const entry = timeline.find((t) => t.status === step);

          return (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  isDone
                    ? 'bg-[#0a0a0a] text-white'
                    : 'bg-[#fffaf0] border border-[#e5e5e5] text-[#9a9a9a]'
                } ${isCurrent ? 'ring-4 ring-[#e5e5e5]' : ''}`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : idx + 1}
              </div>
              <span
                className={`text-xs mt-2 font-medium ${
                  isDone ? 'text-[#0a0a0a]' : 'text-[#9a9a9a]'
                }`}
              >
                {step}
              </span>
              {entry?.timestamp && (
                <span className="text-[10px] text-[#9a9a9a] mt-0.5 whitespace-nowrap">
                  {new Date(entry.timestamp).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
