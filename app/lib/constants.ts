// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  TIMEOUT: 30000,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    PROFILE: '/api/v1/auth/profile',
    SEND_OTP: '/api/v1/auth/otp',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    AVATAR: '/api/v1/auth/avatar',
  },
  // Products
  PRODUCTS: {
    LIST: '/api/v1/product/pagination',
    DETAIL: (id: string) => `/api/v1/product/${id}`,
    ALL: '/api/v1/product',
  },
  // Categories
  CATEGORIES: {
    LIST: '/api/v1/category',
  },
  // Cart
  CART: {
    LIST: '/api/v1/cart/pagination',
    ADD: '/api/v1/cart',
    UPDATE: (id: string) => `/api/v1/cart/${id}`,
    DELETE: (id: string) => `/api/v1/cart/${id}`,
    CLEAR: '/api/v1/cart',
  },
  // Orders
  ORDERS: {
    LIST: '/api/v1/order/pagination',
    DETAIL: (id: string) => `/api/v1/order/${id}`,
    CHECKOUT: '/api/v1/order/checkout-from-cart',
  },
  // Wishlist
  WISHLIST: {
    LIST: '/api/v1/wishlist',
    TOGGLE: (productId: string) => `/api/v1/wishlist/${productId}/toggle`,
  },
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  ITEMS_PER_PAGE_HOME: 10,
  ITEMS_PER_PAGE_PRODUCTS: 10,
} as const;

// OTP Types
export const OTP_TYPES = {
  REGISTER: 'REGISTER',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  RESET_PASSWORD: 'RESET_PASSWORD',
} as const;

// UI Messages
export const ERROR_MESSAGES = {
  PASSWORD_MISMATCH: 'Mật khẩu không khớp!',
  TERMS_NOT_ACCEPTED: 'Vui lòng đồng ý với điều khoản dịch vụ!',
  SEND_OTP_FAILED: 'Không thể gửi mã xác thực',
  OTP_REQUIRED: 'Vui lòng nhập mã OTP gồm 6 chữ số',
  VERIFY_FAILED: 'Xác thực thất bại',
  OTP_INVALID: 'Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại!',
  OTP_EXPIRED: 'Mã OTP đã hết hạn. Vui lòng gửi lại mã mới!',
  RESEND_OTP_FAILED: 'Không thể gửi lại mã OTP',
  PROFILE_LOAD_FAILED: 'Failed to load profile for header',
  LOGIN_FAILED: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
  CART_FETCH_FAILED: 'Error fetching cart',
  CART_UPDATE_FAILED: 'Không thể cập nhật số lượng',
  CART_REMOVE_FAILED: 'Không thể xóa sản phẩm',
  CART_EMPTY: 'Giỏ hàng trống!',
  CHECKOUT_FAILED: 'Không thể đặt hàng',
  AVATAR_DELETE_FAILED: 'Không thể xóa ảnh đại diện',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công!',
  REGISTER_SUCCESS: 'Đăng ký thành công! Vui lòng đăng nhập.',
  OTP_RESENT: 'Mã OTP mới đã được gửi đến email của bạn!',
  CHECKOUT_SUCCESS: 'Đặt hàng thành công!',
  AVATAR_DELETED: 'Đã xóa ảnh đại diện!',
} as const;

export const CONFIRM_MESSAGES = {
  REMOVE_CART_ITEM: 'Bạn có chắc muốn xóa sản phẩm này?',
  DELETE_AVATAR: 'Bạn có chắc muốn xóa ảnh đại diện?',
} as const;

// UI Delays
export const DELAYS = {
  REDIRECT_AFTER_REGISTER: 1500,
  REDIRECT_AFTER_LOGIN: 1500,
} as const;

// Toast Duration
export const TOAST_DURATION = 3000;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  REMEMBER_ME: 'rememberMe',
} as const;
