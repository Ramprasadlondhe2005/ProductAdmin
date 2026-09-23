# Product Admin Dashboard 🚀

A modern, high-performance **Product Admin Dashboard** built with **Next.js 14 (App Router)**, **React**, **Tailwind CSS**, and **Axios**, using the free [DummyJSON API](https://dummyjson.com).

Designed with production-grade craftsmanship, responsive layout (Desktop table + Mobile card view), clean component architecture, URL query-synced state, debounced search with `AbortController` race-condition cancellation, and an optimistic local store for simulated mutations.

---

## 🌐 Live Demo

[Live Vercel / Netlify Deployment](https://product-admin-dashboard-demo.vercel.app)  
*(Note: Replace this URL with your actual deployed Vercel/Netlify link after pushing to deployment)*

---

## 🛠️ Tech Stack & Requirements Summary

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Dark Mode Glassmorphism & Custom Styling Tokens)
- **HTTP Client**: Axios (Single shared setup file with Request/Response Interceptors)
- **Icons**: Lucide React
- **Libraries Policy**: **0** third-party table, pagination, or state management libraries used (No React Query, SWR, Redux, Zustand, or ready-made table/pagination packages).

---

## ✨ Features Implemented

### 1. Authentication & Route Protection
- **Login Page (`/login`)**: Supports logging in with `emilys` / `emilyspass` (`POST /auth/login`).
- **Interactive Quick-Fill Badge**: One-click fill button for test credentials.
- **Route Guard (`ProtectedRoute`)**: Unauthenticated users are automatically redirected to `/login`. Logged-in users attempting to open `/login` are sent directly to `/dashboard`.
- **Global Error Handling**: Displays clear error banners for invalid credentials or network issues.
- **Double-Submit Guard**: Buttons enter a loading spinner state while submitting, preventing duplicate API calls on rapid clicks.
- **Logout Action**: Clears JWT tokens from `localStorage` and redirects to `/login`.

### 2. Product Listing (Desktop Table & Mobile Cards)
- **Desktop Table View (`ProductTable.tsx`)**: Formatted columns for Image thumbnail, Title & Brand, Category badge, Price (USD currency formatted), Rating (Star indicator), Stock status pill, and action controls (View, Edit, Delete).
- **Mobile Card View (`ProductCardGrid.tsx`)**: Responsive, touch-friendly card grid visible on mobile screens (`< 768px`).

### 3. Custom Server-Side Pagination
- Loads data page-by-page using DummyJSON `limit` and `skip` parameters.
- **Page Size Options**: Selectable dropdown (`10`, `20`, `50` items per page).
- **Dynamic Range Label**: Real-time counter showing `Showing 21–40 of 194`.
- **Smart Page Controls**: Previous/Next buttons and page numbers with dynamic ellipsis truncation (`1 ... 4 5 6 ... 20`).

### 4. Debounced Search & Out-of-Order Request Prevention
- **Debounced Input (`ProductSearch.tsx`)**: Delays API call by 400ms after the user stops typing.
- **Search Resets Page**: Automatically resets pagination back to page 1 on query changes.
- **Race Condition Guard (`AbortController`)**: In-flight requests are automatically aborted when a new search query is typed. Fast typing with delayed responses (tested with `&delay=2000`) will **never** overwrite newer search results.

### 5. Filtering & Sorting
- **Category Filter (`ProductFilters.tsx`)**: Populated dynamically from `/products/categories`.
- **Sort Selectors**: Supports sorting by `Price: Low to High`, `Price: High to Low`, `Rating: High to Low`, `Title: A to Z`, and `Title: Z to A`.

### 6. Product Detail View (`/dashboard/products/[id]`)
- Displays product image gallery switcher, full description, price & discount badges, stock availability status, shipping/warranty info, SKU, and customer reviews list.
- **Styled Not Found State**: Displays a custom "Product Not Found" screen with a return link if an invalid product ID is opened.

### 7. CRUD Operations & Modal Validation
- **Add & Edit Modal (`ProductModal.tsx`)**: Modal form with strict validation for title (min 3 chars), category, price (> 0), stock (>= 0), and rating (0-5).
- **Delete Confirmation Dialog (`DeleteConfirmModal.tsx`)**: Confirmation popup before deleting any product.

### 8. Loading, Empty, and Error States
- **Skeleton Loaders**: Smooth animated table skeleton and card skeleton during data fetching.
- **Empty State**: Graphic and message displayed when zero products match the filter/search, with a "Clear Filters" button.
- **Error State**: Error message card with a working **Retry** button on network/API failures.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── products/[id]/
│   │       └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx
│   ├── layout/
│   │   └── Navbar.tsx
│   ├── products/
│   │   ├── DeleteConfirmModal.tsx
│   │   ├── ProductCardGrid.tsx
│   │   ├── ProductFilters.tsx
│   │   ├── ProductModal.tsx
│   │   ├── ProductPagination.tsx
│   │   ├── ProductSearch.tsx
│   │   └── ProductTable.tsx
│   └── ui/
│       ├── EmptyState.tsx
│       ├── ErrorState.tsx
│       ├── Loader.tsx
│       └── Skeleton.tsx
├── context/
│   ├── AuthContext.tsx
│   └── ProductLocalStore.tsx
├── lib/
│   └── axios.ts
├── services/
│   ├── authService.ts
│   └── productService.ts
└── types/
    ├── auth.ts
    └── product.ts
```

---

## 💡 Important Trade-offs & Implementation Decisions

### 1. Search Race-Condition Handling (`AbortController` + Debounce)
- **Problem Faced**: Fast typing (e.g., typing `phone` and then quickly `iphone`) triggers multiple HTTP requests. If network jitter causes the first request (`phone`) to take longer to return than the second request (`iphone`), the older response will arrive later and overwrite the UI with stale data.
- **Solution**: We combined a 400ms input debounce with a native `AbortController` ref attached to each `getProducts` request. When a new query is submitted, `abortControllerRef.current.abort()` immediately cancels the previous in-flight request. The Axios interceptor and `fetchProducts` catch block ignore cancelled request errors and ensure only the latest request updates state. Verified under artificial delay conditions using DummyJSON `&delay=2000`.

### 2. DummyJSON API Limitation: Search vs Category Filter
- **Issue**: The DummyJSON API does not natively support combining `/products/search?q=` and `/products/category/{category}` in a single server-side query.
- **Our Solution**:
  - When search text is typed, the app prioritizes the Search API endpoint (`/products/search?q=...`) to return relevant query results.
  - When only a category is selected (without search text), the app uses the Category API endpoint (`/products/category/...`).
  - An inline info badge ("Search priority active") appears in the UI when both are selected to keep the user informed.

### 3. Simulated Mutation Persistence (`ProductLocalStore`)
- **Issue**: DummyJSON API calls for `POST /products/add`, `PUT /products/{id}`, and `DELETE /products/{id}` return simulated success objects but do not persist changes on the server.
- **Our Solution**:
  - We implemented an **Optimistic Local Store Context (`ProductLocalStore`)** that overlays user additions, edits, and deletions on top of API responses.
  - Newly created products are assigned a unique local ID (e.g. `local-1718000000`) and prepended to the product list (filtered by active search/category).
  - Updated fields overwrite API values, and deleted IDs are filtered out seamlessly throughout the user session (persisted in `sessionStorage`).

### 4. Graceful URL Sync & Recovery from Invalid Params
- All filter parameters (`page`, `limit`, `search`, `category`, `sortBy`, `order`, `delay`) are reflected in the URL query string (`/dashboard?page=2&limit=20&search=phone`).
- **Error Recovery**: Invalid URL parameters (e.g. `?page=abc`, `?page=99999`, `?limit=invalid`, `?sortBy=invalid`) are automatically sanitized to safe defaults (`page=1`, `limit=10`, `sortBy=''`) without crashing the application.

---

## 🧩 Problem Faced & How I Fixed It

One problem I faced was handling multiple search requests when the user typed quickly. A previous request could finish after the latest request and incorrectly replace the newer search results.

I fixed this by using a debounced search input together with `AbortController`. The search API is called only after the user stops typing for a short period, and the previous in-flight request is cancelled when a new search starts. This ensures that older search results cannot overwrite the latest results.

I also tested this scenario using DummyJSON's `delay` parameter to simulate slow API responses.

---

## 🚀 Getting Started & Local Development

### Prerequisites
- Node.js 18+ and npm installed on your machine.

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Ramprasadlondhe2005/ProductAdmin.git
   cd ProductAdmin
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🤖 AI Usage Disclosure

- **AI Assistance**: AI tools were utilized to quickly scaffold TypeScript type definitions, initial Tailwind CSS UI container layout, and boilerplate structure.
- **Code Ownership & Review**: Every core algorithm—including Axios interceptor token injection, `AbortController` cancellation logic, custom pagination state calculation, URL `searchParams` sanitizer, and `ProductLocalStore` session state overlay—was reviewed, manually tested, and fully understood.

---

## 📋 Assignment Compliance Checklist

- [x] Next.js + React + Tailwind CSS + Axios
- [x] Authentication (`emilys` / `emilyspass` with `POST /auth/login`)
- [x] Wrong login error handling
- [x] Protected routes (`ProtectedRoute`)
- [x] Logout functionality
- [x] Product listing (image, title, category, price, rating, stock)
- [x] Desktop table + Mobile cards view
- [x] Pagination with API `limit` and `skip`
- [x] Page sizes (10, 20, 50)
- [x] Prev / Next / Page numbers
- [x] Range text (`Showing 21–40 of 194`)
- [x] Search using `/products/search?q=`
- [x] Debounced search (resets to page 1)
- [x] Race condition protection (`AbortController` cancels stale requests)
- [x] Category filtering (`/products/categories`)
- [x] Sorting (Price, Rating, Title asc/desc)
- [x] Product details page (`/products/[id]`)
- [x] Product images, description, price, stock & reviews
- [x] Proper not-found state for invalid product ID
- [x] Add, edit, and delete products
- [x] Form validation (title, price, rating, stock, category)
- [x] Delete confirmation popup
- [x] Loading, empty, and error states with Retry button
- [x] One shared Axios setup (`apiClient`) with request token interceptor
- [x] Centralized Axios error handling
- [x] API calls separated from UI components (`productService`, `authService`)
- [x] Page/search/filter/sort state stored in URL query parameters
- [x] Invalid URL parameter recovery (`?page=abc`, `?page=999999`)
- [x] No React Query, SWR, Zustand, Redux, or third-party table/pagination libraries
- [x] DummyJSON search vs category limitation handled & documented
- [x] Local CRUD persistence strategy (`sessionStorage` overlay)
- [x] Rapid click / double-submit prevention
