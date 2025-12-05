'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Header, Footer } from '@/components/layout';

function MomoReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  
  const resultCode = searchParams.get('resultCode');
  const message = searchParams.get('message');
  const orderId = searchParams.get('orderId');
  const isSuccess = resultCode === '0';

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      router.push('/orders');
    }
  }, [countdown, router]);

  return (
    <>
      <Header />
      <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {isSuccess ? (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Thanh toán thành công!
              </h1>
              <p className="text-gray-600 mb-6">
                {message || 'Đơn hàng của bạn đã được thanh toán qua MoMo.'}
              </p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Thanh toán thất bại
              </h1>
              <p className="text-gray-600 mb-6">
                {message || 'Có lỗi xảy ra trong quá trình thanh toán.'}
              </p>
            </>
          )}

          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
              <p className="font-mono font-semibold text-gray-900">#{orderId}</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-gray-500 mb-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            <p className="text-sm">
              Tự động chuyển về danh sách đơn hàng sau {countdown}s...
            </p>
          </div>

          <button
            onClick={() => router.push('/orders')}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
          >
            Xem đơn hàng ngay
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function MomoReturnPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
          <div className="text-center">Đang tải...</div>
        </div>
        <Footer />
      </>
    }>
      <MomoReturnContent />
    </Suspense>
  );
}
