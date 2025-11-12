import React from 'react';

export default function LoadingSkeleton({ className = 'h-8 w-8', text = 'Loading...' }) {
  return (
    <div className={`flex items-center gap-3 text-gray-500 ${className}`} role="status" aria-live="polite">
      <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">{text}</span>
    </div>
  );
}
