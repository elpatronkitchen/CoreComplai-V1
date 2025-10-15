import React from "react";

export const Card: React.FC<{ title?: string; children: React.ReactNode }> = ({ 
  title, 
  children 
}) => (
  <div className="rounded-2xl border bg-surface shadow-[var(--shadow-card)] p-4">
    {title && <div className="text-lg font-semibold mb-2">{title}</div>}
    {children}
  </div>
);
