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
  isApproved?: boolean;
  benefitsDescription?: string;
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

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-turmeric-01',
    name: 'Organic Turmeric Finger',
    price: 299,
    image: '/images/products/organic-turmeric-finger.jpg',
    batchId: 'F-SANGLI-2024-01',
    category: 'Spices',
    sku: 'TURM-FING-01',
    stock: 100,
    origin: 'Sangli, Maharashtra',
    description: 'Premium handpicked organic turmeric fingers rich in natural curcumin (5.2%). Sourced from certified agro-cooperatives.',
    benefitsDescription: 'Behold Haridra, the golden healer of ancient texts. Its Ushna (heating) properties accelerate fat metabolism while its Lekhana (scraping) action purifies micro-channels.',
    harvestDate: '2026-07-28',
    weatherTemp: '28°C',
    growthQuality: 'Grade A+',
    organicMatter: '4.2%',
    nitrogen: '1.8%',
    zeroPesticides: '0.00% Verified',
    certificateUrl: 'https://example.com/reports/soil-001.pdf',
    isApproved: true
  },
  {
    id: 'prod-ghee-01',
    name: 'Pure A2 Vedic Ghee',
    price: 850,
    image: '/images/products/pure-a2-vedic-ghee.jpg',
    batchId: 'F-SATARA-2024-02',
    category: 'Dairy',
    sku: 'GHEE-VEDIC-02',
    stock: 85,
    origin: 'Satara, Maharashtra',
    description: 'Bilona method hand-churned A2 ghee prepared from free-range Gir desi cow milk.',
    benefitsDescription: 'Samskara Ghee is the very essence of Agni. It lubricates tissues, enhances Ojas, and stimulates digestive fire for optimal vitality.',
    harvestDate: '2026-08-01',
    weatherTemp: '26°C',
    growthQuality: 'Excellent',
    organicMatter: '4.5%',
    nitrogen: '2.0%',
    zeroPesticides: '0.00% Verified',
    certificateUrl: 'https://example.com/reports/ghee-002.pdf',
    isApproved: true
  },
  {
    id: 'prod-moringa-01',
    name: 'Moringa Leaf Powder (Shigru)',
    price: 199,
    image: '/images/products/moringa-powder-(shigru).jpg',
    batchId: 'F-KOLHAPUR-2024-03',
    category: 'Supplements',
    sku: 'MOR-POW-03',
    stock: 120,
    origin: 'Kolhapur, Maharashtra',
    description: 'Shade-dried nutrient-dense organic drumstick leaf powder packed with antioxidants and bio-available iron.',
    benefitsDescription: 'Shigru is a powerhouse of Prana. Its bitter-pungent taste balances Kapha and Vata, clearing cellular fatigue and boosting energy.',
    harvestDate: '2026-08-04',
    weatherTemp: '29°C',
    growthQuality: 'Grade A+',
    organicMatter: '4.1%',
    nitrogen: '1.9%',
    zeroPesticides: '0.00% Verified',
    certificateUrl: 'https://example.com/reports/moringa-003.pdf',
    isApproved: true
  },
  {
    id: 'prod-mustard-01',
    name: 'Cold Pressed Mustard Oil',
    price: 349,
    image: '/images/products/cold-pressed-mustard-oil.jpg',
    batchId: 'F-SOLAPUR-2024-04',
    category: 'Oils',
    sku: 'OIL-MUST-04',
    stock: 90,
    origin: 'Solapur, Maharashtra',
    description: 'Traditional kachi ghani cold pressed pure organic mustard oil from unrefined seeds.',
    benefitsDescription: 'Pure Kachi Ghani Mustard Oil warms the digestive tract, clears Vata stagnation, and promotes healthy circulation.',
    harvestDate: '2026-07-22',
    weatherTemp: '30°C',
    growthQuality: 'Grade A+',
    organicMatter: '4.4%',
    nitrogen: '2.0%',
    zeroPesticides: '0.00% Verified',
    certificateUrl: 'https://example.com/reports/oil-004.pdf',
    isApproved: true
  }
];

// ─── Cache helpers ────────────────────────────────────────────────────────────
const CACHE_KEY      = 'swasthanand_products_cache_v2';
const CACHE_TIME_KEY = 'swasthanand_products_sync_time';

const loadCache = (): Product[] => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Product[]) : [];
    return parsed.length > 0 ? parsed : DEFAULT_PRODUCTS;
  } catch {
    return DEFAULT_PRODUCTS;
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

      if (data && data.length > 0) {
        applyProducts(data);
        saveCache(data);
      } else {
        const cached = loadCache();
        applyProducts(cached.length > 0 ? cached : DEFAULT_PRODUCTS);
      }
      setLastSynced(getSyncLabel());
      setIsOffline(false);
    } catch (err) {
      console.warn('[ProductContext] Backend unreachable — using cached products:', err);

      // ⚠️ Offline: keep showing whatever is already in state (loaded from cache on init)
      const cached = loadCache();
      applyProducts(cached.length > 0 ? cached : DEFAULT_PRODUCTS);
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
