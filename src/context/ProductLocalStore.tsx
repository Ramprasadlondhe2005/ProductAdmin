'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, ProductFormData } from '@/types/product';

interface ProductLocalStoreType {
  addedProducts: Product[];
  editedProducts: Record<string | number, Partial<Product>>;
  deletedProductIds: Set<string | number>;
  addLocalProduct: (formData: ProductFormData) => Product;
  updateLocalProduct: (id: string | number, formData: Partial<ProductFormData>) => void;
  deleteLocalProduct: (id: string | number) => void;
  mergeWithApiProducts: (
    apiProducts: Product[],
    total: number,
    filters?: { search?: string; category?: string }
  ) => { products: Product[]; total: number };
  getLocalProductById: (id: string | number) => Product | null;
  isProductDeleted: (id: string | number) => boolean;
  getEditedProduct: (id: string | number) => Partial<Product> | null;
}

const ProductLocalStoreContext = createContext<ProductLocalStoreType | undefined>(
  undefined
);

const LOCAL_STORAGE_KEY = 'product_local_override_store';

interface StoredData {
  added: Product[];
  edited: Record<string | number, Partial<Product>>;
  deleted: (string | number)[];
}

export const ProductLocalStoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [addedProducts, setAddedProducts] = useState<Product[]>([]);
  const [editedProducts, setEditedProducts] = useState<
    Record<string | number, Partial<Product>>
  >({});
  const [deletedProductIds, setDeletedProductIds] = useState<
    Set<string | number>
  >(new Set());

  // Load local edits on initial mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed: StoredData = JSON.parse(raw);
        if (parsed.added) setAddedProducts(parsed.added);
        if (parsed.edited) setEditedProducts(parsed.edited);
        if (parsed.deleted) setDeletedProductIds(new Set(parsed.deleted));
      }
    } catch {
      // Fallback cleanly
    }
  }, []);

  // Save changes to sessionStorage
  const saveToSessionStorage = (
    added: Product[],
    edited: Record<string | number, Partial<Product>>,
    deleted: Set<string | number>
  ) => {
    try {
      const payload: StoredData = {
        added,
        edited,
        deleted: Array.from(deleted),
      };
      sessionStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore fallback
    }
  };

  const addLocalProduct = (formData: ProductFormData): Product => {
    const newProduct: Product = {
      id: `local-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      price: Number(formData.price),
      rating: Number(formData.rating) || 4.5,
      stock: Number(formData.stock),
      brand: formData.brand || 'Custom Brand',
      thumbnail: formData.thumbnail || 'https://cdn.dummyjson.com/product-images/1/thumbnail.jpg',
      images: [
        formData.thumbnail || 'https://cdn.dummyjson.com/product-images/1/thumbnail.jpg',
      ],
      isLocal: true,
      reviews: [],
    };

    const nextAdded = [newProduct, ...addedProducts];
    setAddedProducts(nextAdded);
    saveToSessionStorage(nextAdded, editedProducts, deletedProductIds);
    return newProduct;
  };

  const updateLocalProduct = (
    id: string | number,
    formData: Partial<ProductFormData>
  ) => {
    const isAddedProduct = addedProducts.some((p) => String(p.id) === String(id));

    if (isAddedProduct) {
      const nextAdded = addedProducts.map((p) =>
        String(p.id) === String(id) ? { ...p, ...formData } : p
      );
      setAddedProducts(nextAdded);
      saveToSessionStorage(nextAdded, editedProducts, deletedProductIds);
    } else {
      const nextEdited = {
        ...editedProducts,
        [id]: { ...(editedProducts[id] || {}), ...formData },
      };
      setEditedProducts(nextEdited);
      saveToSessionStorage(addedProducts, nextEdited, deletedProductIds);
    }
  };

  const deleteLocalProduct = (id: string | number) => {
    const isAddedProduct = addedProducts.some((p) => String(p.id) === String(id));

    if (isAddedProduct) {
      const nextAdded = addedProducts.filter((p) => String(p.id) !== String(id));
      setAddedProducts(nextAdded);
      saveToSessionStorage(nextAdded, editedProducts, deletedProductIds);
    } else {
      const nextDeleted = new Set(deletedProductIds);
      nextDeleted.add(id);
      nextDeleted.add(String(id));
      setDeletedProductIds(nextDeleted);
      saveToSessionStorage(addedProducts, editedProducts, nextDeleted);
    }
  };

  const isProductDeleted = (id: string | number): boolean => {
    return deletedProductIds.has(id) || deletedProductIds.has(String(id));
  };

  const getEditedProduct = (id: string | number): Partial<Product> | null => {
    return editedProducts[id] || editedProducts[String(id)] || null;
  };

  const getLocalProductById = (id: string | number): Product | null => {
    if (isProductDeleted(id)) return null;
    const added = addedProducts.find((p) => String(p.id) === String(id));
    if (added) {
      const edits = getEditedProduct(id);
      return edits ? { ...added, ...edits } : added;
    }
    return null;
  };

  const mergeWithApiProducts = (
    apiProducts: Product[],
    total: number,
    filters?: { search?: string; category?: string }
  ): { products: Product[]; total: number } => {
    // 1. Filter out deleted products
    let filtered = apiProducts.filter(
      (p) => !isProductDeleted(p.id)
    );

    // 2. Apply edited properties to API products
    filtered = filtered.map((p) => {
      const edits = getEditedProduct(p.id);
      if (edits) {
        return { ...p, ...edits };
      }
      return p;
    });

    // 3. Filter added products according to search/category filters
    let activeAdded = addedProducts.filter(
      (p) => !isProductDeleted(p.id)
    );

    if (filters?.search && filters.search.trim() !== '') {
      const q = filters.search.trim().toLowerCase();
      activeAdded = activeAdded.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    } else if (filters?.category && filters.category.trim() !== '') {
      const cat = filters.category.trim().toLowerCase();
      activeAdded = activeAdded.filter(
        (p) => p.category.toLowerCase() === cat
      );
    }

    const adjustedTotal = total + activeAdded.length - deletedProductIds.size;

    return {
      products: [...activeAdded, ...filtered],
      total: Math.max(0, adjustedTotal),
    };
  };

  return (
    <ProductLocalStoreContext.Provider
      value={{
        addedProducts,
        editedProducts,
        deletedProductIds,
        addLocalProduct,
        updateLocalProduct,
        deleteLocalProduct,
        mergeWithApiProducts,
        getLocalProductById,
        isProductDeleted,
        getEditedProduct,
      }}
    >
      {children}
    </ProductLocalStoreContext.Provider>
  );
};

export const useProductLocalStore = () => {
  const context = useContext(ProductLocalStoreContext);
  if (!context) {
    throw new Error(
      'useProductLocalStore must be used within a ProductLocalStoreProvider'
    );
  }
  return context;
};
