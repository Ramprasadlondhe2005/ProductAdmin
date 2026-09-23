import apiClient from '@/lib/axios';
import {
  CategoryItem,
  Product,
  ProductFormData,
  ProductListResponse,
  ProductQueryParams,
} from '@/types/product';

export const productService = {
  /**
   * Fetch products based on pagination, search, category, and sorting parameters.
   * Accepts an optional AbortSignal to cancel outdated in-flight requests.
   */
  async getProducts(
    params: ProductQueryParams = {},
    signal?: AbortSignal
  ): Promise<ProductListResponse> {
    const {
      limit = 10,
      skip = 0,
      search = '',
      category = '',
      sortBy = '',
      order = 'asc',
      delay,
    } = params;

    let endpoint = '/products';
    const queryParts: string[] = [`limit=${limit}`, `skip=${skip}`];

    if (search.trim()) {
      endpoint = '/products/search';
      queryParts.push(`q=${encodeURIComponent(search.trim())}`);
    } else if (category.trim()) {
      endpoint = `/products/category/${encodeURIComponent(category.trim())}`;
    }

    if (sortBy) {
      queryParts.push(`sortBy=${sortBy}`);
      queryParts.push(`order=${order}`);
    }

    if (delay && delay > 0) {
      queryParts.push(`delay=${delay}`);
    }

    const queryString = queryParts.length ? `?${queryParts.join('&')}` : '';
    const response = await apiClient.get<ProductListResponse>(
      `${endpoint}${queryString}`,
      { signal }
    );

    return response.data;
  },

  /**
   * Fetch all product categories
   */
  async getCategories(): Promise<CategoryItem[]> {
    const response = await apiClient.get('/products/categories');
    const data = response.data;

    if (Array.isArray(data)) {
      return data.map((item) => {
        if (typeof item === 'string') {
          return {
            slug: item,
            name: item.replace(/-/g, ' ').toUpperCase(),
            url: `/products/category/${item}`,
          };
        } else if (item && typeof item === 'object') {
          return {
            slug: item.slug || item.name || String(item),
            name: item.name || item.slug || String(item),
            url: item.url || `/products/category/${item.slug}`,
          };
        }
        return { slug: String(item), name: String(item), url: '#' };
      });
    }

    return [];
  },

  /**
   * Get single product details by ID
   */
  async getProductById(id: string | number): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  /**
   * Add a new product (simulated by DummyJSON API)
   */
  async addProduct(productData: ProductFormData): Promise<Product> {
    const response = await apiClient.post<Product>('/products/add', productData);
    return response.data;
  },

  /**
   * Update an existing product (simulated by DummyJSON API)
   */
  async updateProduct(
    id: string | number,
    productData: Partial<ProductFormData>
  ): Promise<Product> {
    const response = await apiClient.put<Product>(
      `/products/${id}`,
      productData
    );
    return response.data;
  },

  /**
   * Delete a product by ID (simulated by DummyJSON API)
   */
  async deleteProduct(id: string | number): Promise<{ id: number; isDeleted: boolean }> {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;
