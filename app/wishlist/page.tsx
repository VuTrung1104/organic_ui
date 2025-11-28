'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart } from 'lucide-react';
import { apiService, type Product } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const response = await apiService.getWishlist({ limit: 100 });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Sản Phẩm Yêu Thích</h1>
            </div>
            <p className="text-gray-600">{products.length} sản phẩm</p>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Chưa có sản phẩm yêu thích
              </h3>
              <p className="text-gray-600 mb-6">
                Hãy thêm sản phẩm vào danh sách yêu thích để dễ dàng theo dõi
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
              >
                Khám phá sản phẩm
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
