'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Heart, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import { apiService, type Product } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Toast } from '../../components/ui';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await apiService.fetchProductById(params.id as string);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setAddingToCart(true);
    try {
      await apiService.addToCart(params.id as string, quantity);
      setToast({ message: 'Đã thêm vào giỏ hàng!', type: 'success' });
    } catch (error) {
      console.error('Error adding to cart:', error);
      setToast({ message: 'Không thể thêm vào giỏ hàng', type: 'error' });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setTogglingWishlist(true);
    try {
      const result = await apiService.toggleWishlist(params.id as string);
      setIsInWishlist(result.isInWishlist);
      setToast({ 
        message: result.isInWishlist ? 'Đã thêm vào yêu thích!' : 'Đã xóa khỏi yêu thích!', 
        type: 'success' 
      });
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      setToast({ message: 'Không thể cập nhật danh sách yêu thích', type: 'error' });
    } finally {
      setTogglingWishlist(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <p className="text-gray-600">Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  const finalPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </button>

        <div className="grid md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-lg p-8">
          {/* Product Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingCart className="w-24 h-24 text-gray-300" />
              </div>
            )}
            {product.discount && product.discount > 0 && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                -{product.discount}%
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {product.category && (
              <p className="text-sm text-gray-500 mb-4">
                Danh mục: <span className="text-green-600 font-medium">{product.category.name}</span>
              </p>
            )}

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-green-600">
                {finalPrice.toLocaleString('vi-VN')}đ
              </span>
              {product.discount && product.discount > 0 && (
                <span className="text-xl text-gray-400 line-through">
                  {product.price.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            {product.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Mô tả sản phẩm</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Tình trạng:{' '}
                <span className={product.stock && product.stock > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {product.stock && product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                </span>
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-16 text-center text-lg font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                  disabled={product.stock ? quantity >= product.stock : false}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || (product.stock !== undefined && product.stock <= 0)}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
              </button>
              <button
                onClick={handleToggleWishlist}
                disabled={togglingWishlist}
                className={`w-12 h-12 border-2 rounded-xl transition flex items-center justify-center ${
                  isInWishlist
                    ? 'bg-red-50 border-red-500 text-red-500'
                    : 'border-green-600 text-green-600 hover:bg-green-50'
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
