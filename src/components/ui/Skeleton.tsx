import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 border-b border-slate-800 space-x-4"
        >
          <div className="w-12 h-12 bg-slate-800 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-800 rounded w-2/5" />
            <div className="h-3 bg-slate-800 rounded w-1/4" />
          </div>
          <div className="w-20 h-6 bg-slate-800 rounded" />
          <div className="w-16 h-6 bg-slate-800 rounded" />
          <div className="w-16 h-6 bg-slate-800 rounded" />
          <div className="w-24 h-8 bg-slate-800 rounded-lg" />
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-slate-800/60 p-4 rounded-xl space-y-3">
          <div className="w-full h-40 bg-slate-700/60 rounded-lg" />
          <div className="h-4 bg-slate-700/60 rounded w-3/4" />
          <div className="h-3 bg-slate-700/60 rounded w-1/2" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-5 bg-slate-700/60 rounded w-1/4" />
            <div className="h-8 bg-slate-700/60 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
};
