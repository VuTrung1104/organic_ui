'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Package } from 'lucide-react';
import { apiService, type Order } from '@/lib/api';
import { Toast } from '@/components/ui';
import { useToast } from '@/lib/hooks';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, CONFIRM_MESSAGES } from '@/lib/constants';
import OrderModal from './OrderModal';

export default function OrdersManager() {
  const { toast, showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAllOrders({ limit: 100 });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast(ERROR_MESSAGES.ORDERS_FETCH_FAILED, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm(CONFIRM_MESSAGES.DELETE_ORDER)) return;
    
    try {
      await apiService.deleteOrder(orderId);
      showToast(SUCCESS_MESSAGES.ORDER_DELETE_SUCCESS, 'success');
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      showToast(ERROR_MESSAGES.ORDER_DELETE_FAILED, 'error');
    }
  };

  const filteredOrders = orders.filter((order) => {
    const orderId = order.id?.toLowerCase() || '';
    const userEmail = order.userId?.email?.toLowerCase() || '';
    const userName = order.userId?.fullname?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    return orderId.includes(searchLower) || userEmail.includes(searchLower) || userName.includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => {}} />
      )}

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Quản Lý Đơn Hàng</h2>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng (ID hoặc Email)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã Đơn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách Hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản Phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng Tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày Đặt
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        #{order.id.slice(-8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{order.userId?.fullname || 'N/A'}</div>
                        <div className="text-gray-500">{order.userId?.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.itemsCount || 0} sản phẩm
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {order.totalAmount.toLocaleString('vi-VN')}đ
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => setSelectedOrderId(order.id)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center justify-center"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Không tìm thấy đơn hàng nào' : 'Chưa có đơn hàng nào'}
            </p>
          </div>
        )}
      </div>

      {selectedOrderId && (
        <OrderModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </>
  );
}
