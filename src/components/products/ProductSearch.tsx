'use client';

import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

interface ProductSearchProps {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  delayMs?: number;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search products by title or brand...',
  delayMs = 400,
}) => {
  const [searchTerm, setSearchTerm] = useState(value);

  // Sync internal state when external value changes (e.g. URL query param change)
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Debounce search input to avoid spamming API calls on fast typing
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== value) {
        onChange(searchTerm);
      }
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, onChange, value, delayMs]);

  const handleClear = () => {
    setSearchTerm('');
    onChange('');
  };

  return (
    <div className="relative flex-1">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
          title="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ProductSearch;
