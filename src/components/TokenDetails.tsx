import React, { useEffect, useState } from 'react';
import { 
  X, 
  Star, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  ExternalLink 
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { TokenService, handleApiError } from '../services/api';
import { useUser } from '../context/UserContext';
import { formatNumber, formatPrice } from '../utils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TokenDetailsProps {
  symbol: string;
  source?: string;
  onClose: () => void;
  selectedTimeframe: 'Hour' | 'Day' | 'Week' | 'Month' | 'Year';
  onTimeframeChange: (timeframe: 'Hour' | 'Day' | 'Week' | 'Month' | 'Year') => void;
}

interface TokenData {
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume24h: number;
  percentChange24h: number;
  rank: number;
  riskLevel: number;
  launchDate: string;
  historicalData?: {
    timestamp: number;
    price: number;
  }[];
}

const timeframes = ['Hour', 'Day', 'Week', 'Month', 'Year'] as const;

const TokenDetails: React.FC<TokenDetailsProps> = ({
  symbol,
  source = 'CookieFun',
  onClose,
  selectedTimeframe,
  onTimeframeChange
}) => {
  const { user } = useUser();
  const [token, setToken] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchTokenDetails();
  }, [symbol, source]);

  const fetchTokenDetails = async () => {
    try {
      setLoading(true);
      const tokenData = await TokenService.getTokenDetails(symbol, source);
      setToken(tokenData);
      setIsFavorite(user?.favorites?.includes(symbol) || false);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) return;
    try {
      const { isFavorite: newState } = await TokenService.toggleFavorite(symbol, source);
      setIsFavorite(newState);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const formatTimeframePrices = (timeframe: typeof timeframes[number]) => {
    if (!token?.historicalData) return null;

    const now = new Date();
    let startTime: Date;
    switch (timeframe) {
      case 'Hour':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'Day':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'Week':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'Month':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'Year':
        startTime = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    return token.historicalData.filter(d => new Date(d.timestamp).getTime() >= startTime.getTime());
  };

  const chartData = {
    labels: formatTimeframePrices(selectedTimeframe)?.map(d => 
      new Date(d.timestamp).toLocaleDateString()
    ) || [],
    datasets: [
      {
        label: 'Price',
        data: formatTimeframePrices(selectedTimeframe)?.map(d => d.price) || [],
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(156, 163, 175, 1)',
        },
      },
      y: {
        grid: {
          color: 'rgba(55, 65, 81, 0.5)',
        },
        ticks: {
          color: 'rgba(156, 163, 175, 1)',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">{error || 'Token not found'}</p>
          <button 
            onClick={onClose}
            className="mt-2 px-4 py-2 bg-red-100 rounded hover:bg-red-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const tokenAge = () => {
    const launch = new Date(token.launchDate);
    const now = new Date();
    const diffMonths = (now.getFullYear() - launch.getFullYear()) * 12 + 
      now.getMonth() - launch.getMonth();
    
    if (diffMonths < 1) {
      const diffDays = Math.floor((now.getTime() - launch.getTime()) / (1000 * 60 * 60 * 24));
      return `${diffDays} days`;
    } else if (diffMonths < 12) {
      return `${diffMonths} months`;
    } else {
      const years = Math.floor(diffMonths / 12);
      const months = diffMonths % 12;
      return months > 0 ? `${years}y ${months}m` : `${years} years`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl w-full max-w-3xl mx-4 shadow-2xl border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleFavorite}
              className={`w-12 h-12 rounded-full flex items-center justify-center
                ${isFavorite 
                  ? 'bg-yellow-500/20 text-yellow-400' 
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}
            >
              <Star className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">{token.name}</h2>
                <span className="text-sm px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {token.symbol}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Age: {tokenAge()}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 
              hover:bg-gray-700 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Price and Stats Section */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Current Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">${formatPrice(token.price)}</span>
              <span className={`text-lg ${token.percentChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {token.percentChange24h >= 0 ? '+' : ''}{token.percentChange24h.toFixed(2)}%
              </span>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <TrendingUp size={16} />
                  <span className="text-sm">Rank</span>
                </div>
                <div className="text-white font-bold">#{token.rank}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <DollarSign size={16} />
                  <span className="text-sm">Market Cap</span>
                </div>
                <div className="text-white font-bold">${formatNumber(token.marketCap)}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <BarChart3 size={16} />
                  <span className="text-sm">24h Volume</span>
                </div>
                <div className="text-white font-bold">${formatNumber(token.volume24h)}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Calendar size={16} />
                  <span className="text-sm">Risk Level</span>
                </div>
                <div className="text-white font-bold">{token.riskLevel}/100</div>
              </div>
            </div>
          </div>

          {/* External Links */}
          <div className="flex gap-4 mb-8">
            <a 
              href={`https://www.coingecko.com/en/coins/${token.symbol.toLowerCase()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            >
              CoinGecko
              <ExternalLink size={16} />
            </a>
            <a 
              href={`https://www.tradingview.com/chart/?symbol=${token.symbol}USDT`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            >
              TradingView
              <ExternalLink size={16} />
            </a>
          </div>

          {/* Chart */}
          <div className="relative h-64 mb-6 bg-gray-800/30 rounded-lg p-4">
            <div className="absolute top-4 left-4 text-green-500 font-medium">
              ${Math.max(...(chartData.datasets[0].data)).toFixed(4)}
            </div>
            <div className="absolute bottom-4 left-4 text-red-500 font-medium">
              ${Math.min(...(chartData.datasets[0].data)).toFixed(4)}
            </div>
            <Line data={chartData} options={chartOptions} />
          </div>

          {/* Timeframe Selector */}
          <div className="flex justify-between items-center bg-gray-800/30 rounded-lg p-2">
            {timeframes.map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => onTimeframeChange(timeframe)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors flex flex-col items-center
                  ${selectedTimeframe === timeframe
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-400 hover:text-white'}`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDetails;