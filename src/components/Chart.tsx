import { X } from 'lucide-react';
import { useEffect } from 'react';

declare global {
    interface Window {
        createTokenWget?: (containerId: string, options: { chainId: string; tokenAddress: string }) => void;
    }
}

interface WgetProps {
    onClose: () => void;
}

export const Wget = ({ onClose }: WgetProps) => {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const loadWidget = () => {
            if (typeof window.createTokenWget === 'function') {
                window.createTokenWget('token-widget-container', {
                    chainId: '0x1',
                    tokenAddress:  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
                });
            } else {
                console.error('createTokenWget function is not defined.');
            }
        };

        if (!document.getElementById('moralis-token-widget')) {
            const script = document.createElement('script');
            script.id = 'moralis-token-widget';
            script.src = 'https://moralis.com/static/embed/token.js';
            script.type = 'text/javascript';
            script.async = true;
            script.onload = loadWidget;
            script.onerror = () => {
                console.error('Failed to load the chart widget script.');
            };
            document.body.appendChild(script);
        } else {
            loadWidget();
        }
    }, []);

    return (
        <div className='flex justify-center items-end bg-black/50 backdrop-blur-sm fixed inset-0 z-50'>
            
            <div style={{ width: '80vw', height: '80vh' }} className='fixed   bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-10 mb-20'>
                <div className='absolute top-4 right-4'>
                        <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 
                        hover:bg-gray-700 hover:text-white transition-colors"
                    >
                        <X size={50} />
                    </button>
                </div>
                <div id="token-widget-container" style={{ width: '100%', height: '100%' }} />
            </div>
        </div>
    );
};
