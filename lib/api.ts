import { API_CONFIG, API_ENDPOINTS, STORAGE_KEYS } from './constants';
import { handleApiError } from './utils/error-handler';
import { cache, CACHE_KEYS, CACHE_TTL } from './cache';
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
    search?: string;
  }): Promise<PaginatedResponse<Product>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.category) queryParams.append('category', params.category);
      if (params?.includeDeleted === true) queryParams.append('includeDeleted', 'true');
      if (params?.search) queryParams.append('search', params.search);

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
          id: product.id,
          _id: product.id || product._id,
          category: product.category ? {
            ...product.category,
            id: product.category.id,
            _id: product.category.id || product.category._id,
          } : product.category,
        }));
      }
      
      return result;
    } catch (error) {
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

      if (result && (result._id || result.id)) {
        const productId = result._id || result.id;
        const primaryImage = result.images?.find((img: any) => img.isPrimary)?.url || result.images?.[0]?.url || '';
        
        return {
          _id: productId,
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
      throw error;
    }
  }

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
      throw error;
    }
  }

  async checkoutFromCart(paymentMethod: 'COD' | 'MOMO' | 'BANK_TRANSFER' = 'COD', addressId?: string): Promise<{ orderId: string; totalAmount: number }> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.ORDERS.CHECKOUT}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ paymentMethod, addressId }),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }

  async createMomoPayment(amount: number, orderInfo: string, mongoOrderId?: string): Promise<{ orderId: string; requestId: string; payUrl: string; qrCodeUrl: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.PAYMENT.MOMO_CREATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, orderInfo, mongoOrderId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        await handleApiError(response);
      }

      return response.json();
    } catch (error) {
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

      if (result.data && Array.isArray(result.data)) {
        result.data = result.data.map((order: any) => ({
          ...order,
          _id: order.id || order._id,
          status: order.status || 'PENDING',
          orderItems: (order.orderItems || []).map((item: any) => ({
            ...item,
            _id: item.id || item._id,
          })),
        }));
      }
      
      return result.data || { data: [], total: 0, page: 1, limit: 10 };
    } catch (error) {
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
      
      const orderData = result.data || result;
      
      if (orderData && orderData.id) {
        const order = {
          ...orderData,
          _id: orderData.id || orderData._id,
          status: orderData.status || 'PENDING',
          orderItems: (orderData.items || orderData.orderItems || []).map((item: any) => ({
            productId: item.product?.id || item.productId,
            productName: item.product?.name || item.productName,
            productImage: item.product?.image,
            quantity: item.quantity,
            price: item.price,
          })),
          userId: orderData.user || orderData.userId,
        };
        return order;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

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
      return { data: [], total: 0, page: 1, limit: 10 };
    }
  }

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
        // Logout API failed, clearing local tokens anyway
      }
    } catch (error) {
      // Ignore logout errors
    }
  }

  //Admin
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

      cache.clear();

      const product = result.data || result;
      return {
        ...product,
        id: product.id,
        _id: product.id || product._id,
      };
    } catch (error) {
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

      cache.delete(CACHE_KEYS.PRODUCT_DETAIL(productId));
      cache.clear();
      
      return result.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/product/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      cache.delete(CACHE_KEYS.PRODUCT_DETAIL(id));
      cache.clear();
    } catch (error) {
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
      throw error;
    }
  }

  async createCategory(data: any): Promise<Category> {
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

      cache.delete(CACHE_KEYS.CATEGORIES);
      
      return result.data || result;
    } catch (error) {
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

      cache.delete(CACHE_KEYS.CATEGORIES);
      
      return result.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/category/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      cache.delete(CACHE_KEYS.CATEGORIES);
    } catch (error) {
      throw error;
    }
  }

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

      const result = await response.json();

      if (result.data && Array.isArray(result.data)) {
        result.data = result.data.map((order: any) => ({
          ...order,
          _id: order.id || order._id,
          status: order.status || 'PENDING',
          orderItems: (order.orderItems || []).map((item: any) => ({
            ...item,
            _id: item.id || item._id,
          })),
        }));
      }

      return result;
    } catch (error) {
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
      throw error;
    }
  }

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
      throw error;
    }
  }

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
      throw error;
    }
  }
}

export const apiService = new ApiService();
