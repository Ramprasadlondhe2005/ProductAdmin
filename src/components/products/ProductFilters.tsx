'use client';

import React, { useEffect, useState } from 'react';
import { CategoryItem } from '@/types/product';
import productService from '@/services/productService';
import { Filter, SlidersHorizontal } from 'lucide-react';

interface ProductFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  order: 'asc' | 'desc';
  onSortChange: (sortBy: string, order: 'asc' | 'desc') => void;
  isSearchActive?: boolean;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  selectedCategory,
  onCategoryChange,
  sortBy,
  order,
  onSortChange,
  isSearchActive = false,
}) => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingCategories(true);
    productService
      .getCategories()
      .then((data) => {
        if (isMounted) {
          setCategories(data);
        }
      })
      .catch(() => {
        // Fallback silently if categories call fails
      })
      .finally(() => {
        if (isMounted) setIsLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSortSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      onSortChange('', 'asc');
      return;
    }
    const [field, sortOrder] = val.split('-');
    onSortChange(field, sortOrder as 'asc' | 'desc');
  };

  const currentSortValue = sortBy ? `${sortBy}-${order}` : '';

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Category Dropdown */}
      <div className="relative min-w-[160px] flex-1 sm:flex-initial">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Filter className="w-4 h-4" />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          disabled={isLoadingCategories}
          className="w-full pl-9 pr-8 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all cursor-pointer appearance-none"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          ▼
        </div>
      </div>

      {/* Sort By Dropdown */}
      <div className="relative min-w-[160px] flex-1 sm:flex-initial">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <SlidersHorizontal className="w-4 h-4" />
        </div>
        <select
          value={currentSortValue}
          onChange={handleSortSelect}
          className="w-full pl-9 pr-8 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all cursor-pointer appearance-none"
        >
          <option value="">Sort By: Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Rating: High to Low</option>
          <option value="title-asc">Title: A to Z</option>
          <option value="title-desc">Title: Z to A</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          ▼
        </div>
      </div>

      {/* API Notice Badge when both search and category are active */}
      {isSearchActive && selectedCategory && (
        <span
          className="text-xs text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-lg"
          title="DummyJSON API uses Search endpoint when search text is present"
        >
          Search priority active
        </span>
      )}
    </div>
  );
};

export default ProductFilters;
