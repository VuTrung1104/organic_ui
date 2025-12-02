import { API_CONFIG, API_ENDPOINTS, STORAGE_KEYS } from './constants';
import { handleApiError } from './utils/error-handler';
import type {
  Product,
  Category,
  CartItem,
  Order,
  User,
  Address,
  UserProfile,
  ApiResponse,
  PaginatedResponse,
} from './types';

export type {
  Product,
  Category,
  CartItem,
  Order,
  User,
  Address,
  UserProfile,
  ApiResponse,
  PaginatedResponse,
};

const API_URL = API_CONFIG.BASE_URL;

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
    includeDeleted?: boolean;
  }): Promise<PaginatedResponse<Product>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.category) queryParams.append('category', params.category);
      if (params?.includeDeleted !== undefined) queryParams.append('includeDeleted', params.includeDeleted.toString());

      queryParams.append('_t', Date.now().toString());

      const url = `${this.baseUrl}${API_ENDPOINTS.PRODUCTS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url, {
        cache: 'no-store',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const result = await response.json();

      if (result.data && Array.isArray(result.data)) {
        result.data = result.data.map((product: any) => ({
          ...product,
          _id: product.id || product._id,
          category: product.category ? {
            ...product.category,
            _id: product.category.id || product.category._id,
          } : product.category,
        }));
      }
      
      return result;
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
      
      if (result && result.id) {
        const primaryImage = result.images?.find((img: any) => img.isPrimary)?.url || result.images?.[0]?.url || '';
        
        return {
          id: result.id,
          name: result.name,
          description: result.description,
          price: result.price,
          stock: result.quantity || 0,
          discount: result.discount || 0,
          image: primaryImage,
          category: result.category || null,
          images: result.images || [],
        };
      }
      
      return null;
    } catch (error) {
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

      const categories = result.data.map((cat: any) => ({
        ...cat,
        _id: cat.id || cat._id,
      }));
      
      return categories;
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

  async resetPassword(data: {
    email: string;
    code: string;
    newPassword: string;
    confirmNewPassword: string;
  }): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/forgot-password`, {
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

  // Cart API
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

      if (result.data && result.pagination) {
        return result;
      }
      
      return result.data || result || { data: [], total: 0, page: 1, limit: 10 };
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

  // Order API
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

  // Wishlist API
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
      return result.data || result || { isInWishlist: true };
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

  // Profile API
  async getProfile(): Promise<UserProfile | null> {
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!token) {
          return null; 
        }
      }

      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.AUTH.PROFILE}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          }
          return null;
        }
        await handleApiError(response);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
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

  async resetPassword(data: { email: string; code: string; newPassword: string; confirmNewPassword: string }): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`, {
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
        console.warn('Logout API failed, clearing local tokens anyway');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  //Admin
  // Product Management
  async createProduct(data: {
    name: string;
    description?: string;
    price: number;
    quantity: number;
    categoryId?: string;
  }): Promise<Product> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/product/create`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Create product error:', error);
      throw error;
    }
  }

  async updateProduct(productId: string, data: {
    name?: string;
    description?: string;
    price?: number;
    quantity?: number;
    categoryId?: string;
  }): Promise<Product> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/product/${productId}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Update product error:', error);
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/product/${productId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
    } catch (error) {
      console.error('Delete product error:', error);
      throw error;
    }
  }

  async deleteProductImage(productId: string, imageId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/product/${productId}/images/${imageId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
    } catch (error) {
      console.error('Delete product image error:', error);
      throw error;
    }
  }

  // Category Management
  async createCategory(data: { name: string; description?: string }): Promise<Category> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/category/create`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Create category error:', error);
      throw error;
    }
  }

  async updateCategory(categoryId: string, data: { name?: string; description?: string }): Promise<Category> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/category/${categoryId}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Update category error:', error);
      throw error;
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/category/${categoryId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
    } catch (error) {
      console.error('Delete category error:', error);
      throw error;
    }
  }

  // Get all orders for admin
  async getAllOrders(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Order>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const url = `${this.baseUrl}/api/v1/order/admin/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Get all orders error:', error);
      throw error;
    }
  }

  async deleteOrder(orderId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/order/${orderId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
    } catch (error) {
      console.error('Delete order error:', error);
      throw error;
    }
  }

  // User Management API
  async getAllUsers(): Promise<{ data: User[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const result = await response.json();
      if (result.data) {
        result.data = result.data.map((user: any) => ({
          ...user,
          _id: user.id || user._id,
        }));
      }
      return result;
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }

  async lockUser(userId: string, body: { reason?: string; durationMinutes?: number }): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/${userId}/lock`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
    } catch (error) {
      console.error('Lock user error:', error);
      throw error;
    }
  }

  async unlockUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/${userId}/unlock`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
    } catch (error) {
      console.error('Unlock user error:', error);
      throw error;
    }
  }

  async getRoles(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/role?skip=0&take=100`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Get roles error:', error);
      throw error;
    }
  }

  async updateUserRole(userId: string, roleId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/role/users/${userId}/roles`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ roleId }),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  }

  // Address API
  async getAddresses(): Promise<{ data: Address[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/address`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Get addresses error:', error);
      throw error;
    }
  }

  async createAddress(data: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Address> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/address`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Create address error:', error);
      throw error;
    }
  }

  async updateAddress(addressId: string, data: Partial<Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Address> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/address/${addressId}`, {
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
      console.error('Update address error:', error);
      throw error;
    }
  }

  async deleteAddress(addressId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/address/${addressId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }
    } catch (error) {
      console.error('Delete address error:', error);
      throw error;
    }
  }

  async setDefaultAddress(addressId: string): Promise<Address> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/address/${addressId}/default`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Set default address error:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
