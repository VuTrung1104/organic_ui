'use client';

import { useEffect, useState } from 'react';
import { Package, ShoppingBag, FolderTree, TrendingUp } from 'lucide-react';
import { apiService } from '../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    categories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, categoriesRes] = await Promise.all([
          apiService.fetchProducts({ limit: 1 }),
          apiService.getAllOrders({ limit: 1 }),
          apiService.fetchCategories(),
        ]);

        setStats({
          products: productsRes.totalItems || 0,
          orders: ordersRes.totalItems || 0,
          categories: categoriesRes.length || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    {
      icon: Package,
      label: 'Tổng Sản Phẩm',
      value: stats.products,
      color: 'bg-blue-500',
    },
    {
      icon: ShoppingBag,
      label: 'Đơn Hàng',
      value: stats.orders,
      color: 'bg-green-500',
    },
    {
      icon: FolderTree,
      label: 'Danh Mục',
      value: stats.categories,
      color: 'bg-purple-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-14 h-14 rounded-full flex items-center justify-center`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Welcome Message */}
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-8 h-8 text-green-600" />
          <h3 className="text-xl font-bold text-gray-900">Chào mừng đến Admin Panel</h3>
        </div>
        <p className="text-gray-600">
          Sử dụng menu bên trái để quản lý sản phẩm, danh mục, đơn hàng và người dùng của bạn.
        </p>
      </div>
    </div>
  );
}
