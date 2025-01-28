import { useMemo, useState } from 'react';
import { Search, ChevronDown, Plus, SlidersHorizontal, X } from 'lucide-react';
import { FaTelegram } from "react-icons/fa";

interface Strategy {
  id: string;
  name: string;
  type: 'short' | 'long' | 'rsi';
}

interface Token {
  id: string;
  name: string;
  type: 'ai' | 'binance' | 'bybit';
}

interface NavbarProps {
  onRangeChange: (range: string) => void;
}

export const Navbar = ({ onRangeChange }: NavbarProps) => {
  const [showRankDropdown, setShowRankDropdown] = useState(false);
  const [showStrategySelector, setShowStrategySelector] = useState(false);
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [showShortTermDropdown, setShowShortTermDropdown] = useState(false);
  const [activeStrategyId, setActiveStrategyId] = useState('1');
  const [selectedTokenType, setSelectedTokenType] = useState<'binance' | 'bybit' | 'ai'>('binance');
  const [selectedRange, setSelectedRange] = useState("Top 100");

  const [selectedStrategies, setSelectedStrategies] = useState<Strategy[]>([
    { id: '1', name: 'Short-Term', type: 'short' },
    { id: '2', name: 'Long-Term', type: 'long' }
  ]);

  const [selectedTokens, setSelectedTokens] = useState<Token[]>([
    { id: '1', name: 'Binance', type: 'binance' },
    { id: '2', name: 'Bybit', type: 'bybit' }
  ]);

  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
    setShowRankDropdown(false);
    onRangeChange(range);
  }

  const allStrategies: Strategy[] = [
    { id: '1', name: 'Short-Term', type: 'short' },
    { id: '2', name: 'Long-Term', type: 'long' },
    { id: '3', name: 'RSI', type: 'rsi' }
  ];

  const allTokens: Token[] = [
    { id: '1', name: 'Binance', type: 'binance' },
    { id: '2', name: 'Bybit', type: 'bybit' },
    { id: '3', name: 'AI Agent', type: 'ai' }
  ];

  const toggleStrategy = (strategy: Strategy) => {
    if (selectedStrategies.find(s => s.id === strategy.id)) {
      if (selectedStrategies.length > 1) {
        setSelectedStrategies(selectedStrategies.filter(s => s.id !== strategy.id));
        if (strategy.id === activeStrategyId) {
          const remainingStrategies = selectedStrategies.filter(s => s.id !== strategy.id);
          setActiveStrategyId(remainingStrategies[0].id);
        }
      }
    } else {
      setSelectedStrategies([...selectedStrategies, strategy]);
    }
  };



  const toggleToken = (token: Token) => {
    setSelectedTokenType(token.type);
    if (!selectedTokens.find(t => t.id === token.id)) {
      setSelectedTokens([...selectedTokens, token]);
    }
  };

  const getButtonStyle1 = (strategyId: string) => {
    const isActive = strategyId === activeStrategyId;
    return isActive 
      ? 'bg-[#1B61B3] text-[#F6F6F6] hover:bg-blue-500/30'
      : 'bg-gray-700 text-[#F6F6F6] hover:bg-gray-600';
  };

  const getTokenButtonStyle2 = (type: 'binance' | 'bybit' | 'ai') => {
    switch (type) {
      case 'binance':
        return type === selectedTokenType
          ? 'bg-[#1B61B3] text-[#F6F6F6] hover:bg-blue-500/30'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600';
      case 'bybit':
        return type === selectedTokenType
          ? 'bg-[#1B61B3] text-[#F6F6F6] hover:bg-blue-500/30'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600';
      case 'ai':
        return type === selectedTokenType
          ? 'bg-[#1B61B3] text-[#F6F6F6] hover:bg-blue-500/30'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600';
    }
  };

  const getSelectorItemStyle = (type: 'short' | 'long' | 'rsi' | 'ai' | 'binance' | 'bybit', isSelected: boolean) => {
    const baseStyle = 'px-3 mt-2 py-2 rounded cursor-pointer transition-colors duration-150 w-full text-left';
    if (!isSelected) return `${baseStyle} hover:bg-gray-700  text-gray-300`;
    
    switch (type) {
      case 'short':
      case 'bybit':
        return `${baseStyle} bg-[#1B61B3] text-[#F6F6F6]`;
      case 'long':
      case 'rsi':
      case 'binance':
        return `${baseStyle} bg-[#1B61B3] text-[#F6F6F6]`;
      case 'ai':
        return `${baseStyle} bg-[#1B61B3] text-[#F6F6F6]`;
      default:
        return `${baseStyle} bg-[#1B61B3] text-[#F6F6F6]`;
    }
  };

  return (
    <div className="flex flex-col w-full bg-gray-900">
      <div className="flex items-center justify-between p-4 bg-gray-800/50">
        <div className="flex items-center gap-2">
          <img
            src="https://i.ibb.co/znbC3SV/Group.jpg"
            alt="Coinchart.fun"
            className="w-10 h-10 rounded-full"
          />
          <span className="text-2xl font-bold text-white">Coinchart.fun</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative max-w-xl w-64 mx-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search Crypto Currencies"
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg
                border border-gray-700 focus:border-blue-500 focus:outline-none
                placeholder-gray-500"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowRankDropdown(!showRankDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
            >
              {selectedRange}
              <ChevronDown size={20} />
            </button>

            {showRankDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-50">
                <div className="p-2 space-y-1">
                  {["Top 100", "101 - 200", "201 - 300", "301 - 400"].map((range) => (
                    <label
                      key={range}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded cursor-pointer"
                      onClick={() => handleRangeChange(range)}
                    >
                      <input
                        type="radio"
                        name="rank"
                        className="text-blue-500"
                        checked={selectedRange === range}
                        onChange={() => handleRangeChange(range)}
                      />
                      <span className="text-white">{range}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button className="flex items-center ml-4 text-xs gap-2 text-gray-300 hover:text-white">
            API Access ?
            <FaTelegram size={14} className="text-blue-400" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-start p-4 bg-black pr-24">
        <div className="flex items-center justify-between gap-24">
          <div className="flex items-center gap-4">
            <span className="text-white">Strategies :</span>
            {selectedStrategies.map(strategy => (
              <div key={strategy.id} className="relative">
                <button
                  onClick={() => setActiveStrategyId(strategy.id)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${getButtonStyle1(strategy.id)}`}
                >
                  {strategy.name}
                  {strategy.type === 'short' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowShortTermDropdown(!showShortTermDropdown);
                      }}
                    >
                      <SlidersHorizontal size={18} />
                    </button>
                  )}
                </button>
                
                {strategy.type === 'short' && showShortTermDropdown && (
                  <div className="absolute left-0 mt-2 w-64 bg-[#1F2937] rounded-lg shadow-lg z-50">
                    <div className="p-4 space-y-3">
                      <div className="space-y-2">
                        <h3 className="text-white font-semibold mb-2">Filters</h3>
                        <label className="flex font-light items-center gap-2 text-white">
                          <input type="checkbox" className="rounded bg-gray-700 border-gray-600" />
                          <span>Skip potential traps</span>
                        </label>
                        <label className="flex font-light items-center gap-2 text-white">
                          <input type="checkbox" className="rounded bg-gray-700 border-gray-600" />
                          <span>Avoid Overhyped Tokens</span>
                        </label>
                        <label className="flex font-light items-center gap-2 text-white">
                          <input type="checkbox" className="rounded bg-gray-700 border-gray-600" />
                          <span>Market Cap - 10M</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={() => setShowStrategySelector(!showStrategySelector)}
              className="w-8 h-8 rounded-full bg-[#1B61B3] text-[#F6F6F6] flex items-center justify-center hover:bg-gray-700"
            >
              {showStrategySelector ? <X size={20} /> : <Plus size={20} />}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-white">Token :</span>
            {selectedTokens.map(token => (
              <button
                key={token.id}
                onClick={() => setSelectedTokenType(token.type)}
                className={`px-4 py-1.5 rounded-full ${getTokenButtonStyle2(token.type)}`}
              >
                {token.name}
              </button>
            ))}
            <button
              onClick={() => setShowTokenSelector(!showTokenSelector)}
              className="w-8 h-8 rounded-full bg-[#1B61B3] text-[#F6F6F6] flex items-center justify-center hover:bg-gray-700"
            >
              {showTokenSelector ? <X size={20} /> : <Plus size={20} />}
            </button>
            {showTokenSelector && (
              <div className="absolute top-36 w-48 bg-gray-800 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  {allTokens.map(token => (
                    <button
                      key={token.id}
                      onClick={() => toggleToken(token)}
                      className={getSelectorItemStyle(
                        token.type,
                        selectedTokens.some(t => t.id === token.id)
                      )}
                    >
                      {token.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {showStrategySelector && (
          <div className="absolute left-72 top-36 w-48 bg-gray-800 rounded-lg shadow-lg z-50">
            <div className="p-2">
              {allStrategies.map(strategy => (
                <button
                  key={strategy.id}
                  onClick={() => toggleStrategy(strategy)}
                  className={getSelectorItemStyle(
                    strategy.type,
                    selectedStrategies.some(s => s.id === strategy.id)
                  )}
                >
                  {strategy.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};