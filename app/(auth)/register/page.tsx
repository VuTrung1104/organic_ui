'use client';

import { useState } from 'react';
import { Leaf, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { Toast } from '@/components/ui';
import { useToast } from '@/lib/hooks';
import { OTP_TYPES, ERROR_MESSAGES, SUCCESS_MESSAGES, DELAYS } from '@/lib/constants';

export default function RegisterPage() {
  const { toast, showToast } = useToast();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    code: '',
  });
  const [showVerifyForm, setShowVerifyForm] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError(ERROR_MESSAGES.PASSWORD_MISMATCH);
      return;
    }

    if (!acceptTerms) {
      setError(ERROR_MESSAGES.TERMS_NOT_ACCEPTED);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiService.sendOTP(formData.email, OTP_TYPES.REGISTER);
      setShowVerifyForm(true);
    } catch (err) {
      const error = err as Error;
      setError(error.message || ERROR_MESSAGES.SEND_OTP_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || formData.code.length !== 6) {
      setError(ERROR_MESSAGES.OTP_REQUIRED);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiService.register(formData);
      showToast(SUCCESS_MESSAGES.REGISTER_SUCCESS, 'success');
      setTimeout(() => {
        router.push('/login');
      }, DELAYS.REDIRECT_AFTER_REGISTER);
    } catch (err) {
      const error = err as Error;
      let errorMessage = error.message || ERROR_MESSAGES.VERIFY_FAILED;
      
      if (errorMessage.includes('InvalidOTP') || errorMessage.includes('invalid')) {
        errorMessage = ERROR_MESSAGES.OTP_INVALID;
      } else if (errorMessage.includes('expired')) {
        errorMessage = ERROR_MESSAGES.OTP_EXPIRED;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      await apiService.sendOTP(formData.email, OTP_TYPES.REGISTER);
      showToast(SUCCESS_MESSAGES.OTP_RESENT, 'success');
    } catch (err) {
      const error = err as Error;
      setError(error.message || ERROR_MESSAGES.RESEND_OTP_FAILED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => {}}
        />
      )}
      <div className="min-h-screen bg-linear-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-green-600" style={{fontFamily: 'cursive'}}>
              EcoFresh
            </h1>
          </div>
          {!showVerifyForm && (
            <p className="text-gray-600 text-base">
              Tạo tài khoản mới
            </p>
          )}
        </div>

        {/* Verify Form */}
        {showVerifyForm ? (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <form onSubmit={handleVerify} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs text-center">
                  {error}
                </div>
              )}

              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Xác Thực Email</h2>
                <p className="text-gray-600 text-sm mb-1">
                  Mã xác thực đã được gửi đến:
                </p>
                <p className="text-green-600 font-semibold text-base">{formData.email}</p>
              </div>

              <div>
                <label htmlFor="code" className="block text-gray-700 font-medium mb-2 text-center text-sm">
                  Nhập mã gồm 6 chữ số
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder=""
                  maxLength={6}
                  pattern="[0-9]{6}"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-center text-xl tracking-widest font-semibold text-gray-600"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-base hover:bg-green-700 transition disabled:bg-green-500 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xác thực...' : 'Xác Thực Ngay'}
              </button>

              <div className="text-center pt-1">
                <span className="text-gray-600 text-sm">Không nhận được mã? </span>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-green-600 hover:text-green-700 font-semibold text-sm transition disabled:text-gray-400"
                >
                  Gửi lại mã
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Register Form */
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <form onSubmit={handleRegister} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Full Name Field */}
              <div>
                <label htmlFor="fullname" className="block text-gray-700 font-medium mb-2">
                  Họ và Tên
                </label>
                <input
                  type="text"
                  id="fullname"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-600"
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-600"
                  required
                />
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phoneNumber" className="block text-gray-700 font-medium mb-2">
                  Số Điện Thoại
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="0123456789"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-600"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                  Mật Khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="•••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition pr-12 text-gray-600"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                  Xác Nhận Mật Khẩu
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="•••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition pr-12 text-gray-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                  />
                  <span className="text-gray-700 text-sm">
                    Tôi đồng ý với{' '}
                    <Link href="/terms" className="text-green-600 hover:text-green-700 font-medium">
                      Điều khoản dịch vụ
                    </Link>{' '}
                    và{' '}
                    <Link href="/privacy" className="text-green-600 hover:text-green-700 font-medium">
                      Chính sách bảo mật
                    </Link>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-green-700 transition disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xử lý...' : 'Đăng Ký'}
              </button>

              {/* Login Link */}
              <div className="text-center">
                <span className="text-gray-600">Đã có tài khoản? </span>
                <Link 
                  href="/login" 
                  className="text-green-600 hover:text-green-700 font-semibold transition"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            </form>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
