'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, MapPin, Edit2, Trash2, Check } from 'lucide-react';
import { apiService, type Address } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Toast } from '@/components/ui';
import { useToast } from '@/lib/hooks';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, CONFIRM_MESSAGES } from '@/lib/constants';

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toast, showToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullname: '',
    phoneNumber: '',
    addressLine: '',
    ward: '',
    district: '',
    city: '',
    isDefault: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchAddresses();
  }, [isAuthenticated, router]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAddresses();
      setAddresses(response.data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      showToast(ERROR_MESSAGES.ADDRESS_FETCH_FAILED, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullname: '',
      phoneNumber: '',
      addressLine: '',
      ward: '',
      district: '',
      city: '',
      isDefault: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (address: Address) => {
    setFormData({
      fullname: address.fullname,
      phoneNumber: address.phoneNumber,
      addressLine: address.addressLine,
      ward: address.ward || '',
      district: address.district || '',
      city: address.city,
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiService.updateAddress(editingId, formData);
        showToast(SUCCESS_MESSAGES.ADDRESS_UPDATE_SUCCESS, 'success');
      } else {
        await apiService.createAddress(formData);
        showToast(SUCCESS_MESSAGES.ADDRESS_CREATE_SUCCESS, 'success');
      }
      resetForm();
      fetchAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      showToast(ERROR_MESSAGES.ADDRESS_SAVE_FAILED, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(CONFIRM_MESSAGES.DELETE_ADDRESS)) return;
    
    try {
      await apiService.deleteAddress(id);
      showToast(SUCCESS_MESSAGES.ADDRESS_DELETE_SUCCESS, 'success');
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      showToast(ERROR_MESSAGES.ADDRESS_DELETE_FAILED, 'error');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await apiService.setDefaultAddress(id);
      showToast(SUCCESS_MESSAGES.ADDRESS_SET_DEFAULT_SUCCESS, 'success');
      fetchAddresses();
    } catch (error) {
      console.error('Error setting default:', error);
      showToast(ERROR_MESSAGES.ADDRESS_SET_DEFAULT_FAILED, 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => {}} />}
      
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Địa Chỉ Của Tôi</h1>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Plus className="w-4 h-4" />
                Thêm địa chỉ
              </button>
            )}
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editingId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullname}
                      onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-600 placeholder:opacity-100 text-gray-700"
                      placeholder="Nhập họ tên người nhận"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-600 placeholder:opacity-100 text-gray-700"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ chi tiết <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.addressLine}
                    onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-600 placeholder:opacity-100 text-gray-700"
                    placeholder="Số nhà, tên đường..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phường/Xã</label>
                    <input
                      type="text"
                      value={formData.ward}
                      onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-600 placeholder:opacity-100 text-gray-700"
                      placeholder="Phường/Xã"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện</label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-600 placeholder:opacity-100 text-gray-700"
                      placeholder="Quận/Huyện"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-600 placeholder:opacity-100 text-gray-700"
                      placeholder="Tỉnh/Thành phố"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="isDefault" className="text-sm text-gray-700">
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    {editingId ? 'Cập nhật' : 'Thêm địa chỉ'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Address List */}
          {addresses.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Bạn chưa có địa chỉ nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`bg-white rounded-2xl shadow-lg p-6 ${
                    address.isDefault ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{address.fullname}</span>
                          <span className="text-gray-500">|</span>
                          <span className="text-gray-700">{address.phoneNumber}</span>
                        </div>
                        {address.isDefault && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full mb-2">
                            <Check className="w-3 h-3" />
                            Mặc định
                          </span>
                        )}
                        <p className="text-gray-600">
                          {address.addressLine}
                          {address.ward && `, ${address.ward}`}
                          {address.district && `, ${address.district}`}
                          {`, ${address.city}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(address)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Đặt làm mặc định
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
