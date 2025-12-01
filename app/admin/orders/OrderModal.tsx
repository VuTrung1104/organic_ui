'use client';

import { useEffect, useState } from 'react';
import { X, User, Mail, Phone, Calendar, Package } from 'lucide-react';
import { apiService, type Order } from '@/lib/api';

interface OrderModalProps {
  orderId: string;
  onClose: () => void;
}

export default function OrderModal({ orderId, onClose }: OrderModalProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      setLoading(true);
      try {
        console.log('Fetching order detail for ID:', orderId);
        const data = await apiService.getOrderDetail(orderId);
        console.log('Order detail received:', data);
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Chi Tiết Đơn Hàng</h2>
            {order && (
              <div className="flex items-center gap-3 mt-2">
                <p className="text-gray-600 font-mono text-sm">#{order._id}</p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}
                >
                  {getStatusText(order.status)}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : !order ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Không tìm thấy đơn hàng</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin khách hàng</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Họ tên</p>
                      <p className="font-semibold text-gray-900">
                        {order.userId?.fullname || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold text-gray-900">
                        {order.userId?.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Số điện thoại</p>
                      <p className="font-semibold text-gray-900">
                        {order.userId?.phoneNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Ngày đặt hàng</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {(order.fullname || order.addressLine) && (
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Địa chỉ giao hàng</h3>
                  <div className="space-y-2">
                    {order.fullname && (
                      <p className="text-gray-900">
                        <span className="font-semibold">Người nhận:</span> {order.fullname}
                      </p>
                    )}
                    {order.phoneNumber && (
                      <p className="text-gray-900">
                        <span className="font-semibold">SĐT:</span> {order.phoneNumber}
                      </p>
                    )}
                    {order.addressLine && (
                      <p className="text-gray-900">
                        <span className="font-semibold">Địa chỉ:</span> {order.addressLine}
                        {order.ward && `, ${order.ward}`}
                        {order.district && `, ${order.district}`}
                        {order.city && `, ${order.city}`}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Sản phẩm</h3>
                <div className="space-y-3">
                  {order.orderItems && order.orderItems.length > 0 ? (
                    order.orderItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Số lượng: <span className="font-medium">{item.quantity}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Đơn giá</p>
                          <p className="font-semibold text-gray-900">
                            {item.price.toLocaleString('vi-VN')}đ
                          </p>
                          <p className="text-sm text-green-600 font-semibold mt-1">
                            = {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">Không có sản phẩm nào</p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Tổng kết đơn hàng</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Trạng thái</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phương thức thanh toán</span>
                    <span className="font-semibold text-gray-900">
                      {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 
                       order.paymentMethod === 'MOMO' ? 'Ví MoMo' : 'Chuyển khoản'}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span>{order.totalAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-600 font-medium">Miễn phí</span>
                  </div>
                  <div className="border-t border-green-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Tổng cộng</span>
                      <span className="text-2xl font-bold text-green-600">
                        {order.totalAmount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
