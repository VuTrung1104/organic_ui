'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, X, Upload, Image as ImageIcon, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService, type Product, type Category } from '../../lib/api';
import { Toast, ConfirmDialog } from '../../components/ui';

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageIds, setExistingImageIds] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    categoryId: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await apiService.fetchProducts({ 
        page: currentPage,
        limit: 10, 
        includeDeleted: false 
      });
      setProducts(response.data);
      setTotal(response.pagination?.total || response.total || 0);
      setTotalPages(response.pagination?.totalPages || Math.ceil((response.pagination?.total || response.total || 0) / 10));
    } catch (error) {
      console.error('Error fetching products:', error);
      setToast({ message: 'Không thể tải danh sách sản phẩm', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiService.fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        quantity: (product as any).quantity || product.stock || 0,
        categoryId: product.category?._id || '',
      });
      setImageFiles([]);

      const existingImages: string[] = [];
      const imageIds: string[] = [];
      
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach(img => {
          if (typeof img === 'object' && img.url) {
            existingImages.push(img.url);
            imageIds.push(img.id || '');
          } else if (typeof img === 'string') {
            existingImages.push(img);
          }
        });
      } else if (product.image) {
        existingImages.push(product.image);
      }
      
      setImagePreviews(existingImages);
      setExistingImageIds(imageIds);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        quantity: 0,
        categoryId: '',
      });
      setImageFiles([]);
      setImagePreviews([]);
      setExistingImageIds([]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImageIds([]);
  };

  const handleImageFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length !== fileArray.length) {
      setToast({ message: 'Chỉ chấp nhận file ảnh!', type: 'error' });
    }

    const limitedFiles = validFiles.slice(0, 5);
    setImageFiles(limitedFiles);

    const previews = limitedFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleImageFiles(e.target.files);
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = imagePreviews[index];
    const imageId = existingImageIds[index];

    const isExistingImage = imageUrl && imageUrl.startsWith('http') && imageId;
    
    if (isExistingImage && editingProduct) {
      // Show confirm dialog
      setConfirmDialog({
        isOpen: true,
        title: 'Xóa ảnh sản phẩm',
        message: 'Bạn có chắc chắn muốn xóa ảnh này khỏi sản phẩm không?',
        onConfirm: async () => {
          try {
            const productId = (editingProduct as any).id || editingProduct._id;
            await apiService.deleteProductImage(productId, imageId);
            
            // Remove from state
            const newFiles = imageFiles.filter((_, i) => i !== index);
            const newPreviews = imagePreviews.filter((_, i) => i !== index);
            const newImageIds = existingImageIds.filter((_, i) => i !== index);
            setImageFiles(newFiles);
            setImagePreviews(newPreviews);
            setExistingImageIds(newImageIds);
            
            setToast({ message: 'Đã xóa ảnh thành công!', type: 'success' });
          } catch (error) {
            console.error('Error deleting image:', error);
            setToast({ message: 'Không thể xóa ảnh!', type: 'error' });
          } finally {
            setConfirmDialog({ ...confirmDialog, isOpen: false });
          }
        },
      });
    } else {
      const newFiles = imageFiles.filter((_, i) => i !== index);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      const newImageIds = existingImageIds.filter((_, i) => i !== index);
      setImageFiles(newFiles);
      setImagePreviews(newPreviews);
      setExistingImageIds(newImageIds);
    }
  };

  const uploadImages = async (productId: string): Promise<void> => {
    if (imageFiles.length === 0) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      imageFiles.forEach((file) => {
        formDataUpload.append('images', file);
      });

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/product/${productId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }

      await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const dataToSubmit = { ...formData };

      if (dataToSubmit.categoryId) {
        const isValidObjectId = /^[a-f\d]{24}$/i.test(dataToSubmit.categoryId);
        if (!isValidObjectId) {
          delete (dataToSubmit as any).categoryId;
        }
      } else {
        delete (dataToSubmit as any).categoryId;
      }

      let productId: string;
      let isNewProduct = false;

      if (editingProduct) {
        const editProductId = (editingProduct as any).id || editingProduct._id;
        await apiService.updateProduct(editProductId, dataToSubmit);
        productId = editProductId;
      } else {
        const newProduct = await apiService.createProduct(dataToSubmit);
        productId = (newProduct as any).id || newProduct._id;
        isNewProduct = true;
      }

      if (imageFiles.length > 0) {
        await uploadImages(productId);
      }

      handleCloseModal();
      await fetchProducts();

      if (isNewProduct) {
        setToast({ 
          message: imageFiles.length > 0 
            ? 'Thêm sản phẩm và ảnh thành công!' 
            : 'Thêm sản phẩm thành công!', 
          type: 'success' 
        });
      } else {
        setToast({ 
          message: imageFiles.length > 0 
            ? 'Cập nhật sản phẩm và ảnh thành công!' 
            : 'Cập nhật sản phẩm thành công!', 
          type: 'success' 
        });
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setToast({ message: 'Có lỗi xảy ra khi lưu sản phẩm!', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa sản phẩm',
      message: 'Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.',
      onConfirm: async () => {
        try {
          await apiService.deleteProduct(productId);
          setToast({ message: 'Xóa sản phẩm thành công!', type: 'success' });
          fetchProducts();
        } catch (error) {
          console.error('Error deleting product:', error);
          setToast({ message: 'Không thể xóa sản phẩm!', type: 'error' });
        } finally {
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      },
    });
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Quản Lý Sản Phẩm</h2>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Plus className="w-5 h-5" />
            Thêm Sản Phẩm
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hình Ảnh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên Sản Phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh Mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số Lượng
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const productImages = (product as any).images || product.images || [];
                  const displayImage = productImages.length > 0 
                    ? productImages[0].url || productImages[0] 
                    : product.image;
                  
                  // Find category name from categoryId
                  const categoryName = (product as any).categoryId 
                    ? categories.find(cat => cat._id === (product as any).categoryId)?.name 
                    : product.category?.name;
                  
                  return (
                  <tr key={(product as any).id || product._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {displayImage ? (
                          <img
                            src={displayImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                      {product.description && (
                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {categoryName || 'Chưa phân loại'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-green-600">
                        {product.price.toLocaleString('vi-VN')}đ
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${
                        ((product as any).quantity || product.stock || 0) > 10 ? 'text-green-600' : 
                        ((product as any).quantity || product.stock || 0) > 0 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {(product as any).quantity || product.stock || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="inline-flex items-center justify-center w-9 h-9 text-blue-600 hover:bg-blue-50 rounded-lg transition mr-2"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete((product as any).id || product._id)}
                        className="inline-flex items-center justify-center w-9 h-9 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Xóa"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 px-4">
            <div className="text-sm text-gray-600">
              Hiển thị {products.length} / {total} sản phẩm
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition ${
                      currentPage === page
                        ? 'bg-green-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Tên Sản Phẩm
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="VD: Cà chua"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Mô Tả
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="VD: Cà chua ngon quá hẹ hẹ..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-gray-600"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Danh Mục
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-600"
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Số Lượng
                      </label>
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                        placeholder="100"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-600"
                        required
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Giá Bán
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      placeholder="50000"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-600"
                      required
                      min="0"
                    />
                  </div>

                  {/* Image Upload Area */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Hình Ảnh Sản Phẩm
                    </label>
                    
                    {/* Drag & Drop Area */}
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-green-500 bg-green-50 scale-105'
                          : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className={`p-3 rounded-full mb-3 ${isDragging ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <Upload className={`w-8 h-8 ${isDragging ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          {isDragging ? 'Thả ảnh vào đây' : 'Kéo thả ảnh hoặc click để chọn'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Hỗ trợ: PNG, JPG, GIF • Tối đa 5 ảnh
                        </p>
                      </div>
                    </div>

                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-5 gap-3 mt-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                      disabled={uploading}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                    >
                      {uploading ? 'Đang xử lý...' : (editingProduct ? 'Cập Nhật' : 'Thêm Mới')}
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