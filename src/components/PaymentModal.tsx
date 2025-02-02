import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnect, useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { paymentService } from '../services/payment';
import { Lock } from 'lucide-react';
import metamask from '../../public/metamask-icon.svg';
import coinbase from '../../public/coinbase-icon.svg';
import walletconnect from '../../public/walletconnect-icon.svg';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: 'premium' | 'test';
  amount: number;
  description: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  planType,
  amount,
  description
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const { address } = useAccount();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName && email) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !fullName || !email) return;
    
    try {
      const response = await paymentService.createPaymentSession({
        fullName,
        email,
        plan: planType,
        amount
      });

      const popup = window.open(response.url, '3oomFi Payment', 'width=500,height=800');

      const checkPayment = setInterval(async () => {
        try {
          const transaction = await paymentService.verifyPayment(response.sessionId);
          if (transaction) {
            clearInterval(checkPayment);
            if (popup) popup.close();
            
            await paymentService.createSubscription(response.sessionId);
            navigate('/');
          }
        } catch (error) {
          // Ignore verification errors while waiting
        }
      }, 2000);

    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex min-h-screen">
      <div className="w-1/2 p-8 flex flex-col">
        <div className="flex items-center gap-4 mb-8">
          <img
            src="/coinchart-logo.png"
            alt="CoinChart"
            className="w-12 h-12 rounded-full"
          />
          <span className="text-xl font-medium">CoinChart Premium</span>
        </div>

        <div className="mb-8">
          <div className="text-4xl font-bold mb-2">
            ${amount}
            <span className="text-gray-500 text-base font-normal ml-1">per month</span>
          </div>
          <p className="text-gray-600">{description}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">1</span>
              <span className="text-gray-900">Transaction summary</span>
            </div>

            <div className="border-t border-gray-200 py-4">
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">1x {planType === 'premium' ? 'CoinChart Premium' : 'Test'}</span>
                <span className="text-gray-900">${amount}/month</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${amount}/month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-center text-gray-500 text-sm gap-2">
          <span>powered by</span>
          <img src="/3oomfi-logo.svg" alt="3oomFi" className="h-5" />
          <div className="flex gap-4 ml-auto">
            <button className="hover:text-gray-900">Status</button>
            <button className="hover:text-gray-900">Terms</button>
            <button className="hover:text-gray-900">Privacy</button>
          </div>
        </div>
      </div>

      <div className="w-1/2 bg-gray-50 p-8">
        {step === 1 ? (
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-medium mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">1</span>
              Personal Information
            </h3>

            <form onSubmit={handleContinue} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                {!fullName && (
                  <p className="text-red-500 text-sm mt-1">Full name is required</p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <p className="text-gray-500 text-sm mt-1">
                  Get transaction updates and receipt notifications via email
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </form>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-medium mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">2</span>
              Payment Method
            </h3>

            <div className="space-y-4">
              {!address ? (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={openConnectModal}
                      className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <span className="text-gray-700">Connect Wallet</span>
                      <div className="flex gap-2">
                        <img src={metamask} alt="MetaMask" className="w-6 h-6" />
                        <img src={coinbase} alt="Coinbase" className="w-6 h-6" />
                        <img src={walletconnect} alt="WalletConnect" className="w-6 h-6" />
                      </div>
                    </button>
                  )}
                </ConnectButton.Custom>
              ) : (
                <div className="w-full p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-700 font-medium">Connected Wallet</span>
                      <p className="text-sm text-gray-500">{`${address.slice(0, 6)}...${address.slice(-4)}`}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!address}
                className={`w-full py-3 rounded-lg font-medium ${
                  address 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue
              </button>

              <div className="flex items-center gap-2 text-gray-500 text-sm justify-center">
                <Lock className="w-4 h-4" />
                Secure and encrypted payment
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;