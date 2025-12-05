// Simple in-memory cache with TTL
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private cache: Map<string, CacheItem<any>> = new Map();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    const isExpired = Date.now() - item.timestamp > item.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new CacheManager();

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
}

// Cache keys
export const CACHE_KEYS = {
  PRODUCTS: (page: number, limit: number, category?: string) => 
    `products_${page}_${limit}_${category || 'all'}`,
  PRODUCT_DETAIL: (id: string) => `product_${id}`,
  CATEGORIES: 'categories',
  CART: 'cart',
  WISHLIST: 'wishlist',
} as const;

// Cache TTL (Time To Live) 
export const CACHE_TTL = {
  PRODUCTS: 5 * 60 * 1000, // 5 minutes
  PRODUCT_DETAIL: 10 * 60 * 1000, 
  CATEGORIES: 30 * 60 * 1000, 
  CART: 2 * 60 * 1000, 
  WISHLIST: 5 * 60 * 1000, 
} as const;
