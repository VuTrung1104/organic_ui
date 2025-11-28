import { Leaf } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '../lib/api';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const finalPrice = product.discount 
    ? product.price - (product.price * product.discount / 100)
    : product.price;

  const getBadge = () => {
    if (product.discount && product.discount > 20) return { text: 'Giảm Giá', color: 'bg-red-500' };
    if (product.stock && product.stock < 10) return { text: 'Sắp Hết', color: 'bg-orange-500' };
    return null;
  };

  const badge = getBadge();

  return (
    <Link href={`/product/${product._id}`} className="block bg-white rounded-xl shadow-sm hover:shadow-xl transition overflow-hidden group">
      <div className="relative h-48 bg-linear-to-br from-green-50 to-green-100 flex items-center justify-center overflow-hidden">
        {badge && (
          <span className={`absolute top-2 right-2 ${badge.color} text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md z-10`}>
            {badge.text}
          </span>
        )}
        {product.discount && product.discount > 0 && (
          <span className="absolute top-4 left-4 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md z-10">
            -{product.discount}%
          </span>
        )}
        
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
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Leaf className="w-20 h-20 text-green-600" />
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-2 mb-4">
          <p className="text-green-600 font-bold text-2xl">
            {finalPrice.toLocaleString('vi-VN')}đ/kg
          </p>
          {product.discount && product.discount > 0 && (
            <p className="text-gray-400 line-through text-lg">
              {product.price.toLocaleString('vi-VN')}đ
            </p>
          )}
        </div>
        <button className="w-full px-6 py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition">
          Thêm Vào Giỏ
        </button>
      </div>
    </Link>
  );
}
