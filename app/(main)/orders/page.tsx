'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Calendar, ArrowLeft, MapPin, Phone, User } from 'lucide-react';
import { apiService, type Order } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Header, Footer } from '@/components/layout';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await apiService.getOrders({ limit: 100 });
        const ordersData = Array.isArray(response) ? response : (response.data || []);
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, router]);

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipping':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    if (!status) return 'Chưa xác định';
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'shipping':
        return 'Đang giao hàng';
      case 'delivered':
        return 'Đã giao hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => router.push('/')}
              className="p-1.5 bg-white hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors shadow-sm hover:shadow-md border border-gray-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Đơn Hàng Của Tôi</h1>
          </div>
          <hr className="border-gray-300 mb-6" />

          {!orders || orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Chưa có đơn hàng nào
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!
              </p>
              <button
                onClick={() => router.push('/products')}
                className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
              >
                Xem Sản Phẩm
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div 
                  key={order._id} 
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="bg-linear-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
                          <p className="font-mono text-lg font-semibold text-gray-900">
                            #{order._id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/orders/${order._id}`);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition text-sm"
                        >
                          Theo dõi đơn
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="p-6">
                    {/* Total Amount */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">Tổng tiền</span>
                      <span className="text-2xl font-bold text-red-400">
                        {order.totalAmount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
