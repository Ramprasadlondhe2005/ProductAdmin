'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { Edit3, Eye, Star, Trash2 } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="hidden md:block w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Price</th>
              <th className="py-3.5 px-4">Rating</th>
              <th className="py-3.5 px-4">Stock</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {products.map((product) => {
              const formattedPrice = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(product.price);

              const isLowStock = product.stock <= 5;

              return (
                <tr
                  key={String(product.id)}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Thumbnail & Title */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center">
                        {/* eslint-disable-next-next/no-img-element */}
                        <img
                          src={product.thumbnail || product.images?.[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div>
                        <Link
                          href={`/dashboard/products/${product.id}`}
                          className="font-medium text-slate-100 hover:text-sky-400 transition-colors line-clamp-1"
                        >
                          {product.title}
                        </Link>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {product.brand || 'Generic'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-sky-300 border border-slate-700/60 capitalize">
                      {product.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4 font-semibold text-slate-100">
                    {formattedPrice}
                  </td>

                  {/* Rating */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1 text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span className="text-xs font-semibold text-slate-200">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        product.stock > 0
                          ? isLowStock
                            ? 'bg-amber-950/50 text-amber-300 border-amber-800/40'
                            : 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40'
                          : 'bg-rose-950/50 text-rose-300 border-rose-800/40'
                      }`}
                    >
                      {product.stock > 0
                        ? `${product.stock} in stock`
                        : 'Out of Stock'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => onEdit(product)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(product)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
