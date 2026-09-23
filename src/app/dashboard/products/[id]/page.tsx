'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import Loader from '@/components/ui/Loader';
import { useProductLocalStore } from '@/context/ProductLocalStore';
import productService from '@/services/productService';
import { Product } from '@/types/product';
import {
  ArrowLeft,
  CheckCircle2,
  Package,
  ShieldCheck,
  Star,
  Tag,
  Truck,
  User,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { getLocalProductById, isProductDeleted, getEditedProduct } = useProductLocalStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setIsLoading(true);
    setIsNotFound(false);

    // If product was locally deleted, trigger not-found state immediately
    if (isProductDeleted(id)) {
      setIsLoading(false);
      setIsNotFound(true);
      return;
    }

    // First check local optimistic store if created locally
    const localProduct = getLocalProductById(id);
    if (localProduct) {
      setProduct(localProduct);
      setActiveImage(localProduct.thumbnail || localProduct.images?.[0] || '');
      setIsLoading(false);
      return;
    }

    // Otherwise fetch from API
    productService
      .getProductById(id)
      .then((data) => {
        if (isMounted) {
          const localEdits = getEditedProduct(id);
          const finalProduct = localEdits ? { ...data, ...localEdits } : data;
          setProduct(finalProduct);
          setActiveImage(finalProduct.thumbnail || finalProduct.images?.[0] || '');
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsNotFound(true);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, getLocalProductById, isProductDeleted, getEditedProduct]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Back Navigation Link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-sky-400 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          {isLoading ? (
            <div className="py-20 flex justify-center items-center">
              <Loader size="lg" text="Loading product details..." />
            </div>
          ) : isNotFound || !product ? (
            /* Styled Not Found State */
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center my-8 space-y-4">
              <div className="w-16 h-16 bg-rose-950/50 border border-rose-900/40 rounded-2xl flex items-center justify-center text-rose-400 mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-100">
                Product Not Found
              </h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                The product with ID <code className="text-rose-300">{id}</code> does
                not exist or may have been deleted.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            /* Product Content Grid */
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
                {/* Left Column: Image Gallery Switcher */}
                <div className="space-y-4">
                  <div className="w-full h-80 sm:h-96 bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden flex items-center justify-center relative">
                    {/* eslint-disable-next-next/no-img-element */}
                    <img
                      src={activeImage || product.thumbnail}
                      alt={product.title}
                      className="w-full h-full object-contain p-4"
                    />
                  </div>

                  {/* Thumbnail Row */}
                  {product.images && product.images.length > 1 && (
                    <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                      {product.images.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImage(imgUrl)}
                          className={`w-16 h-16 rounded-xl border overflow-hidden shrink-0 transition-all ${
                            activeImage === imgUrl
                              ? 'border-sky-500 ring-2 ring-sky-500/40'
                              : 'border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Key Meta, Price, Ratings & Specs */}
                <div className="space-y-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-sky-950/60 text-sky-300 border border-sky-800/40 text-xs font-semibold rounded-lg capitalize">
                        {product.category}
                      </span>
                      {product.brand && (
                        <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-medium rounded-lg">
                          Brand: {product.brand}
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 leading-tight">
                      {product.title}
                    </h1>

                    {/* Price & Rating */}
                    <div className="flex items-center space-x-4 pt-1">
                      <span className="text-3xl font-black text-slate-100">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.discountPercentage && (
                        <span className="px-2.5 py-1 bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 text-xs font-bold rounded-lg">
                          {product.discountPercentage}% OFF
                        </span>
                      )}
                      <div className="flex items-center space-x-1 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-lg text-amber-400">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span className="text-xs font-bold text-slate-200">
                          {product.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed pt-2">
                      {product.description}
                    </p>
                  </div>

                  {/* Stock Status & Badges */}
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-slate-400">Availability:</span>
                      <span
                        className={`font-semibold ${
                          product.stock > 0
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {product.stock > 0
                          ? `In Stock (${product.stock} units available)`
                          : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Features list icons */}
                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-400">
                      <div className="flex items-center space-x-2">
                        <Truck className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>
                          {product.shippingInformation || 'Fast Delivery Available'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>
                          {product.warrantyInformation || '1 Year Warranty'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>
                          {product.returnPolicy || '30-Day Money Back'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>SKU: {product.sku || `PRD-${product.id}`}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              {product.reviews && product.reviews.length > 0 && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span>Customer Reviews ({product.reviews.length})</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.reviews.map((rev, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center text-slate-300">
                              <User className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-semibold text-slate-200">
                              {rev.reviewerName}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-amber-400 text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{rev.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 italic">
                          “{rev.comment}”
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(rev.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
