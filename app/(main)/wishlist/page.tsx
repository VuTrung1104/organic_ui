'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService, type Product } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout';
import { ProductCard } from '@/components/ui';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 10;

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await apiService.getWishlist({ page: currentPage, limit: itemsPerPage });
      
      let wishlistProducts: Product[] = [];
      let paginationData = { total: 0, totalPages: 1 };
      
      if (Array.isArray(response)) {
        wishlistProducts = response.map((item: any) => {
          const product = item.product || item;
          const images = product.images?.map((img: any) => img.url || img) || [];
          return {
            ...product,
            _id: product.id || product._id,
            stock: product.quantity || product.stock || 0,
            images: images,
            category: product.category ? {
              ...product.category,
              _id: product.category.id || product.category._id,
            } : product.category,
          };
        });
      } else if (response.data && Array.isArray(response.data)) {
        wishlistProducts = response.data.map((item: any) => {
          const product = item.product || item;
          const images = product.images?.map((img: any) => img.url || img) || [];
          return {
            ...product,
            _id: product.id || product._id,
            stock: product.quantity || product.stock || 0,
            images: images,
            category: product.category ? {
              ...product.category,
              _id: product.category.id || product.category._id,
            } : product.category,
          };
        });

        if (response.pagination) {
          paginationData = {
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          };
        }
      } else if (response) {
        wishlistProducts = [];
      }
      
      setProducts(wishlistProducts);
      setTotal(paginationData.total);
      setTotalPages(paginationData.totalPages);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchWishlist();
  }, [isAuthenticated, router, currentPage]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => router.push('/')}
              className="p-1.5 bg-white hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors shadow-sm hover:shadow-md border border-gray-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Sản Phẩm Yêu Thích</h1>
          </div>
          <hr className="border-gray-300 mb-6" />

          {!products || products.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Chưa có sản phẩm yêu thích
              </h3>
              <p className="text-gray-600 mb-6">
                Hãy thêm sản phẩm vào danh sách yêu thích để dễ dàng theo dõi
              </p>
              <button
                onClick={() => router.push('/products')}
                className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                Khám phá sản phẩm
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product} 
                    isInWishlist={true}
                    onWishlistChange={fetchWishlist}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mb-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                        currentPage === page
                          ? 'bg-green-600 text-white'
                          : 'border border-gray-300 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
