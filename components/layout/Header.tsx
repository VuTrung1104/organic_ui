'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Leaf, LogOut, User, ChevronDown, Package, Heart, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { isAuthenticated, isAdmin, logout, user, loading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-green-600" style={{fontFamily: 'cursive'}}>
              EcoFresh
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-700 hover:text-green-600 transition font-medium">
              Trang Chủ
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-green-600 transition font-medium">
              Sản Phẩm
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-green-600 transition font-medium">
              Về Chúng Tôi
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-green-600 transition font-medium">
              Liên Hệ
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href="/cart" className="p-2 text-gray-700 hover:text-green-600 transition relative">
              <ShoppingCart className="w-6 h-6" />
            </Link>
            {!mounted ? (
              <Link 
                href="/login"
                className="px-6 py-2.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition"
              >
                Đăng Nhập
              </Link>
            ) : isAuthenticated ? (
              <>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition"
                >
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullname || 'Avatar'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      href="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Thông Tin Cá Nhân
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setShowDropdown(false)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                    >
                      <Package className="w-4 h-4" />
                      Đơn Hàng Của Tôi
                    </Link>
                    <Link
                      href="/wishlist"
                      onClick={() => setShowDropdown(false)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                    >
                      <Heart className="w-4 h-4" />
                      Sản Phẩm Yêu Thích
                    </Link>
                    {isAdmin && (
                      <>
                        <div className="border-t border-gray-200 my-1"></div>
                        <Link
                          href="/admin"
                          onClick={() => setShowDropdown(false)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          Quản Trị Hệ Thống
                        </Link>
                      </>
                    )}
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng Xuất
                    </button>
                  </div>
                )}
              </div>
              </>
            ) : (
              <Link 
                href="/login"
                className="px-6 py-2.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition"
              >
                Đăng Nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
