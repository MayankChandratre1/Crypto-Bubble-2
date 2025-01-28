import React, { useMemo } from 'react';
import { X, Star, Edit3, ExternalLink, Calendar, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { CryptoData, Timeframe } from '../types';
import { formatNumber, formatPrice } from '../utils';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

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
  crypto: CryptoData;
  onClose: () => void;
  selectedTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
}

const timeframes: Timeframe[] = ['Hour', 'Day', 'Week', 'Month', 'Year'];

const tradingPlatforms = [
  { name: 'Binance', logo: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.svg?v=025' },
  { name: 'ByBit', logo: 'https://cryptologos.cc/logos/bybit-bbt-logo.svg?v=025' },
  { name: 'KuCoin', logo: 'https://cryptologos.cc/logos/kucoin-token-kcs-logo.svg?v=025' }
];

const linkPlatforms = [
  { name: 'CoinMarketCap', icon: 'CMC', color: 'text-blue-400' },
  { name: 'CoinGecko', icon: 'CG', color: 'text-green-400' },
  { name: 'TradingView', icon: 'TV', color: 'text-purple-400' }
];

export const TokenDetails: React.FC<TokenDetailsProps> = ({
  crypto,
  onClose,
  selectedTimeframe,
  onTimeframeChange,
}) => {
  const timeframePercentages = {
    Hour: '0%',
    Day: '-13.7%',
    Week: '6%',
    Month: '25.3%',
    Year: '130%'
  };

  const tokenAge = useMemo(() => {
    if (!crypto.launchDate) return 'Unknown';
    const launch = new Date(crypto.launchDate);
    const now = new Date();
    const diffYears = now.getFullYear() - launch.getFullYear();
    const diffMonths = now.getMonth() - launch.getMonth();
    const totalMonths = diffYears * 12 + diffMonths;
    
    if (totalMonths < 1) {
      const diffDays = Math.floor((now.getTime() - launch.getTime()) / (1000 * 60 * 60 * 24));
      return `${diffDays} days`;
    } else if (totalMonths < 12) {
      return `${totalMonths} months`;
    } else {
      const years = Math.floor(totalMonths / 12);
      const remainingMonths = totalMonths % 12;
      return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years} years`;
    }
  }, [crypto.launchDate]);

  // Sample data for the chart
  const chartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'Price',
        data: [0.32, 0.35, 0.34, 0.38, 0.37, 0.39, 0.40],
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl w-full max-w-3xl mx-4 shadow-2xl border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/30 
              border border-purple-500/30 flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">{crypto.name}</h2>
                <span className="text-sm px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {crypto.symbol}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Age: {tokenAge}</span>
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
            {/* Price Input and Current Price */}
            <div className="space-y-4">
              <div className="relative">
                <Edit3 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value="1"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white
                    focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">${formatPrice(crypto.price)}</span>
                <span className={`text-lg ${crypto.percentChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {crypto.percentChange >= 0 ? '+' : ''}{crypto.percentChange}%
                </span>
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <TrendingUp size={16} />
                  <span className="text-sm">Rank</span>
                </div>
                <div className="text-white font-bold flex items-center gap-2">
                  #{crypto.rank}
                  <span className="text-red-500 text-sm">↓7</span>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <DollarSign size={16} />
                  <span className="text-sm">Market Cap</span>
                </div>
                <div className="text-white font-bold">${formatNumber(crypto.marketCap)}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <BarChart3 size={16} />
                  <span className="text-sm">24h Volume</span>
                </div>
                <div className="text-white font-bold">${formatNumber(crypto.volume24h)}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Calendar size={16} />
                  <span className="text-sm">Launch Date</span>
                </div>
                <div className="text-white font-bold">
                  {crypto.launchDate ? new Date(crypto.launchDate).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            </div>
          </div>

          {/* Links and Trading Section */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-gray-400 mb-3 font-medium">Quick Links</h3>
              <div className="flex gap-3">
                {linkPlatforms.map(platform => (
                  <button
                    key={platform.name}
                    className={`w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center 
                      ${platform.color} font-semibold hover:bg-gray-700 transition-colors`}
                  >
                    {platform.icon}
                  </button>
                ))}
                <button className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700">
                  <ExternalLink size={20} />
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-gray-400 mb-3 font-medium">Trade</h3>
              <div className="flex gap-3">
                {tradingPlatforms.map(platform => (
                  <button
                    key={platform.name}
                    className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >
                    <img src={platform.logo} alt={platform.name} className="w-6 h-6" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="relative h-64 mb-6 bg-gray-800/30 rounded-lg p-4">
            <div className="absolute top-4 left-4 text-green-500 font-medium">${formatPrice(0.3868)}</div>
            <div className="absolute bottom-4 left-4 text-red-500 font-medium">${formatPrice(0.3214)}</div>
            <Line data={chartData} options={chartOptions} />
          </div>

          {/* Timeframe Selector */}
          <div className="flex justify-between items-center bg-gray-800/30 rounded-lg p-2">
            {timeframes.map(timeframe => (
              <button
                key={timeframe}
                onClick={() => onTimeframeChange(timeframe)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors flex flex-col items-center
                  ${selectedTimeframe === timeframe
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-gray-400 hover:text-white'}`}
              >
                {timeframe}
                <span className={timeframePercentages[timeframe].startsWith('-') ? 'text-red-400' : 'text-green-400'}>
                  {timeframePercentages[timeframe]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};