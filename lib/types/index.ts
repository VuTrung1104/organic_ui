// Product Types
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

// Category Types
export interface Category {
  _id: string;
  name: string;
  description?: string;
}

// Cart Types
export interface CartItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    image?: string;
    stock?: number;
    category?: string;
  };
  quantity: number;
  createdAt: string;
}

// Order Types
export interface Order {
  _id: string;
  id: string;
  userId: {
    id: string;
    email: string;
    fullname: string;
    phoneNumber?: string;
  };
  totalAmount: number;
  itemsCount?: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: 'COD' | 'MOMO' | 'BANK_TRANSFER';
  fullname?: string;
  phoneNumber?: string;
  addressLine?: string;
  ward?: string;
  district?: string;
  city?: string;
  orderItems: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

// User Types
export interface UserProfile {
  _id: string;
  email: string;
  fullname: string;
  phoneNumber?: string;
  avatar?: string;
  address?: string;
  role: {
    _id: string;
    name: string;
  };
}

export interface User {
  id: string;
  email: string;
  fullname: string;
  phoneNumber: string;
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'SUSPENDED';
  isLocked: boolean;
  lockExpirationDate?: string | null;
  role: {
    id: string;
    name: string;
  };
  roleId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Address {
  id: string;
  userId: string;
  fullname: string;
  phoneNumber: string;
  addressLine: string;
  ward?: string;
  district?: string;
  city: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  total?: number;
  page?: number;
  limit?: number;
}
