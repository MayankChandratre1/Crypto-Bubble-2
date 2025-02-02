// BuySignalsPanel.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { 
  Crown,
  ChevronUp,
  ChevronRight,
  CheckCircle,
  XCircle,
  ChevronLast,
  ChevronFirst,
  Lock, 
  User
} from 'lucide-react';
import { FaTelegram } from 'react-icons/fa';

interface SignalData {
  symbol: string;
  price: number;
  risk: number;
  timeAgo: string;
  good: string[];
  bad: string[];
  marketCap: string;
  danger: number;
}

const DEFAULT_WIDTH = 400;

export const BuySignalsPanel: React.FC = () => {
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { address } = useAccount();

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const response = await fetch('http://3.75.231.25/dex_signals');
        const data = await response.json();
        setSignals(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching signals:', error);
        setLoading(false);
      }
    };

    fetchSignals();
    const interval = setInterval(fetchSignals, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleUpgradeToPremium = () => {
    window.open('https://pay.boomfi.xyz/2rwqC9PH4zXMNqTupAXjsNyNJ3v', '_blank');
  };

  return (
    <div className="h-full bg-black border-l border-gray-800/80 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-[#19202F]">
        <div className="flex items-center gap-2">
          {isPremium ? (
            <>
              <Crown className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Premium</span>
            </>
          ) : (
            <>
              <User className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Free</span>
            </>
          )}
        </div>

        {address ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1B61B3] rounded-full">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className="text-xs text-[#DDDDDD]">
              {`${address.slice(0, 6)}...${address.slice(-4)}`}
            </span>
          </div>
        ) : (
          <button onClick={() => navigate('/payment')} className="text-sm text-white">
            Connect Wallet
          </button>
        )}
      </div>

      <h2 className="text-2xl font-bold text-white p-4">Latest Buy Signals</h2>

      <div className="flex-1 overflow-y-auto px-4">
        {loading ? (
          <div className="text-white text-center mt-8">Loading signals...</div>
        ) : signals.length > 0 ? (
          <div className="space-y-4">
            {signals.map((signal, index) => (
              <div
                key={index}
                className="relative p-4 bg-[#103118]/50 border border-[#05621C] rounded-xl"
              >
                {!isPremium && (
                  <div className="absolute inset-0 bg-[#103118]/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                )}

                <div className="flex justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl font-semibold text-white">${signal.symbol}</span>
                      <span className="text-orange-500 text-sm">{signal.timeAgo} ago</span>
                    </div>
                    <span className="text-xl font-bold text-white">${signal.price}</span>
                  </div>
                  <button onClick={() => setExpandedSignal(expandedSignal === signal.symbol ? null : signal.symbol)}>
                    {expandedSignal === signal.symbol ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>

                {expandedSignal === signal.symbol && (
                  <>
                    <div className="mt-4">
                      <div className="flex items-center gap-2 text-emerald-500 mb-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">The Good:</span>
                      </div>
                      {signal.good.map((item, i) => (
                        <div key={i} className="text-gray-400 text-sm ml-6 mb-1">{item}</div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center gap-2 text-rose-500 mb-2">
                        <XCircle className="w-4 h-4" />
                        <span className="font-medium">The Bad:</span>
                      </div>
                      {signal.bad.map((item, i) => (
                        <div key={i} className="text-gray-400 text-sm ml-6 mb-1">{item}</div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-white text-center mt-8">No signals available</div>
        )}
      </div>

      {!isPremium ? (
        <div className="p-4 border-t border-gray-800/50">
          <button
            onClick={handleUpgradeToPremium}
            className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <span>Upgrade to Premium</span>
            <Crown className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-4 border-t border-gray-800/50">
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2">
            <span>Premium Support</span>
            <FaTelegram className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};