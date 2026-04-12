import React, { useState } from 'react';
import { CreditCard, X, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentSuccess: (paymentMethod: string) => void;
  title?: string;
}

export default function PaymentModal({ isOpen, onClose, amount, onPaymentSuccess, title = "Complete Payment" }: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setError('Please enter a valid 16-digit card number');
      return;
    }
    if (expiry.length < 5) {
      setError('Please enter a valid expiry date (MM/YY)');
      return;
    }
    if (cvc.length < 3) {
      setError('Please enter a valid CVC');
      return;
    }
    if (!name) {
      setError('Please enter the name on card');
      return;
    }

    setError('');
    setIsProcessing(true);

    // Simulate payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Notify parent after showing success animation
      setTimeout(() => {
        onPaymentSuccess('online');
        // Reset state for future use
        setIsSuccess(false);
        setCardNumber('');
        setExpiry('');
        setCvc('');
        setName('');
      }, 2000);
      
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-gray-50 border-b p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <CreditCard className="w-6 h-6 mr-2 text-indigo-600" />
            {title}
          </h2>
          {!isProcessing && !isSuccess && (
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full p-1 shadow-sm border"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600">Your transaction of Rs.{amount} was completed.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 text-center">
                <p className="text-sm text-indigo-600 font-medium mb-1">Total Amount to Pay</p>
                <p className="text-3xl font-bold text-indigo-900">Rs.{amount}</p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    disabled={isProcessing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      disabled={isProcessing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono disabled:bg-gray-50"
                    />
                    <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      maxLength={5}
                      disabled={isProcessing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono disabled:bg-gray-50 text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                    <input
                      type="text"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="123"
                      maxLength={4}
                      disabled={isProcessing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono disabled:bg-gray-50 text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-indigo-600 text-white py-4 px-4 rounded-xl font-bold text-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/50 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay Rs.${amount}`
                  )}
                </button>
              </div>
              
              <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 mr-1 text-green-500" />
                Payments are secure and encrypted. (Demo Gateway)
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
