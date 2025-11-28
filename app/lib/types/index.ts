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
  };
  quantity: number;
  createdAt: string;
}

// Order Types
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

// User Types
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
