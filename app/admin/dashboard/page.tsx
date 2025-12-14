'use client';

import { Package, ShoppingBag, Users, DollarSign } from 'lucide-react';
import { MetricCard } from './components/MetricCard';
import { CategoryChart } from './components/CategoryChart';
import { QuickActions } from './components/QuickActions';
import { useDashboardData } from './hooks/useDashboardData';
import { useClock } from './hooks/useClock';

export default function AdminDashboard() {
  const { stats, categoryStats, loading } = useDashboardData();
  const currentTime = useClock();

  const mainMetrics = [
    {
      label: 'Tổng Doanh Thu',
      value: `${stats.revenue.toLocaleString('vi-VN')}`,
      unit: 'đ',
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      label: 'Đơn Hàng',
      value: stats.totalOrders.toString(),
      unit: 'đơn',
      icon: ShoppingBag,
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      label: 'Sản Phẩm',
      value: stats.totalProducts.toString(),
      unit: 'sp',
      icon: Package,
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      label: 'Khách Hàng',
      value: stats.totalUsers.toString(),
      unit: 'người',
      icon: Users,
      gradient: 'from-orange-500 to-red-600',
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
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 -m-6 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">
              Tổng Quan <span className="text-green-600">Dashboard</span>
            </h1>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 mb-1 tabular-nums">
              {currentTime.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: false
              })}
            </div>
            <p className="text-sm text-gray-500">
              {currentTime.toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mainMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} index={index} />
        ))}
      </div>
      
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Category Chart */}
      <CategoryChart categoryStats={categoryStats} />

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}