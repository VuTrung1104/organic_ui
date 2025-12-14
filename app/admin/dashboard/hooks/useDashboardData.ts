import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import type { Order } from '@/lib/types';
import type { DashboardStats, CategoryStats } from '../types';

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    revenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    averageOrderValue: 0,
    lowStockProducts: 0,
  });
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productsRes, usersRes, ordersRes, categoriesRes] = await Promise.all([
          apiService.fetchProducts({ limit: 100 }),
          apiService.getAllUsers(),
          apiService.getAllOrders({ limit: 100 }),
          apiService.fetchCategories(),
        ]);

        const allOrders = ordersRes.data || [];
        const allProducts = productsRes.data || [];
        const allCategories = categoriesRes || [];

        // Calculate revenue from all orders
        const totalRevenue = allOrders.reduce((sum: number, order: Order) => {
          return sum + (order.totalAmount || 0);
        }, 0);

        const completedOrders = allOrders.filter((o: Order) => o.status === 'DELIVERED');
        const avgOrderValue = completedOrders.length > 0 
          ? totalRevenue / completedOrders.length 
          : 0;

        const lowStockCount = allProducts.filter((p: any) => (p.stock || 0) < 10).length;

        setStats({
          totalProducts: productsRes.pagination?.total || 0,
          totalOrders: ordersRes.pagination?.total || 0,
          totalUsers: usersRes.data?.length || 0,
          revenue: totalRevenue,
          pendingOrders: allOrders.filter((o: Order) => o.status === 'PENDING').length,
          completedOrders: completedOrders.length,
          averageOrderValue: avgOrderValue,
          lowStockProducts: lowStockCount,
        });

        // Calculate category statistics
        const categoryStatsData = allCategories.map((category: any) => {
          const productCount = allProducts.filter((product: any) => {
            const productCategoryId = product.category?.id || product.category?._id || product.categoryId;
            const categoryId = category.id || category._id;
            return productCategoryId === categoryId;
          }).length;
          
          return {
            category,
            productCount,
          };
        });

        const totalProductsInCategories = categoryStatsData.reduce((sum, stat) => sum + stat.productCount, 0);

        const finalCategoryStats = categoryStatsData.map(stat => ({
          ...stat,
          percentage: totalProductsInCategories > 0 ? (stat.productCount / totalProductsInCategories) * 100 : 0,
        })).sort((a, b) => b.productCount - a.productCount);
        
        setCategoryStats(finalCategoryStats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { stats, categoryStats, loading };
};
