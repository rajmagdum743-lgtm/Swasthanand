import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { API_BASE_URL } from '../config/api';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  batchId: string;
  category: string;
  description: string;
  origin: string;
  sku?: string;
  stock?: number;
  harvestDate?: string;
  weatherTemp?: string;
  growthQuality?: string;
  organicMatter?: string;
  nitrogen?: string;
  zeroPesticides?: string;
  certificateUrl?: string;
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  categories: string[];
  isOffline: boolean;         // true when showing cached data (backend unreachable)
  lastSynced: string | null;  // human-readable timestamp of last successful sync
  refreshProducts: () => void;
}

// ─── Cache helpers ────────────────────────────────────────────────────────────
const CACHE_KEY      = 'swasthanand_products_cache_v1';
const CACHE_TIME_KEY = 'swasthanand_products_sync_time';

const loadCache = (): Product[] => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
};

const saveCache = (products: Product[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(products));
    localStorage.setItem(CACHE_TIME_KEY, new Date().toISOString());
  } catch { /* storage full — ignore */ }
};

const getSyncLabel = (): string | null => {
  try {
    const raw = localStorage.getItem(CACHE_TIME_KEY);
    if (!raw) return null;
    return new Date(raw).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return null;
  }
};

const buildCategories = (products: Product[]): string[] => {
  const unique = Array.from(new Set(products.map(p => p.category))) as string[];
  return ['All', ...unique.sort()];
};
// ─────────────────────────────────────────────────────────────────────────────

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialise from cache IMMEDIATELY — products appear even before backend responds
  const [products, setProducts]     = useState<Product[]>(loadCache);
  const [categories, setCategories] = useState<string[]>(() => {
    const cached = loadCache();
    return cached.length > 0 ? buildCategories(cached) : ['All'];
  });
  const [isOffline, setIsOffline]   = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(getSyncLabel);

  const applyProducts = (data: Product[]) => {
    setProducts(data);
    setCategories(buildCategories(data));
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: Product[] = await response.json();

      // ✅ Online: refresh UI + save to cache
      applyProducts(data);
      saveCache(data);
      setLastSynced(getSyncLabel());
      setIsOffline(false);
    } catch (err) {
      console.warn('[ProductContext] Backend unreachable — using cached products:', err);

      // ⚠️ Offline: keep showing whatever is already in state (loaded from cache on init)
      const cached = loadCache();
      if (cached.length > 0) {
        applyProducts(cached);
      }
      setIsOffline(true);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      fetchProducts();
    } catch (err) {
      console.error('Add product error:', err);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      fetchProducts();
    } catch (err) {
      console.error('Update product error:', err);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE'
      });
      fetchProducts();
    } catch (err) {
      console.error('Delete product error:', err);
    }
  };

  return (
    <ProductContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      categories,
      isOffline,
      lastSynced,
      refreshProducts: fetchProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};
