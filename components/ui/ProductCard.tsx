'use client';

import { Leaf, ShoppingCart, Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, memo, useCallback } from 'react';
import { apiService } from '@/lib/api';
import { STORAGE_KEYS } from '@/lib/constants';
import type { Product } from '@/lib/api';
import { Toast } from '@/components/ui';
import LazyImage from '@/components/ui/LazyImage';

interface ProductCardProps {
  product: Product;
  isInWishlist?: boolean;
  onWishlistChange?: () => void;
}

function ProductCard({ product, isInWishlist = false, onWishlistChange }: ProductCardProps) {
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist);
  const [isToggling, setIsToggling] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const price = product.price || 0;
  const discount = product.discount || 0;
  const finalPrice = discount > 0
    ? price - (price * discount / 100)
    : price;

  const stock = (product as any).quantity ?? product.stock ?? 100;
  const isOutOfStock = stock <= 0;
  
  // Determine stock status
  const getStockStatus = () => {
    if (stock === 0) {
      return { 
        text: 'Hết hàng', 
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        dotColor: 'bg-red-600',
        animation: 'animate-pulse'
      };
    } else if (stock > 0 && stock <= 10) {
      return { 
        text: 'Sắp hết', 
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        dotColor: 'bg-yellow-500',
        animation: 'animate-pulse'
      };
    } else {
      return { 
        text: 'Còn hàng', 
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        dotColor: 'bg-green-500',
        animation: ''
      };
    }
  };

  const stockStatus = getStockStatus();

  const handleToggleWishlist = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is logged in
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) {
      router.push('/login');
      return;
    }

    if (isToggling) return;

    setIsToggling(true);
    try {
      const result = await apiService.toggleWishlist(product._id);
      const newWishlistState = result?.isInWishlist ?? !isWishlisted;
      setIsWishlisted(newWishlistState);

      if (newWishlistState) {
        setToast({ message: 'Đã thêm vào danh sách yêu thích!', type: 'success' });
      } else {
        setToast({ message: 'Đã xóa khỏi danh sách yêu thích!', type: 'success' });
        if (onWishlistChange) {
          setTimeout(() => {
            onWishlistChange();
          }, 500);
        }
      }
    } catch (error) {
      setToast({ message: 'Có lỗi xảy ra, vui lòng thử lại!', type: 'error' });
    } finally {
      setIsToggling(false);
    }
  }, [product._id, isWishlisted, onWishlistChange, router]);

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    // Check if user is logged in
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      await apiService.addToCart(product._id, 1);
      setToast({ message: 'Đã thêm vào giỏ hàng!', type: 'success' });
    } catch (error) {
      console.error('Error adding to cart:', error);
      setToast({ message: 'Có lỗi xảy ra khi thêm vào giỏ hàng!', type: 'error' });
    }
  }, [product._id, isOutOfStock, router]);

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Image Container */}
        <Link href={`/products/${product._id}`} className="block relative aspect-4/3 overflow-hidden bg-gray-100 group/image">
          {(product.image && typeof product.image === 'string' && product.image.trim()) || (product.images && product.images.length > 0) ? (
            <LazyImage
              src={
                product.image && typeof product.image === 'string' && product.image.trim() 
                  ? product.image 
                  : typeof product.images![0] === 'string' 
                    ? product.images![0] 
                    : (product.images![0] as { url: string })?.url || ''
              }
              alt={product.name}
              className="w-full h-full"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              objectFit="cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Leaf className="w-20 h-20 text-gray-300" />
            </div>
          )}
          
          {/* Wishlist Button */}
          <button 
            onClick={handleToggleWishlist}
            disabled={isToggling}
            className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors z-10 group/wishlist disabled:opacity-50"
          >
            <Heart className={`w-5 h-5 transition-colors ${
              isWishlisted 
                ? 'text-red-500 fill-red-500' 
                : 'text-gray-600 group-hover/wishlist:text-red-500 group-hover/wishlist:fill-red-500'
            }`} />
          </button>
        </Link>

        {/* Content */}
        <div className="p-4">
          {/* Category Badge */}
          {product.category && (
            <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full mb-2">
              {typeof product.category === 'string' ? product.category : product.category.name}
            </span>
          )}

          {/* Product Name */}
          <Link href={`/products/${product._id}`}>
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 hover:text-green-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-3">
            <span 
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${stockStatus.bgColor} ${stockStatus.color} ${stockStatus.animation}`}
            >
              <span className={`w-2 h-2 rounded-full ${stockStatus.dotColor} ${stockStatus.animation}`}></span>
              {stockStatus.text}
            </span>
          </div>

          {/* Price & Cart */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-red-400">
                {finalPrice > 0 ? finalPrice.toLocaleString('vi-VN') : '0'} <span className="text-sm font-normal">đ</span>
              </p>
              {discount > 0 && price > 0 && (
                <p className="text-xs text-gray-400 line-through">
                  {price.toLocaleString('vi-VN')}đ
                </p>
              )}
            </div>
            <button 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-md ${
                isOutOfStock 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              title={isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(ProductCard);
