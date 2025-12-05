'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, CreditCard, Package, Wallet, ChevronDown } from 'lucide-react';
import { apiService, type CartItem, type Address } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Header, Footer } from '@/components/layout';
import { Toast } from '@/components/ui';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/lib/constants';
import { formatPrice } from '@/lib/utils/formatters';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'MOMO' | 'BANK_TRANSFER'>('COD');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch cart items
        const cartResponse = await apiService.getCart({ page: 1, limit: 100 });
        const items = Array.isArray(cartResponse) ? cartResponse : (cartResponse.data || []);
        
        if (!items || items.length === 0) {
          setToast({ message: ERROR_MESSAGES.CART_EMPTY, type: 'error' });
          setTimeout(() => router.push('/cart'), 1500);
          return;
        }
        
        setCartItems(items);

        // Fetch addresses
        const addressResponse = await apiService.getAddresses();
        const addressList = Array.isArray(addressResponse) ? addressResponse : (addressResponse.data || []);
        setAddresses(addressList);
        
        // Select default address
        const defaultAddr = addressList.find((addr: Address) => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr.id);
        } else if (addressList.length > 0) {
          setSelectedAddress(addressList[0].id);
        }
      } catch (error) {
        setToast({ message: 'Không thể tải thông tin', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, router]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setToast({ message: 'Vui lòng chọn địa chỉ giao hàng', type: 'error' });
      return;
    }

    // Validate amount for MoMo (min 1,000 VND, max 50,000,000 VND)
    if (paymentMethod === 'MOMO') {
      if (totalAmount < 1000) {
        setToast({ message: 'Số tiền thanh toán phải ít nhất 1,000 VNĐ', type: 'error' });
        return;
      }
      if (totalAmount > 50000000) {
        setToast({ message: 'Số tiền thanh toán không được vượt quá 50,000,000 VNĐ', type: 'error' });
        return;
      }
    }

    setProcessing(true);
    try {
      const orderResult = await apiService.checkoutFromCart(paymentMethod, selectedAddress);

      if (paymentMethod === 'MOMO') {
        const momoResult = await apiService.createMomoPayment(
          totalAmount,
          `Thanh toán đơn hàng #${orderResult.orderId}`
        );

        if (momoResult.payUrl) {
          window.location.href = momoResult.payUrl;
        }
        return;
      }

      setToast({ message: SUCCESS_MESSAGES.CHECKOUT_SUCCESS, type: 'success' });
      setTimeout(() => {
        router.push('/orders');
      }, 1500);
    } catch (error) {
      setToast({ message: ERROR_MESSAGES.CHECKOUT_FAILED, type: 'error' });
      setProcessing(false);
    }
  };

  const totalAmount = cartItems.reduce(
    (sum, item: any) => {
      const product = item.productId || item.product;
      if (product && product.price) {
        return sum + product.price * item.quantity;
      }
      return sum;
    },
    0
  );

  const selectedAddressData = addresses.find(addr => addr.id === selectedAddress);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
        <Footer />
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
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => router.push('/cart')}
              className="p-2 hover:bg-white rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Thanh Toán</h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">Địa Chỉ Giao Hàng</h2>
                </div>

                {addresses.length > 0 ? (
                  <div className="space-y-3">
                    {/* Display Selected Address */}
                    {selectedAddressData && (
                      <div className="p-4 border-2 border-green-600 bg-green-50 rounded-xl">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {selectedAddressData.fullname}
                              {selectedAddressData.isDefault && (
                                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                  Mặc định
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{selectedAddressData.phoneNumber}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {selectedAddressData.addressLine}
                              {selectedAddressData.ward && `, ${selectedAddressData.ward}`}
                              {selectedAddressData.district && `, ${selectedAddressData.district}`}
                              {selectedAddressData.city && `, ${selectedAddressData.city}`}
                            </p>
                          </div>
                          <button
                            onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                            className="ml-4 px-4 py-2 text-sm text-green-600 hover:bg-green-100 rounded-lg transition flex items-center gap-2"
                          >
                            Thay đổi
                            <ChevronDown className={`w-4 h-4 transition-transform ${showAddressDropdown ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Dropdown Other Addresses */}
                    {showAddressDropdown && (
                      <div className="space-y-2 border border-gray-200 rounded-xl p-3 bg-gray-50">
                        {addresses
                          .filter(addr => addr.id !== selectedAddress)
                          .map((address) => (
                            <button
                              key={address.id}
                              onClick={() => {
                                setSelectedAddress(address.id);
                                setShowAddressDropdown(false);
                              }}
                              className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-green-600 hover:bg-white transition"
                            >
                              <p className="font-semibold text-gray-900 text-sm">
                                {address.fullname}
                                {address.isDefault && (
                                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                    Mặc định
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">{address.phoneNumber}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                {address.addressLine}
                                {address.ward && `, ${address.ward}`}
                                {address.district && `, ${address.district}`}
                                {address.city && `, ${address.city}`}
                              </p>
                            </button>
                          ))}
                      </div>
                    )}

                    <button
                      onClick={() => router.push('/profile/addresses')}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-green-600 hover:text-green-600 transition"
                    >
                      + Thêm địa chỉ mới
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Chưa có địa chỉ giao hàng</p>
                    <button
                      onClick={() => router.push('/profile/addresses')}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Thêm địa chỉ
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">Phương Thức Thanh Toán</h2>
                </div>

                <div className="space-y-3">
                  <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition ${
                    paymentMethod === 'COD' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-4 h-4 text-green-600"
                    />
                    <Package className="w-6 h-6 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận hàng</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition ${
                    paymentMethod === 'MOMO' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="MOMO"
                      checked={paymentMethod === 'MOMO'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-4 h-4 text-green-600"
                    />
                    <Wallet className="w-6 h-6 text-pink-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Ví điện tử MoMo</p>
                      <p className="text-sm text-gray-600">Thanh toán qua ví MoMo</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition ${
                    paymentMethod === 'BANK_TRANSFER' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="BANK_TRANSFER"
                      checked={paymentMethod === 'BANK_TRANSFER'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-4 h-4 text-green-600"
                    />
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">VNPay</p>
                      <p className="text-sm text-gray-600">Thanh toán qua VNPay</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt Đơn hàng</h2>

                {/* Product List */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto border-b border-gray-200 pb-6">
                  {cartItems.length > 0 ? (
                    cartItems.map((item: any) => {
                      const product = item.productId || item.product;
                      if (!product) return null;
                      return (
                        <div key={item._id || item.id} className="flex justify-between items-start text-sm">
                          <div className="flex-1">
                            <p className="text-gray-700">
                              {product.name || 'Sản phẩm'} x {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900 ml-2">
                            {formatPrice((product.price || 0) * item.quantity)}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-gray-500 py-4">Không có sản phẩm nào</p>
                  )}
                </div>

                {/* Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Tạm tính ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} SP)</span>
                    <span className="font-semibold">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Phí Vận chuyển</span>
                    <span className="font-semibold text-green-600">Miễn phí</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Tổng thanh toán</span>
                      <span className="text-2xl font-bold text-red-400">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={processing || !selectedAddress}
                  className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {processing 
                    ? (paymentMethod === 'MOMO' ? 'Đang tạo mã QR...' : 'Đang xử lý...')
                    : (paymentMethod === 'MOMO' ? 'Tạo mã QR thanh toán' : 
                       paymentMethod === 'BANK_TRANSFER' ? 'Xác nhận đặt hàng' : 
                       'Hoàn tất Đặt hàng')
                  }
                </button>
                
                {paymentMethod === 'MOMO' && (
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Quét mã QR MoMo để thanh toán nhanh chóng
                  </p>
                )}
                {paymentMethod === 'BANK_TRANSFER' && (
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Thông tin chuyển khoản sẽ được gửi qua email
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
