'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, Heart, Plus, Minus, Facebook, Twitter, Instagram, Link2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { apiService, type Product } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Toast, ProductCard } from '@/components/ui';
import { Header, Footer } from '@/components/layout';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await apiService.fetchProductById(params.id as string);
        if (!data) {
          setError('Không tìm thấy sản phẩm');
        } else {
          setProduct(data);
          
          try {
            const productsData = await apiService.fetchProducts({ page: 1, limit: 100, includeDeleted: false });
            if (productsData?.data && Array.isArray(productsData.data)) {
              const allProducts = productsData.data.filter((p: Product) => p._id !== data._id);

              for (let i = allProducts.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allProducts[i], allProducts[j]] = [allProducts[j], allProducts[i]];
              }

              setRelatedProducts(allProducts.slice(0, 4));
            } else {
              setRelatedProducts([]);
            }
          } catch (err) {
            setRelatedProducts([]);
          }
        }
      } catch (error) {
        setError('Có lỗi xảy ra khi tải sản phẩm');
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
      await apiService.toggleWishlist(params.id as string);
      const newState = !isInWishlist;
      setIsInWishlist(newState);
      setToast({ 
        message: newState ? 'Đã thêm vào yêu thích!' : 'Đã xóa khỏi yêu thích!', 
        type: 'success' 
      });
    } catch (error) {
      setToast({ message: 'Không thể cập nhật danh sách yêu thích', type: 'error' });
    } finally {
      setTogglingWishlist(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải sản phẩm...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <p className="text-gray-600 mb-4">{error || 'Không tìm thấy sản phẩm'}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Quay lại
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images.map((img: any) => img.url || img)
    : [product.image];

  const generateRating = (id: string) => {
    if (!id) return 4.0;
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash = hash & hash;
    }
    return 3.5 + (Math.abs(hash) % 15) / 10; 
  };

  const generateReviewCount = (id: string) => {
    if (!id) return 100; 
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash = hash & hash;
    }
    return 50 + (Math.abs(hash) % 500); 
  };

  const rating = generateRating(product._id);
  const reviewCount = generateReviewCount(product._id);
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

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
          <div className="grid lg:grid-cols-2 gap-8 bg-white rounded-lg shadow-sm p-6">
            {/* Product Images */}
            <div className="space-y-4 flex flex-col items-center">
              {/* Main Image */}
              <button
                onClick={() => setIsImageModalOpen(true)}
                className="relative aspect-square max-w-sm w-full cursor-pointer hover:opacity-90 transition"
              >
                {images[selectedImage] ? (
                  <Image
                    src={images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <ShoppingCart className="w-24 h-24 text-gray-300" />
                  </div>
                )}
              </button>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 max-w-sm w-full">
                  {images.length > 3 && (
                    <button
                      onClick={() => setThumbnailStartIndex(Math.max(0, thumbnailStartIndex - 1))}
                      disabled={thumbnailStartIndex === 0}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:border-green-600 hover:text-green-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-3 gap-3 flex-1">
                    {images.slice(thumbnailStartIndex, thumbnailStartIndex + 3).map((img: string, idx: number) => {
                      const actualIdx = thumbnailStartIndex + idx;
                      return (
                        <button
                          key={actualIdx}
                          onClick={() => setSelectedImage(actualIdx)}
                          className={`relative aspect-square overflow-hidden border-2 transition ${
                            selectedImage === actualIdx ? 'border-green-600' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`${product.name} ${actualIdx + 1}`}
                            fill
                            className="object-cover"
                            sizes="100px"
                          />
                        </button>
                      );
                    })}
                  </div>
                  {images.length > 3 && (
                    <button
                      onClick={() => setThumbnailStartIndex(Math.min(images.length - 3, thumbnailStartIndex + 1))}
                      disabled={thumbnailStartIndex >= images.length - 3}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:border-green-600 hover:text-green-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-3">
              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, index) => (
                    <span key={index} className="text-yellow-400 text-base">
                      {index < fullStars ? '★' : index === fullStars && hasHalfStar ? '⯨' : '☆'}
                    </span>
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-900">{rating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({reviewCount} đánh giá)</span>
              </div>

              {/* Price */}
              <div>
                <span className="text-2xl font-bold text-red-600">
                  {(product.price * quantity).toLocaleString('vi-VN')}đ
                </span>
              </div>

              {/* Divider Line */}
              <div className="border-t border-gray-200 pt-3"></div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">Tình trạng:</span>
                {product.stock && product.stock > 0 ? (
                  <span className="text-sm font-semibold text-red-600">Còn hàng</span>
                ) : (
                  <span className="text-sm font-semibold text-red-600">Hết hàng</span>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">Số lượng:</span>
                <div className="flex items-center border border-gray-300 rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-l-full transition disabled:opacity-50 text-gray-600"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={product.stock ? quantity >= product.stock : false}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-r-full transition disabled:opacity-50 text-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-lg font-semibold text-gray-700">Mô tả chi tiết</h3>
                  <div className="w-27 border-t-2 border-green-600 mb-2"></div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart || (product.stock !== undefined && product.stock <= 0)}
                    className="flex-1 bg-green-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                    <ShoppingCart className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleToggleWishlist}
                    disabled={togglingWishlist}
                    className={`w-12 h-12 border-2 rounded-full transition flex items-center justify-center ${
                      isInWishlist
                        ? 'bg-red-50 border-red-500 text-red-500'
                        : 'border-gray-400 text-gray-400 hover:border-red-500 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Share Item */}
              <div className="pt-8 mt-8 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Chia sẻ:</span>
                  <div className="flex gap-2">
                    <button className="w-9 h-9 rounded-full border border-gray-500 flex items-center justify-center hover:border-green-600 hover:text-green-600 transition text-gray-500">
                      <Facebook className="w-4 h-4" />
                    </button>
                    <button className="w-9 h-9 rounded-full border border-gray-500 flex items-center justify-center hover:border-green-600 hover:text-green-600 transition text-gray-500">
                      <Twitter className="w-4 h-4" />
                    </button>
                    <button className="w-9 h-9 rounded-full border border-gray-500 flex items-center justify-center hover:border-green-600 hover:text-green-600 transition text-gray-500">
                      <Link2 className="w-4 h-4" />
                    </button>
                    <button className="w-9 h-9 rounded-full border border-gray-500 flex items-center justify-center hover:border-green-600 hover:text-green-600 transition text-gray-500">
                      <Instagram className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Category */}
              {product.category && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium text-gray-700">Danh mục:</span>
                    <span className="text-sm text-gray-600">{product.category.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <div key={relatedProduct._id} className="scale-90">
                    <ProductCard product={relatedProduct} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && (
        <div 
          className="fixed inset-0 bg-black/70 bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <button
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 hover:border-green-600 hover:text-green-600 transition z-10 bg-white/70"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Button - Left Side */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage((selectedImage - 1 + images.length) % images.length);
            }}
            className="absolute left-4 w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 hover:border-green-600 hover:text-green-600 transition bg-white/70 shrink-0 z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center justify-center w-full max-w-4xl">
            <div 
              className="relative w-full max-w-lg aspect-square mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          </div>

          {/* Next Button - Right Side */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage((selectedImage + 1) % images.length);
            }}
            className="absolute right-4 w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 hover:border-green-600 hover:text-green-600 transition bg-white/70 shrink-0 z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
            {selectedImage + 1} / {images.length}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}


