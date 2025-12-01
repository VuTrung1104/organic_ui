'use client';

import { useEffect, useState } from "react";
import { Header, Footer } from "@/components/layout";
import { HeroSection, AboutSection, ProductsSection } from "@/components/sections";
import { Toast } from "@/components/ui";
import { SUCCESS_MESSAGES } from "@/lib/constants";

export default function Home() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const showLoginSuccess = localStorage.getItem('showLoginSuccess');
    if (showLoginSuccess === 'true') {
      setTimeout(() => {
        setToast({ message: SUCCESS_MESSAGES.LOGIN_SUCCESS, type: 'success' });
      }, 0);
      localStorage.removeItem('showLoginSuccess');
    }
  }, []);

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
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
