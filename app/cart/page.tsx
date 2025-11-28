'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { apiService, type CartItem } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchCart();
  }, [isAuthenticated, router]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await apiService.getCart({ limit: 100 });
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdating(cartItemId);
    try {
      await apiService.updateCartItem(cartItemId, newQuantity);
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Không thể cập nhật số lượng');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (cartItemId: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    setUpdating(cartItemId);
    try {
      await apiService.removeCartItem(cartItemId);
      await fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Không thể xóa sản phẩm');
    } finally {
      setUpdating(null);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    try {
      const order = await apiService.checkoutFromCart();
      alert('Đặt hàng thành công!');
      router.push(`/orders/${order._id}`);
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Không thể đặt hàng');
    }
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.productId.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Giỏ Hàng</h1>
            </div>
            <p className="text-gray-600">
              {cartItems.length} sản phẩm
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Giỏ hàng trống
              </h3>
              <p className="text-gray-600 mb-6">
                Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl shadow-sm p-6 flex gap-4"
                  >
                    {/* Product Image */}
                    <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      {item.productId.image ? (
                        <Image
                          src={item.productId.image}
                          alt={item.productId.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.productId.name}
                      </h3>
                      <p className="text-green-600 font-bold text-xl">
                        {item.productId.price.toLocaleString('vi-VN')}đ
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item._id)}
                        disabled={updating === item._id}
                        className="text-red-600 hover:text-red-700 transition p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          disabled={updating === item._id || item.quantity <= 1}
                          className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          disabled={updating === item._id}
                          className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-lg font-bold text-gray-900">
                        {(item.productId.price * item.quantity).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Tổng đơn hàng
                  </h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Tạm tính</span>
                      <span>{totalAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Phí vận chuyển</span>
                      <span className="text-green-600">Miễn phí</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Tổng cộng</span>
                        <span className="text-2xl font-bold text-green-600">
                          {totalAmount.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition text-lg"
                  >
                    Đặt Hàng
                  </button>

                  <button
                    onClick={() => router.push('/')}
                    className="w-full mt-3 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
