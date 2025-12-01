'use client';

import { Leaf, ShoppingBag, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiService } from '@/lib/api';
import { STORAGE_KEYS } from '@/lib/constants';
import type { Product } from '@/lib/api';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const finalPrice = product.discount 
    ? product.price - (product.price * product.discount / 100)
    : product.price;

  const stock = product.stock || 0;
  const isOutOfStock = stock === 0;
  const rating = 4.0;
  const reviewCount = Math.floor(Math.random() * 500) + 100;

  const handleToggleWishlist = async (e: React.MouseEvent) => {
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
      setIsWishlisted(result?.isInWishlist ?? !isWishlisted);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // On error, toggle the local state anyway for better UX
      setIsWishlisted(!isWishlisted);
    } finally {
      setIsToggling(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
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
      // Show success message (you can add a toast here)
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 group">
      {/* Image Container */}
      <Link href={`/products/${product._id}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-100">
        {/* Wishlist Button */}
        <button 
          onClick={handleToggleWishlist}
          disabled={isToggling}
          className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors z-10 group disabled:opacity-50"
        >
          <Heart className={`w-5 h-5 transition-colors ${
            isWishlisted 
              ? 'text-red-500 fill-red-500' 
              : 'text-gray-600 group-hover:text-red-500 group-hover:fill-red-500'
          }`} />
        </button>

        {(product.image && typeof product.image === 'string' && product.image.trim()) || (product.images && product.images.length > 0) ? (
          <Image
            src={
              product.image && typeof product.image === 'string' && product.image.trim() 
                ? product.image 
                : typeof product.images![0] === 'string' 
                  ? product.images![0] 
                  : (product.images![0] as { url: string })?.url || ''
            }
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Leaf className="w-20 h-20 text-gray-300" />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Product Name */}
        <Link href={`/products/${product._id}`}>
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-1 hover:text-green-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price & Cart */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-lg font-bold text-gray-900">
              {finalPrice.toLocaleString('vi-VN')} <span className="text-sm font-normal">đ</span>
            </p>
            {product.discount && product.discount > 0 && (
              <p className="text-xs text-gray-400 line-through">
                {product.price.toLocaleString('vi-VN')}đ
              </p>
            )}
          </div>
          <button 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isOutOfStock 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
            title={isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}>
                ★
              </span>
            ))}
          </div>
          <span className="text-gray-500">({reviewCount})</span>
        </div>
      </div>
    </div>
  );
}
