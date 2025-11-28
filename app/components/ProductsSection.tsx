"use client";

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { apiService, type Product, type Category } from '../lib/api';

export default function ProductsSection() {
  const [activeCategory, setActiveCategory] = useState<string | number>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories first
        const categoriesData = await apiService.fetchCategories();
        setCategories(categoriesData);
        
        // Then fetch products with correct category ID
        const categoryId = activeCategory !== 'all' && typeof activeCategory === 'number' 
          ? categoriesData[activeCategory]?._id 
          : undefined;
          
        const productsData = await apiService.fetchProducts({ 
          limit: 8,
          category: categoryId
        });

        setProducts(productsData.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeCategory]);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Sản Phẩm Của Chúng Tôi
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            Khám phá bộ sưu tập rau củ quả tươi ngon, được chọn lọc kỹ càng từ các trang trại hữu cơ
          </p>
          
          {/* Category Filter */}
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => {
                setActiveCategory('all');
              }}
              className={`px-8 py-3 rounded-full font-medium transition ${
                activeCategory === 'all'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất Cả
            </button>
            {categories.map((category, index) => {
              return (
                <button
                  key={index}
                  onClick={() => {
                    setActiveCategory(index);
                  }}
                  className={`px-8 py-3 rounded-full font-medium transition ${
                    activeCategory === index
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {products.map((product, index) => (
                <ProductCard key={`${product._id}-${index}`} product={product} />
              ))}
            </div>

            <div className="text-center">
              <a 
                href="/products" 
                className="inline-block px-10 py-4 bg-white border-2 border-green-600 text-green-600 rounded-full font-medium hover:bg-green-50 transition text-lg"
              >
                Xem Tất Cả Sản Phẩm
              </a>
            </div>
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
