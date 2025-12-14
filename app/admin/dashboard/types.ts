export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  revenue: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  lowStockProducts: number;
}

export interface CategoryStats {
  category: {
    _id: string;
    id?: string;
    name: string;
  };
  productCount: number;
  percentage: number;
}

export interface MetricConfig {
  label: string;
  value: string;
  unit: string;
  icon: any;
  gradient: string;
}

export const ORDER_STATUS_MAP = {
  PENDING: 'Đang chờ',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
} as const;

export const ORDER_STATUS_COLOR_MAP = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  SHIPPING: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
} as const;
