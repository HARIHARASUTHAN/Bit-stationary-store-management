import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-lg',
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-[#0a0a0a]/50 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        {/* Dialog content */}
        <div
          className={`relative w-full ${maxWidth} transform overflow-hidden rounded-[24px] bg-[#fffaf0] border border-[#e5e5e5] text-left shadow-2xl transition-all z-10`}
        >
          {title && (
            <div className="flex items-center justify-between border-b border-[#e5e5e5] px-6 py-5 bg-[#faf5e8]">
              <div>
                <h3 className="text-lg font-medium tracking-[-0.5px] text-[#0a0a0a]">{title}</h3>
                {subtitle && <p className="text-xs text-[#6a6a6a] mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-[#6a6a6a] hover:bg-[#f5f0e0] hover:text-[#0a0a0a] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="px-6 py-5">{children}</div>
          {footer && (
            <div className="flex items-center justify-end gap-3 border-t border-[#e5e5e5] bg-[#faf5e8] px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
