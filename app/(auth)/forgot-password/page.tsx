'use client';

import { useState } from 'react';
import { Leaf, ArrowLeft, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import { Toast } from '@/components/ui';
import { useToast } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { OTP_TYPES, ERROR_MESSAGES, SUCCESS_MESSAGES, DELAYS } from '@/lib/constants';

type Step = 'email' | 'reset';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast, showToast } = useToast();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiService.sendOTP(email, OTP_TYPES.FORGOT_PASSWORD);
      showToast(SUCCESS_MESSAGES.OTP_SENT, 'success');
      setStep('reset');
    } catch (error: any) {
      showToast(error.message || ERROR_MESSAGES.SEND_OTP_FAILED, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast(ERROR_MESSAGES.PASSWORD_MISMATCH, 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast(ERROR_MESSAGES.PASSWORD_TOO_SHORT, 'error');
      return;
    }

    setLoading(true);

    try {
      await apiService.resetPassword({
        email,
        code: otp,
        newPassword,
        confirmNewPassword: confirmPassword,
      });
      showToast(SUCCESS_MESSAGES.RESET_PASSWORD_SUCCESS, 'success');
      setTimeout(() => {
        router.push('/login');
      }, DELAYS.REDIRECT_AFTER_REGISTER);
    } catch (error: any) {
      showToast(error.message || ERROR_MESSAGES.RESET_PASSWORD_FAILED, 'error');
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
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                <Leaf className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-green-600" style={{fontFamily: 'cursive'}}>
                TrungOrganic
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              {step === 'email' ? 'Khôi phục mật khẩu' : 'Đặt mật khẩu mới'}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            {/* Email */}
            {step === 'email' && (
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-gray-600">
                    Nhập email của bạn để nhận mã xác thực
                  </p>
                </div>

                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-600"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-green-700 transition disabled:bg-green-500 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                </button>
              </form>
            )}

            {/* Reset Password with OTP */}
            {step === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-gray-600">
                    Nhập mã OTP và mật khẩu mới <br />
                    <span className="font-semibold text-green-600">{email}</span>
                  </p>
                </div>

                <div>
                  <label htmlFor="otp" className="block text-gray-700 font-medium mb-2">
                    Mã OTP (6 số)
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-600 text-center text-2xl tracking-widest font-semibold"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-600"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-600"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-green-700 transition disabled:bg-green-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setOtp('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-gray-600 hover:text-gray-800 font-medium transition"
                  >
                    ← Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendOTP({ preventDefault: () => {} } as React.FormEvent)}
                    disabled={loading}
                    className="text-green-600 hover:text-green-800 font-medium transition disabled:text-gray-400"
                  >
                    Gửi lại OTP
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Back to Login */}
          <div className="text-center mt-6">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Quay lại đăng nhập</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
