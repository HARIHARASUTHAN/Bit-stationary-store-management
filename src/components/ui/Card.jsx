import React from 'react';

export default function Card({
  children,
  title,
  subtitle,
  action,
  className = '',
  bodyClassName = 'p-6',
  headerClassName = 'px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between',
  footer,
  footerClassName = 'px-6 py-4 bg-[#faf5e8] border-t border-[#e5e5e5] rounded-b-[16px]',
  ...props
}) {
  return (
    <div
      className={`bg-[#fffaf0] rounded-[16px] border border-[#e5e5e5] transition-all ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className={headerClassName}>
          <div>
            {title && <h3 className="text-base font-medium tracking-[-0.3px] text-[#0a0a0a]">{title}</h3>}
            {subtitle && <p className="text-xs text-[#6a6a6a] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
      {footer && <div className={footerClassName}>{footer}</div>}
    </div>
  );
}
