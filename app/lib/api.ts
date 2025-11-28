import { API_CONFIG, API_ENDPOINTS, STORAGE_KEYS } from './constants';
import { handleApiError } from './utils/error-handler';
import type {
  Product,
  Category,
  CartItem,
  Order,
  UserProfile,
  ApiResponse,
  PaginatedResponse,
} from './types';

// Re-export types for backward compatibility
export type {
  Product,
  Category,
  CartItem,
  Order,
  UserProfile,
  ApiResponse,
  PaginatedResponse,
};

const API_URL = API_CONFIG.BASE_URL;

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL || 'http://localhost:8080';
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  async fetchProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<PaginatedResponse<Product>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.category) queryParams.append('category', params.category);

      const url = `${this.baseUrl}${API_ENDPOINTS.PRODUCTS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url, {
        cache: 'no-store',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async fetchProductById(id: string): Promise<Product | null> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.PRODUCTS.DETAIL(id)}`, {
        cache: 'no-store',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  async fetchCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.CATEGORIES.LIST}`, {
        cache: 'no-store',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(data: {
    email: string;
    fullname: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    code: string;
  }): Promise<unknown> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  async sendOTP(email: string, type: 'REGISTER' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD'): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.AUTH.SEND_OTP}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, type }),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  }

  // Cart APIs
  async addToCart(productId: string, quantity: number = 1): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.CART.ADD}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      throw error;
    }
  }

  async getCart(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<CartItem>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(
        `${this.baseUrl}${API_ENDPOINTS.CART.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        await handleApiError(response);
      }

      const result = await response.json();
      return result.data || { data: [], total: 0, page: 1, limit: 10 };
    } catch (error) {
      console.error('Get cart error:', error);
      return { data: [], total: 0, page: 1, limit: 10 };
    }
  }

  async updateCartItem(cartItemId: string, quantity: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.CART.UPDATE(cartItemId)}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
    } catch (error) {
      console.error('Update cart item error:', error);
      throw error;
    }
  }

  async removeCartItem(cartItemId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.CART.DELETE(cartItemId)}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
    } catch (error) {
      console.error('Remove cart item error:', error);
      throw error;
    }
  }

  async clearCart(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.CART.CLEAR}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
    } catch (error) {
      console.error('Clear cart error:', error);
      throw error;
    }
  }

  // Order APIs
  async checkoutFromCart(): Promise<{ _id: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.ORDERS.CHECKOUT}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  }

  async getOrders(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Order>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(
        `${this.baseUrl}${API_ENDPOINTS.ORDERS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        await handleApiError(response);
      }

      const result = await response.json();
      return result.data || { data: [], total: 0, page: 1, limit: 10 };
    } catch (error) {
      console.error('Get orders error:', error);
      return { data: [], total: 0, page: 1, limit: 10 };
    }
  }

  async getOrderDetail(orderId: string): Promise<Order | null> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.ORDERS.DETAIL(orderId)}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Get order detail error:', error);
      return null;
    }
  }

  // Wishlist APIs
  async toggleWishlist(productId: string): Promise<{ isInWishlist: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.WISHLIST.TOGGLE(productId)}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Toggle wishlist error:', error);
      throw error;
    }
  }

  async getWishlist(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Product>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(
        `${this.baseUrl}${API_ENDPOINTS.WISHLIST.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        await handleApiError(response);
      }

      const result = await response.json();
      return result.data || { data: [], total: 0, page: 1, limit: 10 };
    } catch (error) {
      console.error('Get wishlist error:', error);
      return { data: [], total: 0, page: 1, limit: 10 };
    }
  }

  // Profile APIs
  async getProfile(): Promise<UserProfile | null> {
    try {
      // Check if token exists before making request
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!token) {
          return null; // No token, return null instead of making failed request
        }
      }

      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.AUTH.PROFILE}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        // If unauthorized, clear invalid token and return null (don't throw)
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          }
          return null; // Return null instead of throwing error
        }
        await handleApiError(response);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      // Silent fail for profile fetch - just return null
      if (error instanceof Error && error.message.includes('401')) {
        return null;
      }
      console.error('Get profile error:', error);
      return null;
    }
  }

  async updateProfile(data: { fullname?: string; phoneNumber?: string }): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.AUTH.PROFILE}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  async resetPassword(data: { email: string; code: string; password: string; confirmPassword: string }): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.AUTH.RESET_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.AUTH.LOGOUT}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        // Ignore logout API errors, just clear local tokens
        console.warn('Logout API failed, clearing local tokens anyway');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async deleteAvatar(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.AUTH.AVATAR}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
    } catch (error) {
      console.error('Delete avatar error:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
