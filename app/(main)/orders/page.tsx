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
        // Backend trả về array trực tiếp
        const ordersData = Array.isArray(response) ? response : (response.data || []);
        
        // Map id to _id for consistency
        const mappedOrders = ordersData.map((order: any) => ({
          ...order,
          _id: order.id || order._id,
          status: order.status || 'PENDING',
          orderItems: order.orderItems || [],
        }));
        
        setOrders(mappedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, router]);

  const getStatusColor = (status: string) => {
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
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white rounded-lg transition shadow-sm"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Đơn Hàng Của Tôi</h1>
          </div>

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
                <div key={order._id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
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
                        <p className="text-sm text-gray-600 mb-1">Ngày đặt</p>
                        <div className="flex items-center gap-2 text-gray-900">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">
                            {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="p-6">
                    {/* Shipping Info - only show if available */}
                    {(order.fullname || order.phoneNumber || order.addressLine) && (
                      <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-green-600" />
                          Thông tin giao hàng
                        </h3>
                        <div className="space-y-2 text-sm text-gray-700">
                          {order.fullname && (
                            <div className="flex items-start gap-2">
                              <User className="w-4 h-4 mt-0.5 text-gray-400" />
                              <span>{order.fullname}</span>
                            </div>
                          )}
                          {order.phoneNumber && (
                            <div className="flex items-start gap-2">
                              <Phone className="w-4 h-4 mt-0.5 text-gray-400" />
                              <span>{order.phoneNumber}</span>
                            </div>
                          )}
                          {order.addressLine && (
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                              <span>
                                {order.addressLine}
                                {order.ward && `, ${order.ward}`}
                                {order.district && `, ${order.district}`}
                                {order.city && `, ${order.city}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Order Items - only show if available */}
                    {order.orderItems && order.orderItems.length > 0 ? (
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Package className="w-5 h-5 text-green-600" />
                          Sản phẩm ({order.orderItems.length})
                        </h3>
                        <div className="space-y-3">
                          {order.orderItems.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.productName}</p>
                                <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                  {item.price.toLocaleString('vi-VN')}đ
                                </p>
                                <p className="text-sm text-gray-500">
                                  = {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6 text-center py-4 text-gray-500">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm">Chi tiết sản phẩm không khả dụng</p>
                      </div>
                    )}

                    {/* Total Amount */}
                    <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                      <span className="text-lg font-semibold text-gray-900">Tổng tiền</span>
                      <span className="text-2xl font-bold text-green-600">
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
