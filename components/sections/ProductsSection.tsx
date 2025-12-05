"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '../ui';
import { apiService, type Product, type Category } from '@/lib/api';

interface ProductsSectionProps {
  showViewAll?: boolean;
}

export default function ProductsSection({ showViewAll = false }: ProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await apiService.fetchCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productsData = await apiService.fetchProducts({ 
          page: currentPage,
          limit: 15,
          category: selectedCategory || undefined,
          includeDeleted: false
        });

        setProducts(productsData.data);
        setTotal(productsData.pagination?.total || productsData.total || 0);
        setTotalPages(productsData.pagination?.totalPages || Math.ceil((productsData.pagination?.total || productsData.total || 0) / 15));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, selectedCategory]);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const paginationButtons = useMemo(() => {
    if (totalPages <= 1) return null;
    
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Sản Phẩm Của Chúng Tôi
          </h2>
          <p className="text-base text-gray-600 max-w-3xl mx-auto">
            Khám phá bộ sưu tập rau củ quả tươi ngon, được chọn lọc kỹ càng từ các trang trại hữu cơ
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition ${
              selectedCategory === ''
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Tất Cả
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryChange(category._id)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === category._id
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
              {products.map((product, index) => (
                <ProductCard key={`${product._id}-${index}`} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {!showViewAll && totalPages > 1 && paginationButtons && (
              <div className="flex items-center justify-center gap-2 mb-6">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {paginationButtons.map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition ${
                      currentPage === page
                        ? 'bg-green-600 text-white'
                        : 'border border-gray-300 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {showViewAll && (
              <div className="text-center">
                <a 
                  href="/products" 
                  className="inline-block px-8 py-3 bg-white border-2 border-green-600 text-green-600 rounded-full font-medium hover:bg-green-50 transition text-base"
                >
                  Xem Tất Cả Sản Phẩm
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Không có sản phẩm nào trong danh mục này.</p>
          </div>
        )}
      </div>
    </section>
  );
}
