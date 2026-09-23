'use client';

import React, { useEffect, useState } from 'react';
import { CategoryItem, Product, ProductFormData } from '@/types/product';
import productService from '@/services/productService';
import { Loader2, X } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ProductFormData, isEditMode: boolean) => Promise<void>;
  productToEdit?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  productToEdit,
}) => {
  const isEditMode = Boolean(productToEdit);

  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    category: 'beauty',
    price: 0,
    rating: 4.5,
    stock: 10,
    brand: '',
    thumbnail: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load categories for selector only when modal opens
  useEffect(() => {
    if (isOpen && categories.length === 0) {
      productService
        .getCategories()
        .then((data) => setCategories(data))
        .catch(() => {});
    }
  }, [isOpen, categories.length]);

  // Populate form data if editing
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        title: productToEdit.title || '',
        description: productToEdit.description || '',
        category: productToEdit.category || 'beauty',
        price: productToEdit.price || 0,
        rating: productToEdit.rating || 4.5,
        stock: productToEdit.stock || 0,
        brand: productToEdit.brand || '',
        thumbnail: productToEdit.thumbnail || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'beauty',
        price: 29.99,
        rating: 4.5,
        stock: 15,
        brand: '',
        thumbnail: '',
      });
    }
    setErrors({});
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.title.trim() || formData.title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters long.';
    }

    if (!formData.category) {
      errs.category = 'Please select a category.';
    }

    if (isNaN(formData.price) || formData.price <= 0) {
      errs.price = 'Price must be greater than 0.';
    }

    if (isNaN(formData.stock) || formData.stock < 0) {
      errs.stock = 'Stock must be 0 or greater.';
    }

    if (isNaN(formData.rating) || formData.rating < 0 || formData.rating > 5) {
      errs.rating = 'Rating must be between 0 and 5.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Guard against multiple fast clicks

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSubmit(formData, isEditMode);
      onClose();
    } catch {
      setErrors({ form: 'Failed to save product. Please check your network.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errors.form && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-xl">
              {errors.form}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g. Wireless Bluetooth Headphones"
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-400">{errors.title}</p>
            )}
          </div>

          {/* Category & Brand grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 capitalize"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-rose-400">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, brand: e.target.value }))
                }
                placeholder="e.g. Sony"
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Price, Stock, Rating grid */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Price ($) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {errors.price && (
                <p className="mt-1 text-[10px] text-rose-400">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Stock <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    stock: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {errors.stock && (
                <p className="mt-1 text-[10px] text-rose-400">{errors.stock}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Rating (0-5)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    rating: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {errors.rating && (
                <p className="mt-1 text-[10px] text-rose-400">{errors.rating}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Brief product details..."
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Image URL (optional)
            </label>
            <input
              type="text"
              value={formData.thumbnail}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, thumbnail: e.target.value }))
              }
              placeholder="https://images.example.com/product.jpg"
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg transition-all"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditMode ? 'Update Product' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
