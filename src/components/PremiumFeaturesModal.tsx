import React from 'react';
import { X, Check } from 'lucide-react';

interface PremiumFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const PremiumFeaturesModal: React.FC<PremiumFeaturesModalProps> = ({
  isOpen,
  onClose,
  onUpgrade
}) => {
  if (!isOpen) return null;

  const features = [
    "Access to all buy signals without limits",
    "Real-time risk analysis updates",
    "Advanced filtering options",
    "Priority access to new features",
    "Premium Telegram group access",
    "TradingView script integration",
    "24/7 Priority support",
    "Custom alerts and notifications"
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl w-full max-w-2xl mx-4 shadow-2xl border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">Premium Features</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center 
              text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Price Info */}
          <div className="text-center mb-8">
            <div className="inline-block">
              <span className="text-4xl font-bold text-white">$49</span>
              <span className="text-gray-400 ml-2">/month</span>
            </div>
            <p className="text-gray-400 mt-2">
              Unlock all premium features and take your trading to the next level
            </p>
          </div>

          {/* Features List */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 bg-gray-800/50 p-4 rounded-lg"
              >
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check size={14} className="text-green-500" />
                </div>
                <span className="text-gray-200">{feature}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <button
              onClick={onUpgrade}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                font-medium transition-colors flex items-center justify-center gap-2"
            >
              Upgrade to Premium
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 
                rounded-lg font-medium transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Test Plan Info */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Want to try first?{' '}
              <button
                onClick={onUpgrade}
                className="text-blue-400 hover:text-blue-500 font-medium"
              >
                Start with $1 Test Plan
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeaturesModal;