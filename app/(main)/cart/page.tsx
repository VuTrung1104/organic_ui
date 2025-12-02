'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { apiService, type CartItem } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout';
import { Toast } from '@/components/ui';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/lib/hooks';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, CONFIRM_MESSAGES } from '@/lib/constants';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toast, showToast } = useToast();
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

      if (!response || !response.data || !Array.isArray(response.data)) {
        setCartItems([]);
        return;
      }

      const mappedItems = response.data.map((item: any) => {
        const product = item.product;
        const primaryImage = product.images?.find((img: any) => img.isPrimary)?.url || product.images?.[0]?.url;
        
        return {
          _id: item.id || item._id,
          productId: {
            _id: product.id || product._id,
            name: product.name,
            price: product.price,
            image: primaryImage,
            stock: product.quantity || 0,
            category: product.category?.name || 'Chưa phân loại',
          },
          quantity: item.quantity,
          createdAt: item.createdAt,
        };
      });
      
      setCartItems(mappedItems);
    } catch (error) {
      console.error(ERROR_MESSAGES.CART_FETCH_FAILED, error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCartItems(prevItems => 
      prevItems.map(item => 
        item._id === cartItemId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    setUpdating(cartItemId);
    try {
      await apiService.updateCartItem(cartItemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      showToast(ERROR_MESSAGES.CART_UPDATE_FAILED, 'error');
      await fetchCart();
    } finally {
      setUpdating(null);
    }
  };

  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  const handleRemoveClick = (cartItemId: string) => {
    setItemToRemove(cartItemId);
  };

  const confirmRemove = async () => {
    if (!itemToRemove) return;

    setUpdating(itemToRemove);
    try {
      await apiService.removeCartItem(itemToRemove);
      await fetchCart();
      showToast(SUCCESS_MESSAGES.CART_ITEM_REMOVED, 'success');
    } catch (error) {
      console.error('Error removing item:', error);
      showToast(ERROR_MESSAGES.CART_REMOVE_FAILED, 'error');
    } finally {
      setUpdating(null);
      setItemToRemove(null);
    }
  };

  const handleCheckout = async () => {
    if (!cartItems || cartItems.length === 0) {
      showToast(ERROR_MESSAGES.CART_EMPTY, 'error');
      return;
    }

    try {
      const result = await apiService.checkoutFromCart();
      showToast(SUCCESS_MESSAGES.CHECKOUT_SUCCESS, 'success');

      setCartItems([]);
      
      setTimeout(() => {
        router.push('/profile/orders');
      }, 1500);
    } catch (error) {
      console.error('Error during checkout:', error);
      showToast(ERROR_MESSAGES.CHECKOUT_FAILED, 'error');
    }
  };

  const totalAmount = (cartItems || []).reduce(
    (sum, item) => sum + item.productId.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => {}}
        />
      )}
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.back()}
              className="p-1.5 bg-white hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors shadow-sm hover:shadow-md border border-gray-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Các Sản Phẩm Trong Giỏ</h1>
          </div>
          <hr className="border-gray-300 mb-6" />

          {!cartItems || cartItems.length === 0 ? (
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
                    className="bg-white rounded-xl shadow-sm p-6 flex gap-6 items-center"
                  >
                    {/* Product Image */}
                    <div className="relative w-36 h-36 shrink-0 rounded-xl overflow-hidden flex items-center justify-center bg-gray-100">
                      {item.productId.image ? (
                        <Image
                          src={item.productId.image}
                          alt={item.productId.name}
                          fill
                          className="object-cover"
                          sizes="144px"
                        />
                      ) : (
                        <span className="text-3xl font-bold text-gray-700">
                          {item.productId.name.substring(0, 3)}
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {item.productId.name}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {item.productId.category} | Đơn giá: {item.productId.price.toLocaleString('vi-VN')} đ/kg
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="inline-flex items-center gap-0 border border-gray-300 rounded-full overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          disabled={updating === item._id || item.quantity <= 1}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50 text-gray-600"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold text-base text-gray-600">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          disabled={updating === item._id}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50 text-gray-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-green-600 font-bold text-xl mt-3">
                        {(item.productId.price * item.quantity).toLocaleString('vi-VN')} đ
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleRemoveClick(item._id)}
                      disabled={updating === item._id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 transition p-3 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
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
                        <span className="text-lg text-gray-700 font-semibold">Tổng cộng</span>
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

      <ConfirmDialog
        isOpen={!!itemToRemove}
        title="Xóa sản phẩm"
        message={CONFIRM_MESSAGES.REMOVE_CART_ITEM}
        onConfirm={confirmRemove}
        onCancel={() => setItemToRemove(null)}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </>
  );
}
