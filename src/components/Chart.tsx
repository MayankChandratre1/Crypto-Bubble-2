import { X } from 'lucide-react';
import { useEffect } from 'react';

declare global {
  interface Window {
    createTokenWget?: (containerId: string, options: { 
      chainId: string; 
      tokenAddress: string;
      theme?: 'dark' | 'light';
      height?: number;
      width?: number;
    }) => void;
  }
}

interface ChartProps {
  onClose: () => void;
  tokenAddress?: string;
  chainId?: string;
}

export const Chart = ({ onClose, tokenAddress = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', chainId = '0x1' }: ChartProps) => {
  useEffect(() => {
    const loadWidget = () => {
      if (typeof window.createTokenWget === 'function') {
        window.createTokenWget('token-widget-container', {
          chainId,
          tokenAddress,
          theme: 'dark',
          height: window.innerHeight * 0.8,
          width: window.innerWidth * 0.8
        });
      } else {
        console.error('Moralis token widget failed to load');
      }
    };

    // Load Moralis token widget script
    if (!document.getElementById('moralis-token-widget')) {
      const script = document.createElement('script');
      script.id = 'moralis-token-widget';
      script.src = 'https://token.moralis.io/static/embed/token.js';
      script.type = 'text/javascript';
      script.async = true;
      script.onload = loadWidget;
      script.onerror = () => {
        console.error('Failed to load Moralis token widget');
      };
      document.body.appendChild(script);
    } else {
      loadWidget();
    }

    // Cleanup
    return () => {
      const container = document.getElementById('token-widget-container');
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [tokenAddress, chainId]);

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
      <div 
        className='relative bg-gray-900 rounded-xl w-4/5 h-4/5 flex flex-col items-center justify-center'
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center 
            text-gray-400 hover:bg-gray-700 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Chart Container */}
        <div 
          id="token-widget-container" 
          className="w-full h-full rounded-xl overflow-hidden"
        />
      </div>
    </div>
  );
};

// Export named components
export { Chart as Wget };