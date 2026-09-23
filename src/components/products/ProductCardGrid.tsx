'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { Edit3, Eye, Star, Trash2 } from 'lucide-react';

interface ProductCardGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductCardGrid: React.FC<ProductCardGridProps> = ({
  products,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
      {products.map((product) => {
        const formattedPrice = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(product.price);

        const isLowStock = product.stock <= 5;

        return (
          <div
            key={String(product.id)}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-lg"
          >
            {/* Header / Thumbnail & Meta */}
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center">
                {/* eslint-disable-next-next/no-img-element */}
                <img
                  src={product.thumbnail || product.images?.[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-sky-400 capitalize mb-1">
                  {product.category}
                </span>
                <Link
                  href={`/dashboard/products/${product.id}`}
                  className="block font-semibold text-slate-100 text-sm hover:text-sky-400 line-clamp-1"
                >
                  {product.title}
                </Link>
                <div className="flex items-center space-x-1.5 mt-1">
                  <div className="flex items-center space-x-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="text-xs font-semibold text-slate-300">
                      {product.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price & Stock info */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Price
                </p>
                <p className="text-base font-bold text-slate-100">
                  {formattedPrice}
                </p>
              </div>

              <div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                    product.stock > 0
                      ? isLowStock
                        ? 'bg-amber-950/50 text-amber-300 border-amber-800/40'
                        : 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40'
                      : 'bg-rose-950/50 text-rose-300 border-rose-800/40'
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800/60">
              <Link
                href={`/dashboard/products/${product.id}`}
                className="flex-1 py-1.5 flex items-center justify-center space-x-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </Link>
              <button
                onClick={() => onEdit(product)}
                className="py-1.5 px-3 flex items-center justify-center text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 rounded-xl border border-amber-800/40 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(product)}
                className="py-1.5 px-3 flex items-center justify-center text-xs font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 rounded-xl border border-rose-800/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductCardGrid;
