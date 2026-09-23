import React from 'react';
import { PackageSearch, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No products found',
  description = 'We couldn’t find any products matching your active filter or search query.',
  onReset,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl my-4">
      <div className="w-16 h-16 bg-slate-800/80 rounded-2xl flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        <PackageSearch className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      <p className="mt-1 text-sm text-slate-400 max-w-md">{description}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="mt-5 inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 text-sm font-medium rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Clear Filters</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
