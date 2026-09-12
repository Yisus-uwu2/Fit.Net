import React from 'react';

export default function StatusBadge({ status, label }) {
  // status: 'online' | 'offline' | 'syncing'
  let dotColor = 'bg-emerald-500';
  let textColor = 'text-emerald-600 dark:text-emerald-400';

  if (status === 'offline') {
    dotColor = 'bg-rose-500';
    textColor = 'text-rose-600 dark:text-rose-400';
  } else if (status === 'syncing') {
    dotColor = 'bg-amber-500';
    textColor = 'text-amber-600 dark:text-amber-400';
  }

  return (
    <div className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium">
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span className={`font-semibold ${textColor}`}>{label}</span>
    </div>
  );
}
