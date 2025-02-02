import React, { useState } from 'react';
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { wagmiConfig, chains } from './config/payment';
import { Navbar } from './components/Navbar';
import ResizableLayout from './components/Resizablecomponent';
import BitcoinRiskChart from './components/BubbleChart2';
import { BuySignalsPanel } from './components/BuySignalsPanel';
import { Wget } from './components/Chart';
import { useNavigate, useLocation } from 'react-router-dom';

import { CryptoData } from './types';
import PaymentModal from './components/PaymentModal';
import '@rainbow-me/rainbowkit/styles.css';

const mockData: CryptoData[] = [
  {
    id: '1',
    symbol: 'BTC',
    name: 'Bitcoin',
    marketCap: 789456123000,
    price: 42069.50,
    volume24h: 12345678900,
    percentChange: 2.5,
    rank: 1,
    launchDate: '2009-01-03',
    riskLevel: 45
  },
  {
    id: '2',
    symbol: 'ETH',
    name: 'Ethereum',
    marketCap: 234567890000,
    price: 2345.67,
    volume24h: 9876543210,
    percentChange: -1.8,
    rank: 2,
    launchDate: '2015-07-30',
    riskLevel: 38
  },
  {
    id: '3',
    symbol: 'SOL',
    name: 'Solana',
    marketCap: 45678901234,
    price: 123.45,
    volume24h: 5432109876,
    percentChange: 5.2,
    rank: 3,
    launchDate: '2020-03-16',
    riskLevel: 75
  },
  {
    id: '4',
    symbol: 'XRP',
    name: 'Ripple',
    marketCap: 34567890123,
    price: 0.5432,
    volume24h: 4321098765,
    percentChange: -3.1,
    rank: 4,
    launchDate: '2012-01-01',
    riskLevel: 25
  },
  {
    id: '5',
    symbol: 'ADA',
    name: 'Cardano',
    marketCap: 23456789012,
    price: 0.6789,
    volume24h: 3210987654,
    percentChange: 1.4,
    rank: 5,
    launchDate: '2017-09-29',
    riskLevel: 60
  }
];

// Create a wrapper component for PaymentModal to handle navigation
const PaymentModalWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const planType = queryParams.get('plan') as 'premium' | 'test' || 'premium';
  const amount = planType === 'premium' ? 49 : 1;
  const description = planType === 'premium' 
    ? 'Access to Buy Signals & two Premium TradingView scripts'
    : 'Testing CoinChart subscription';
  
  return (
    <PaymentModal 
      isOpen={true}
      onClose={() => navigate('/')}
      planType={planType}
      amount={amount}
      description={description}
    />
  );
};

// Success Page Component
const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black">
      <div className="text-white text-center">
        <h1 className="text-2xl mb-4">Payment Successful!</h1>
        <p className="mb-4">Your premium subscription is now active</p>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

// Cancel Page Component
const PaymentCancelPage = () => {
  const navigate = useNavigate();
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black">
      <div className="text-white text-center">
        <h1 className="text-2xl mb-4">Payment Cancelled</h1>
        <p className="mb-4">Your payment was not completed</p>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRange, setSelectedRange] = useState("Top 100");
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);

  const filteredData = mockData.filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleBubbleClick(crypto: CryptoData): void {
    setSelectedCrypto(crypto);
  }

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Router>
          <Routes>
            <Route path="/" element={
              <ResizableLayout rightPanel={<BuySignalsPanel />}>
                <div className="flex-1 flex flex-col">
                  <Navbar onRangeChange={setSelectedRange} />
                  <div className="flex-1 p-6">
                    <div className="w-full h-full">
                      <BitcoinRiskChart 
                        selectedRange={selectedRange}
                        onBubbleClick={(crypto: CryptoData) => handleBubbleClick(crypto)}
                        // isCollapsed will be injected by ResizableLayout
                      />
                      {selectedCrypto && (
                        <Wget onClose={() => setSelectedCrypto(null)}/>
                      )}
                    </div>
                  </div>
                </div>
              </ResizableLayout>
            } />
            <Route path="/payment" element={<PaymentModalWrapper />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/cancel" element={<PaymentCancelPage />} />
          </Routes>
        </Router>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;