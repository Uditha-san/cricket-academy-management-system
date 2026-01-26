import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader, Mail } from 'lucide-react';
import api from '../api/axios';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const emailFromUrl = searchParams.get('email');
    const navigate = useNavigate();

    const [otp, setOtp] = useState('');
    const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!emailFromUrl) {
            setStatus('error');
            setMessage('Invalid access. Email is missing.');
        }
    }, [emailFromUrl]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) return;

        setStatus('verifying');
        setMessage('Verifying your code...');

        try {
            await api.post('/auth/verify-email', { email: emailFromUrl, otp });
            setStatus('success');
            setMessage('Email verified successfully! You can now login.');
        } catch (error: any) {
            console.error('Verification failed', error);
            setStatus('error');
            setMessage(error.response?.data?.message || 'Verification failed. Please check the code and try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    {status === 'verifying' && <Loader className="w-16 h-16 text-green-600 animate-spin" />}
                    {status === 'success' && <CheckCircle className="w-16 h-16 text-green-600" />}
                    {(status === 'error' || status === 'idle') && <Mail className="w-16 h-16 text-green-600" />}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {status === 'success' ? 'Verified!' : 'Verify Your Email'}
                </h2>

                <p className="text-gray-600 mb-6">
                    {status === 'success'
                        ? message
                        : `We've sent a 6-digit code to ${emailFromUrl}. Please enter it below.`}
                </p>

                {status !== 'success' && (
                    <form onSubmit={handleVerify} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Only numbers
                                className="w-full text-center text-3xl tracking-widest py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="000000"
                                disabled={status === 'verifying'}
                            />
                        </div>

                        {status === 'error' && (
                            <p className="text-red-600 text-sm">{message}</p>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'verifying' || otp.length !== 6}
                            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === 'verifying' ? 'Verifying...' : 'Verify Email'}
                        </button>
                    </form>
                )}

                {status === 'success' && (
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                        Go to Login
                    </button>
                )}
            </div>
        </div>
    );
}
