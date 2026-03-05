import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from '../api/axios';



export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'input' | 'verification' | 'newPassword' | 'success'>('input');
  // Removed method/phone logic as backend only supports email for now
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      setStep('verification');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    // We don't verify OTP separately in backend for now, we just proceed to password input
    // In a stricter flow, you'd have a verify-otp endpoint, but here we can just pass OTP to reset
    setStep('newPassword');
  };

  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/reset-password', {
        email,
        otp: verificationCode,
        newPassword
      });
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('input');
    setEmail('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="relative mx-auto w-20 h-20 mb-4">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-green-500/50 to-emerald-300/50 blur-lg" aria-hidden="true"></div>
            <img
              src="/assets/logo.jpg"
              alt="App logo"
              className="relative w-20 h-20 rounded-full object-cover ring-2 ring-green-600 shadow-lg bg-white p-0.5"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">We'll help you get back into your account</p>
        </div>

        {/* Forgot Password Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {step === 'input' && (
            <>
              <div className="mb-6">
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </button>
                <h2 className="text-2xl font-semibold text-gray-900">Forgot Password?</h2>
                <p className="text-gray-600 mt-2">Enter your email or phone number to receive a verification code</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>
            </>
          )}

          {step === 'verification' && (
            <>
              <div className="mb-6">
                <button
                  onClick={() => setStep('input')}
                  className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
                <h2 className="text-2xl font-semibold text-gray-900">Verify Your Identity</h2>
                <p className="text-gray-600 mt-2">
                  We've sent a 6-digit code to {email}
                </p>
              </div>

              <div className="space-y-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center text-sm">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>

                <button
                  onClick={handleVerification}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 'newPassword' && (
            <>
              <div className="mb-6">
                <button
                  onClick={() => setStep('verification')}
                  className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
                <h2 className="text-2xl font-semibold text-gray-900">Create New Password</h2>
                <p className="text-gray-600 mt-2">Please enter your new password</p>
              </div>

              <div className="space-y-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center text-sm">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleNewPassword}
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </>
          )}

          {step === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Password Updated Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Your password has been updated successfully. You can now log in with your new password.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  Back to Login
                </button>
                <button
                  onClick={resetForm}
                  className="w-full bg-white text-green-600 border border-green-600 py-3 px-4 rounded-lg font-medium hover:bg-green-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  Reset Another Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

