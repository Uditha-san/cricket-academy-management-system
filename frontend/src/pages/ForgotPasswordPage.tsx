import React, { useState } from 'react';
import { Mail, Phone, ArrowLeft, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
}

export default function ForgotPasswordPage({ onBackToLogin }: ForgotPasswordPageProps) {
  const [step, setStep] = useState<'input' | 'verification' | 'newPassword' | 'success'>('input');
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [contact, setContact] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setStep('verification');
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setStep('newPassword');
  };

  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate password reset
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setStep('success');
  };

  const resetForm = () => {
    setStep('input');
    setContact('');
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
                  onClick={onBackToLogin}
                  className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </button>
                <h2 className="text-2xl font-semibold text-gray-900">Forgot Password?</h2>
                <p className="text-gray-600 mt-2">Enter your email or phone number to receive a verification code</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Method Selection */}
                <div className="flex space-x-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setMethod('email')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      method === 'email'
                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                    }`}
                  >
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('phone')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      method === 'phone'
                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                    }`}
                  >
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {method === 'email' ? 'Email Address' : 'Phone Number'}
                  </label>
                  <div className="relative">
                    {method === 'email' ? (
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    ) : (
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    )}
                    <input
                      type={method === 'email' ? 'email' : 'tel'}
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={method === 'email' ? 'Enter your email' : '+94 77 123 4567'}
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
                  We've sent a 6-digit code to {method === 'email' ? contact : `+${contact}`}
                </p>
              </div>

              <form onSubmit={handleVerification} className="space-y-6">
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
                  type="submit"
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => handleSubmit(new Event('submit') as any)}
                    className="text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
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

              <form onSubmit={handleNewPassword} className="space-y-6">
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
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
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
                  onClick={onBackToLogin}
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

