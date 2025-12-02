'use client';

import { useEffect } from 'react';
import { Header, Footer } from '@/components/layout';
import { HeroSection, AboutSection, ProductsSection } from '@/components/sections';
import { Toast } from '@/components/ui';
import { useToast } from '@/lib/hooks';
import { SUCCESS_MESSAGES } from '@/lib/constants';

export default function Home() {
  const { toast, showToast } = useToast();

  useEffect(() => {
    const showLoginSuccess = localStorage.getItem('showLoginSuccess');
    if (showLoginSuccess === 'true') {
      setTimeout(() => {
        showToast(SUCCESS_MESSAGES.LOGIN_SUCCESS, 'success');
      }, 0);
      localStorage.removeItem('showLoginSuccess');
    }
  }, [showToast]);

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => {}}
        />
      )}
      <div className="min-h-screen bg-white">
        <Header />
        <HeroSection />
        <AboutSection />
        <ProductsSection showViewAll={true} />
        <Footer />
      </div>
    </>
  );
}
