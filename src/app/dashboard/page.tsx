'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import ProductSearch from '@/components/products/ProductSearch';
import ProductFilters from '@/components/products/ProductFilters';
import ProductTable from '@/components/products/ProductTable';
import ProductCardGrid from '@/components/products/ProductCardGrid';
import ProductPagination from '@/components/products/ProductPagination';
import ProductModal from '@/components/products/ProductModal';
import DeleteConfirmModal from '@/components/products/DeleteConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Loader from '@/components/ui/Loader';
import { CardSkeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { useProductLocalStore } from '@/context/ProductLocalStore';
import productService from '@/services/productService';
import { Product, ProductFormData } from '@/types/product';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local optimistic store
  const {
    addLocalProduct,
    updateLocalProduct,
    deleteLocalProduct,
    mergeWithApiProducts,
  } = useProductLocalStore();

  // API Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Ref to hold current AbortController for race condition prevention
  const abortControllerRef = useRef<AbortController | null>(null);

  // Parse and sanitize URL search parameters
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const limitParam = parseInt(searchParams.get('limit') || '10', 10);
  const limit = [10, 20, 50].includes(limitParam) ? limitParam : 10;

  const skip = (currentPage - 1) * limit;
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sortBy = searchParams.get('sortBy') || '';
  const order = (searchParams.get('order') as 'asc' | 'desc') || 'asc';
  const delayParam = parseInt(searchParams.get('delay') || '0', 10);

  // Helper to update URL search parameters seamlessly
  const updateQueryParams = useCallback(
    (newParams: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === '' || value === undefined) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      router.push(`/dashboard?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Fetch product list with abort cancellation handling
  const fetchProducts = useCallback(async () => {
    // Abort previous in-flight request if present
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await productService.getProducts(
        {
          limit,
          skip,
          search,
          category,
          sortBy,
          order,
          delay: delayParam > 0 ? delayParam : undefined,
        },
        controller.signal
      );

      // Merge API results with optimistic local store additions/edits/deletions
      const { products: merged, total: adjustedTotal } = mergeWithApiProducts(
        response.products,
        response.total
      );

      setProducts(merged);
      setTotalCount(adjustedTotal);
    } catch (err: unknown) {
      // Ignore abort/cancel errors (from AbortController signal or axios.isCancel)
      if (axios.isCancel(err)) return;
      if (err instanceof Error && (err.name === 'CanceledError' || err.name === 'AbortError')) {
        return;
      }
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to load products from server.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    limit,
    skip,
    search,
    category,
    sortBy,
    order,
    delayParam,
    mergeWithApiProducts,
  ]);

  useEffect(() => {
    fetchProducts();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  // Handlers for URL Query Updates
  const handleSearchChange = (newSearch: string) => {
    updateQueryParams({
      search: newSearch,
      page: 1, // Reset to page 1 on search change
    });
  };

  const handleCategoryChange = (newCategory: string) => {
    updateQueryParams({
      category: newCategory,
      page: 1, // Reset to page 1 on category change
    });
  };

  const handleSortChange = (newSortBy: string, newOrder: 'asc' | 'desc') => {
    updateQueryParams({
      sortBy: newSortBy,
      order: newOrder,
      page: 1,
    });
  };

  const handlePageChange = (newSkip: number) => {
    const newPage = Math.floor(newSkip / limit) + 1;
    updateQueryParams({ page: newPage });
  };

  const handleLimitChange = (newLimit: number) => {
    updateQueryParams({
      limit: newLimit,
      page: 1, // Reset to page 1 when changing page size
    });
  };

  const handleResetFilters = () => {
    router.push('/dashboard');
  };

  // CRUD Handlers
  const handleOpenAddModal = () => {
    setProductToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setProductToEdit(product);
    setIsAddEditModalOpen(true);
  };

  const handleSaveProduct = async (
    formData: ProductFormData,
    isEditMode: boolean
  ) => {
    if (isEditMode && productToEdit) {
      try {
        await productService.updateProduct(productToEdit.id, formData);
      } catch {
        // Fallback to local update
      }
      updateLocalProduct(productToEdit.id, formData);
    } else {
      try {
        await productService.addProduct(formData);
      } catch {
        // Fallback to local update
      }
      addLocalProduct(formData);
    }

    fetchProducts();
  };

  const handleDeleteConfirm = async (product: Product) => {
    try {
      await productService.deleteProduct(product.id);
    } catch {
      // Fallback to local update
    }
    deleteLocalProduct(product.id);
    setProductToDelete(null);
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar onAddProductClick={handleOpenAddModal} />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header & Quick Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Products Inventory
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage, filter, and review catalog items in real-time
            </p>
          </div>
        </div>

        {/* Control Bar: Search + Filters */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md shadow-lg space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <ProductSearch
              value={search}
              onChange={handleSearchChange}
              placeholder="Search products by title or brand..."
            />

            <ProductFilters
              selectedCategory={category}
              onCategoryChange={handleCategoryChange}
              sortBy={sortBy}
              order={order}
              onSortChange={handleSortChange}
              isSearchActive={Boolean(search)}
            />
          </div>
        </div>

        {/* Product Data View */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              <TableSkeleton rows={limit} />
              <CardSkeleton count={4} />
            </>
          ) : errorMsg ? (
            <ErrorState message={errorMsg} onRetry={fetchProducts} />
          ) : products.length === 0 ? (
            <EmptyState onReset={handleResetFilters} />
          ) : (
            <>
              {/* Table View (Desktop) */}
              <ProductTable
                products={products}
                onEdit={handleOpenEditModal}
                onDelete={(prod) => setProductToDelete(prod)}
              />

              {/* Card View (Mobile) */}
              <ProductCardGrid
                products={products}
                onEdit={handleOpenEditModal}
                onDelete={(prod) => setProductToDelete(prod)}
              />

              {/* Pagination */}
              <ProductPagination
                total={totalCount}
                limit={limit}
                skip={skip}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      <ProductModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSubmit={handleSaveProduct}
        productToEdit={productToEdit}
      />

      <DeleteConfirmModal
        isOpen={Boolean(productToDelete)}
        product={productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Loader size="lg" text="Loading dashboard..." />
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}
