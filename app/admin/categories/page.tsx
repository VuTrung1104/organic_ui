'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { apiService, type Category } from '@/lib/api';
import { Toast } from '@/components/ui';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/lib/hooks';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, CONFIRM_MESSAGES } from '@/lib/constants';

export default function CategoriesManager() {
  const { toast, showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await apiService.fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast(ERROR_MESSAGES.CATEGORIES_FETCH_FAILED, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const categoryId = (editingCategory as any).id || editingCategory._id;
        await apiService.updateCategory(categoryId, formData);
        showToast(SUCCESS_MESSAGES.CATEGORY_UPDATE_SUCCESS, 'success');
      } else {
        await apiService.createCategory(formData);
        showToast(SUCCESS_MESSAGES.CATEGORY_CREATE_SUCCESS, 'success');
      }
      handleCloseModal();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      showToast(ERROR_MESSAGES.CATEGORY_SAVE_FAILED, 'error');
    }
  };

  const handleDeleteClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      await apiService.deleteCategory(categoryToDelete);
      showToast(SUCCESS_MESSAGES.CATEGORY_DELETE_SUCCESS, 'success');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast(ERROR_MESSAGES.CATEGORY_DELETE_FAILED, 'error');
    } finally {
      setCategoryToDelete(null);
    }
  };

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

      <ConfirmDialog
        isOpen={!!categoryToDelete}
        title="Xóa danh mục"
        message={CONFIRM_MESSAGES.DELETE_CATEGORY}
        onConfirm={confirmDelete}
        onCancel={() => setCategoryToDelete(null)}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Quản Lý Danh Mục</h2>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Plus className="w-5 h-5" />
            Thêm Danh Mục
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={(category as any).id || category._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(category)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick((category as any).id || category._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">Chưa có danh mục nào. Hãy thêm danh mục đầu tiên!</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên Danh Mục
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
                      required
                      placeholder="VD: Rau củ quả"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      {editingCategory ? 'Cập Nhật' : 'Thêm Mới'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
