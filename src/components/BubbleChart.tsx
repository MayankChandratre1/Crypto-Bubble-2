import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CryptoData } from '../types';
import { formatNumber, formatPercentage } from '../utils';

interface BubbleChartProps {
  data: CryptoData[];
  onBubbleClick: (crypto: CryptoData) => void;
}

export const BubbleChart: React.FC<BubbleChartProps> = ({ data, onBubbleClick }) => {
  const maxVolume = Math.max(...data.map(d => d.volume24h));
  
  const getBubbleSize = (marketCap: number) => {
    return (marketCap / Math.max(...data.map(d => d.marketCap))) * 80 + 40; 
  };

  const getXPosition = (volume: number) => {
    return (volume / maxVolume) * 80 + 20;
  };

  const getYPosition = (percentChange: number) => {
    if (percentChange > 0) {
      return 25 - (percentChange / 100) * 25; // Green section
    } else if (percentChange < 0) {
      return 75 + (Math.abs(percentChange) / 100) * 25; // Red section
    } else {
      return 50; // Middle section for unchanged
    }
  };

  return (
    <div className="relative w-full h-[600px] bg-black rounded-lg overflow-hidden">

      <div className="absolute top-0 left-0 right-0 h-[25%] bg-red-500/30 backdrop-blur-sm" />
      
      <div className="absolute bottom-0 left-0 right-0 h-[25%] bg-green-500/30 backdrop-blur-sm" />

      <div className="absolute left-4 top-0 bottom-0 flex flex-col justify-between text-sm text-gray-400 py-8">
        <span>High Risk</span>
        <span>Medium Risk</span>
        <span>Low Risk</span>
      </div>

     
      <div className="absolute right-4 text-sm">
        <span className="text-red-400">OVERBOUGHT</span>
      </div>
      <div className="absolute right-4 bottom-8 text-sm">
        <span className="text-green-400">OVERSOLD</span>
      </div>


      <div className="absolute inset-16">
        <AnimatePresence>
          {data.map((crypto) => {
            const size = getBubbleSize(crypto.marketCap);
            const x = getXPosition(crypto.volume24h);
            const y = getYPosition(crypto.percentChange);
            
            return (
              <motion.div
                key={crypto.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  x: `${x}%`,
                  y: `${y}%`,
                }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  width: size,
                  height: size,
                }}
                onClick={() => onBubbleClick(crypto)}
              >
                <div 
                  className={`w-full h-full rounded-full flex flex-col items-center justify-center
                    ${crypto.percentChange >= 0 
                      ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 border-emerald-400/30' 
                      : 'bg-gradient-to-br from-rose-500/20 to-rose-600/30 border-rose-400/30'}
                    border backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow
                    text-white group relative`}
                >
                  <span className="text-lg font-bold">{crypto.symbol}</span>
                  <span className={`text-sm ${
                    crypto.percentChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {formatPercentage(crypto.percentChange)}
                  </span>
                  

                  <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 rounded-lg text-sm whitespace-nowrap transition-opacity">
                    <div className="text-white">Risk Level: {crypto.riskLevel}</div>
                    <div className="text-gray-400">Volume: ${formatNumber(crypto.volume24h)}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      
    </div>
  );
};