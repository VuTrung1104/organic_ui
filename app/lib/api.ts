const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Product {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  description?: string;
  image?: string;
  images?: string[];
  category?: {
    _id: string;
    name: string;
  };
  stock?: number;
  badge?: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
}

export interface CartItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    image?: string;
    stock?: number;
  };
  quantity: number;
  createdAt: string;
}

export interface Order {
  _id: string;
  orderItems: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface UserProfile {
  _id: string;
  email: string;
  fullname: string;
  phoneNumber?: string;
  avatar?: string;
  role: {
    _id: string;
    name: string;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
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

      const url = `${this.baseUrl}/api/v1/product/pagination${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url, {
        cache: 'no-store',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async fetchProductById(id: string): Promise<Product | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/product/${id}`, {
        cache: 'no-store',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product');
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
      const response = await fetch(`${this.baseUrl}/api/v1/category`, {
        cache: 'no-store',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
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
      const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        
        // Extract error message from array or string
        let errorMessage = 'Login failed';
        if (Array.isArray(errorData.message) && errorData.message.length > 0) {
          errorMessage = errorData.message.map((m: { message?: string; field?: string }) => m.message || String(m)).join(', ');
        } else if (typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
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
      const response = await fetch(`${this.baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Register failed:', errorData);
        
        // Extract error message from array or string
        let errorMessage = 'Registration failed';
        if (Array.isArray(errorData.message) && errorData.message.length > 0) {
          errorMessage = errorData.message.map((m: { message?: string; field?: string }) => m.message || String(m)).join(', ');
        } else if (typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Register error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async sendOTP(email: string, type: 'REGISTER' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD'): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, type }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Send OTP failed:', errorData);
        
        // Extract error message from array or string
        let errorMessage = 'Failed to send OTP';
        if (Array.isArray(errorData.message) && errorData.message.length > 0) {
          errorMessage = errorData.message.map((m: { message?: string; field?: string }) => m.message || String(m)).join(', ');
        } else if (typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Cart APIs
  async addToCart(productId: string, quantity: number = 1): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/cart`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getCart(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<CartItem>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(
        `${this.baseUrl}/api/v1/cart/pagination${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
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
      const response = await fetch(`${this.baseUrl}/api/v1/cart/${cartItemId}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart item');
      }
    } catch (error) {
      console.error('Update cart item error:', error);
      throw error;
    }
  }

  async removeCartItem(cartItemId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to remove cart item');
      }
    } catch (error) {
      console.error('Remove cart item error:', error);
      throw error;
    }
  }

  async clearCart(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/cart`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }
    } catch (error) {
      console.error('Clear cart error:', error);
      throw error;
    }
  }

  // Order APIs
  async checkoutFromCart(): Promise<{ _id: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/order/checkout-from-cart`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Checkout failed');
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
        `${this.baseUrl}/api/v1/order/pagination${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
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
      const response = await fetch(`${this.baseUrl}/api/v1/order/${orderId}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order detail');
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
      const response = await fetch(`${this.baseUrl}/api/v1/wishlist/${productId}/toggle`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle wishlist');
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
        `${this.baseUrl}/api/v1/wishlist${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
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
      const response = await fetch(`${this.baseUrl}/api/v1/auth/profile`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const result = await response.json();
      // Backend returns profile directly, not wrapped in { data: ... }
      return result.data || result;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  async updateProfile(data: { fullname?: string; phoneNumber?: string }): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/profile`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const result = await response.json();
      // Backend returns profile directly, not wrapped in { data: ... }
      return result.data || result;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  async resetPassword(data: { email: string; code: string; password: string; confirmPassword: string }): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        // Ignore logout API errors, just clear local tokens
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}

export const apiService = new ApiService();
