import  { useState } from 'react';
import { CryptoData, Timeframe } from './types';
import { BuySignalsPanel } from './components/BuySignalsPanel';
import { Wget } from './components/Chart';
import BitcoinRiskChart from './components/BubbleChart2';
import DexRisks from './components/FetchData';
import { Navbar } from './components/Navbar';

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
          <div className="max-h-screen max-w-screen bg-black flex overflow-hidden">
            <div className="flex-1 flex flex-col">
            <Navbar onRangeChange={setSelectedRange} />
              {/* <div className='bg-white'>
              <DexRisks/>
              </div> */}
              <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                <BitcoinRiskChart 
                  selectedRange={selectedRange}
                  onBubbleClick={handleBubbleClick} 
                />


                  {selectedCrypto && (
                    <Wget onClose={() => setSelectedCrypto(null)}/>
                  )}
                </div>
              </div>
            </div>
            <BuySignalsPanel />
          </div>
  );
}

export default App;