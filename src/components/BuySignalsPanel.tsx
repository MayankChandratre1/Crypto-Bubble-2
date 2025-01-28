import React, { useState, useEffect } from 'react';
import { 
  Crown,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  ExternalLink,
  ChevronUp,
  LucideAlertTriangle,
  Lock, 
  User,
  Plus
} from 'lucide-react';
import { FaTelegram } from 'react-icons/fa';

interface ApiSignal {
  description: string;
}

interface SignalData {
  symbol: string;
  price: number; 
  risk: number;
  marketCap: string;
  timeAgo: string;
  good: string[];
  bad: string[];
  details?: {
    good: string;
    bad: string;
  };
}

const WALLET_OPTIONS = [
  'apds46saerqweu...Gah',
  'b7x5n2qw3rt9...Xyz',
  'k9m1p6hs8jl3...Pqr'
];

const parseApiData = (apiSignal: ApiSignal): SignalData | null => {
  try {
    const desc = apiSignal.description;
    const symbolMatch = desc.match(/\$([A-Z]+)USDT/);
    const priceMatch = desc.match(/\$\s*(\d+\.?\d*)/);
    
    if (!symbolMatch || !priceMatch) return null;

    const symbol = symbolMatch[1];
    const price = parseFloat(priceMatch[1]);
    
    // Extract performance metrics if they exist
    const performanceMatch = desc.match(/\(3M, 1M, 2W\): ([^)]+)/);
    const good: string[] = [];
    const bad: string[] = [];

    if (desc.includes('⚠️')) {
      bad.push(desc.split('⚠️')[1].split('\n')[0].trim());
    }

    if (performanceMatch) {
      const metrics = performanceMatch[1].split('|').map(m => m.trim());
      metrics.forEach(metric => {
        if (metric.includes('✅')) {
          good.push(metric);
        } else {
          bad.push(metric);
        }
      });
    }

    return {
      symbol,
      price,
      risk: Math.floor(Math.random() * 60) + 20, 
      marketCap: `${Math.floor(Math.random() * 4) + 1}/4`, 
      timeAgo: '1m', 
      good,
      bad
    };
  } catch (error) {
    console.error('Error parsing signal:', error);
    return null;
  }
};

const WalletDropdown: React.FC<{
  selectedWallet: string;
  onSelect: (wallet: string) => void;
  onDisconnect: () => void;
}> = ({ selectedWallet, onSelect, onDisconnect }) => {
  return (
    <div className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-lg shadow-xl z-50 border border-gray-800">
      {WALLET_OPTIONS.map((wallet) => (
        <button 
          key={wallet}
          onClick={() => onSelect(wallet)}
          className={`w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors ${
            wallet === selectedWallet ? 'bg-gray-800 text-white' : 'text-gray-400'
          }`}
        >
          {wallet}
        </button>
      ))}
      <div className="border-t border-gray-800">
        <button 
          onClick={onDisconnect}
          className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-800 transition-colors"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
};

const SignalItem: React.FC<{ signal: SignalData; isLocked?: boolean }> = ({ signal, isLocked = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      onClick={() => !isLocked && setIsExpanded(!isExpanded)}
      className="p-4 mx-4 border border-[#05621C] bg-[#103118]/50 mt-6 rounded-xl hover:bg-gray-900/30 transition-colors cursor-pointer shadow-lg hover:shadow-xl relative"
    >
      
      {isLocked && (
        <div className="absolute inset-0 bg-[#103118]/50 backdrop-blur-sm rounded-xl flex items-center justify-center pointer-events-none">
          <Lock className="w-8 h-8 text-white" />
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex justify-between items-center gap-20 mb-1">
            <span className="text-white text-xl font-semibold">${signal.symbol}</span>
            <span className="text-orange-500 items-end text-end text-sm">{signal.timeAgo} ago</span>
          </div>
          <span className="text-xl font-bold text-white">${signal.price}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-600" />
        )}
      </div>

      <div className="flex items-center mb-2 gap-4 text-xs">
        <span className="flex justify-normal gap-2 text-gray-400">Danger:<span className='text-white'>{signal.marketCap}</span><LucideAlertTriangle size={15} className='text-yellow-500'/></span>
        <span className="text-gray-400">Risk: <span className='text-white'>{signal.risk}/100</span> </span>
        <ExternalLink className="w-4 h-4 text-blue-400 ml-auto hover:text-blue-500 transition-colors" />
      </div>

      {isExpanded && (
        <>
          <div className="mb-2">
            <div className="flex items-center gap-2 text-emerald-500 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">The Good:</span>
            </div>
            {signal.good.map((item, index) => (
              <div key={index} className="text-gray-400 text-sm pl-6">
                {item}
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-2 text-rose-500 mb-1">
              <XCircle className="w-4 h-4" />
              <span className="font-medium">The Bad:</span>
            </div>
            {signal.bad.map((item, index) => (
              <div key={index} className="text-gray-400 text-sm pl-6">
                {item}
              </div>
            ))}

            {signal.details && (
              <div className="mt-3 p-3 bg-gray-900 rounded-lg">
                <div className="text-emerald-500 font-semibold mb-2">
                  {signal.details.good}
                </div>
                <div className="text-rose-500 font-semibold">
                  {signal.details.bad}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export const BuySignalsPanel: React.FC = () => {
  const [selectedWallet, setSelectedWallet] = useState(WALLET_OPTIONS[0]);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [loading, setLoading] = useState(true);

  const handleWalletSelect = (wallet: string) => {
    setSelectedWallet(wallet);
    setShowWalletDropdown(false);
  };

  const handleDisconnect = () => {
    setSelectedWallet('');
    setShowWalletDropdown(false);
  };

  const handleUpgradeToPremium = () => {
    setIsPremium(true); 
  };
  const handleUpgradeToPremium1 = () => {
    setIsPremium(false); 
  };

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const response = await fetch('http://3.75.231.25/dex_signals');
        const data: ApiSignal[] = await response.json();
        const parsedSignals = data
          .map(signal => parseApiData(signal))
          .filter((signal): signal is SignalData => signal !== null);
        setSignals(parsedSignals);
      } catch (error) {
        console.error('Error fetching signals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();
    const interval = setInterval(fetchSignals, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full lg:w-80 bg-black border-l border-gray-800/80 flex flex-col h-screen">
      
      <div className='flex items-center'>
        <div className="flex items-center justify-between gap-4 mb-6 border-l border-gray-800/80 pt-6 bg-[#19202F] px-6 py-[18px]">
          {isPremium ? (
            <div className="flex items-center gap-1">
              <Crown className="w-4 h-4 text-white text-sm" />
              <span className="text-white text-xs">Premium</span>
            </div>
          ) : (
            <div className="flex justify-normal gap-2 text-white text-xs">
              <User  className="w-4 h-4 text-white text-sm" />Free</div>
          )}
          {isPremium ? (
          <div className="relative">
          <button
            onClick={() => setShowWalletDropdown(!showWalletDropdown)}
            className="flex items-center gap-2 px-2 py-2 bg-[#1B61B3] rounded-full text-xs text-[#DDDDDD] hover:bg-gray-800"
          >
            <div className="w-4 h-4 rounded-full bg-purple-500" />
            {selectedWallet}
            <ChevronDown size={16} />
          </button>
          {showWalletDropdown && (
            <WalletDropdown 
              selectedWallet={selectedWallet}
              onSelect={handleWalletSelect}
              onDisconnect={handleDisconnect}
            />
          )}
        </div>) : (
          <div className="relative">
            <button
            onClick={() => setShowWalletDropdown(!showWalletDropdown)}
            className="flex items-center gap-2 px-[14px] ml-16 py-2 bg-[#1B61B3] rounded-full text-xs text-[#DDDDDD] hover:bg-gray-800"
          >
            Connect Wallet
            <Plus size={18} />
          </button>
          </div>
          )}

        </div>
      </div>
      <h1 className="text-2xl text-center font-bold text-white">Latest Buy Signals</h1>

     
      <div className="flex-1 overflow-y-auto px-4">
        {loading ? (
          <div className="text-white text-center mt-8">Loading signals...</div>
        ) : signals.length > 0 ? (
          signals.map((signal) => (
            <SignalItem key={signal.symbol} signal={signal} isLocked={!isPremium} />
          ))
        ) : (
          <div className="text-white text-center mt-8">No signals available</div>
        )}
      </div>

      {!isPremium && (
        <div className="p-6 border-t border-gray-800/50">
          <button 
            onClick={handleUpgradeToPremium}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105"
          >
            <span className="font-medium">Upgrade to Premium</span>
            <Crown className="w-4 h-4" />
          </button>
        </div>
      )}

 
      {isPremium && (
        <div className="p-6 border-t border-gray-800/50">
          <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105"
          onClick={handleUpgradeToPremium1}
          >
            <span className="font-medium">Premium Support</span>
            <FaTelegram className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};