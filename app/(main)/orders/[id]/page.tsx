'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Package, CheckCircle2, Clock, Truck, XCircle } from 'lucide-react';
import Image from 'next/image';
import { apiService, type Order } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Header, Footer } from '@/components/layout';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchOrderDetail = async () => {
      setLoading(true);
      try {
        // Get order from orders list
        const response = await apiService.getOrders({ limit: 100 });
        const ordersData = Array.isArray(response) ? response : (response.data || []);
        const foundOrder = ordersData.find((o: any) => (o.id || o._id) === orderId);
        
        if (foundOrder) {
          const mappedOrder = {
            ...foundOrder,
            _id: foundOrder.id || foundOrder._id,
            status: foundOrder.status || 'PENDING',
            orderItems: foundOrder.orderItems || [],
          };
          setOrder(mappedOrder);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId, isAuthenticated, router]);

  const getStatusInfo = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'Chờ xác nhận',
          step: 1
        };
      case 'CONFIRMED':
        return {
          icon: CheckCircle2,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'Đang xử lý',
          step: 2
        };
      case 'SHIPPING':
        return {
          icon: Truck,
          color: 'text-purple-600',
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'Đang giao hàng',
          step: 3
        };
      case 'DELIVERED':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'Đã giao hàng',
          step: 4
        };
      case 'CANCELLED':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'Đã hủy',
          step: 0
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: status || 'Chờ xác nhận',
          step: 1
        };
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'COD':
        return 'Thanh toán khi nhận hàng (COD)';
      case 'MOMO':
        return 'Ví điện tử MoMo';
      case 'BANK_TRANSFER':
        return 'Chuyển khoản ngân hàng';
      default:
        return method || 'COD';
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

  if (!order) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
            <p className="text-gray-600 mb-6">Đơn hàng không tồn tại hoặc bạn không có quyền xem.</p>
            <button
              onClick={() => router.push('/orders')}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Quay lại danh sách đơn hàng
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;
  const currentStep = statusInfo.step;

  const orderSteps = [
    { label: 'Đã nhận đơn', step: 1 },
    { label: 'Đang xử lý', step: 2 },
    { label: 'Đang giao', step: 3 },
    { label: 'Đã giao', step: 4 },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => router.push('/orders')}
              className="p-1.5 bg-white hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors shadow-sm hover:shadow-md border border-gray-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Chi Tiết Đơn Hàng</h1>
          </div>

          {/* Order Status Progress */}
          {order.status !== 'CANCELLED' && (
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
              <div className="relative px-8">
                {/* Progress Line */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
                  <div 
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between relative">
                  {orderSteps.map((item) => (
                    <div key={item.step} className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors border-4 border-white ${
                        item.step <= currentStep 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <span className={`text-sm font-medium ${
                        item.step <= currentStep ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Products Section */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">Sản Phẩm</h2>
                </div>

                {order.orderItems && order.orderItems.length > 0 ? (
                  <div className="space-y-4">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:border-green-200 transition">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{item.productName}</h3>
                          <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {item.price.toLocaleString('vi-VN')}đ
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            = {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">Không có thông tin sản phẩm</p>
                )}
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">THÔNG TIN GIAO HÀNG</h2>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <span className="font-medium">Họ tên:</span>
                    <span className="ml-2">{order.fullname || order.userId?.fullname || '-'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Địa chỉ:</span>
                    <span className="ml-2">
                      {order.addressLine || '-'}
                      {order.ward && `, ${order.ward}`}
                      {order.district && `, ${order.district}`}
                      {order.city && `, ${order.city}`}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <span className="ml-2">{order.userId?.email || '-'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Số điện thoại:</span>
                    <span className="ml-2">{order.phoneNumber || order.userId?.phoneNumber || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm Tắt Đơn Hàng</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">MÃ ĐƠN HÀNG:</span>
                    <span className="font-mono text-sm">#{order._id?.slice(-8).toUpperCase() || order.id?.slice(-8).toUpperCase()}</span>
                  </div>

                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Phương thức thanh toán:</span>
                    <span className="text-right text-sm">{getPaymentMethodText(order.paymentMethod)}</span>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>Tạm tính:</span>
                      <span>{order.totalAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>Giảm giá:</span>
                      <span>0%</span>
                    </div>
                    <div className="flex justify-between text-gray-700 mb-2">
                      <span>Phí vận chuyển:</span>
                      <span className="text-green-600 font-medium">Miễn phí</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
                      <span className="text-2xl font-bold text-green-600">
                        {order.totalAmount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${statusInfo.border} ${statusInfo.bg}`}>
                  <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                    <p className={`font-bold ${statusInfo.color}`}>{statusInfo.text}</p>
                  </div>
                </div>

                {/* Order Date */}
                <div className="mt-4 text-sm text-gray-500 text-center">
                  Đặt ngày: {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
