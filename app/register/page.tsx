'use client';

import { useState } from 'react';
import { Leaf, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiService } from '../lib/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    code: '',
  });
  const [otpSent, setOtpSent] = useState(false);
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

  const handleSendOTP = async () => {
    if (!formData.email) {
      setError('Vui lòng nhập email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiService.sendOTP(formData.email, 'REGISTER');
      setOtpSent(true);
      alert('Mã OTP đã được gửi đến email của bạn!');
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Không thể gửi OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp!');
      return;
    }

    if (!acceptTerms) {
      setError('Vui lòng đồng ý với điều khoản dịch vụ!');
      return;
    }

    if (!formData.code) {
      setError('Vui lòng nhập mã OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiService.register(formData);
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      router.push('/login');
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-green-600" style={{fontFamily: 'cursive'}}>
              Rau Củ Tươi
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Tạo tài khoản mới</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                required
              />
            </div>

            {/* Email with OTP Button */}
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email {!otpSent && <span className="text-sm text-gray-500">(Bước 1: Gửi mã OTP)</span>}
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                  disabled={otpSent}
                />
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading || otpSent}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {otpSent ? '✓ Đã gửi' : 'Gửi OTP'}
                </button>
              </div>
            </div>

            {/* OTP Code Field - Only show after OTP sent */}
            {otpSent && (
              <div>
                <label htmlFor="code" className="block text-gray-700 font-medium mb-2">
                  Mã OTP (6 chữ số)
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="123456"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                />
              </div>
            )}

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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
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
                  placeholder="········"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition pr-12"
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
                  placeholder="········"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition pr-12"
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
  );
}
