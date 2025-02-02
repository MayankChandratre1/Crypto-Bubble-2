import { useEffect, useState } from "react";
import { TokenService, handleApiError } from "../services/api";
import { Loader2 } from "lucide-react";

interface TokenRisk {
  symbol: string;
  riskLevel: number;
  price: number;
  volume24h: number;
  percentChange24h: number;
}

export default function DexRisks() {
  const [data, setData] = useState<TokenRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const { tokens } = await TokenService.getTokens({
        range: 'Top 100',
        sortBy: 'marketCap',
        sortDir: 'desc'
      });

      const risksData = tokens.map(token => ({
        symbol: token.symbol,
        riskLevel: token.riskLevel,
        price: token.price,
        volume24h: token.volume24h,
        percentChange24h: token.percentChange24h
      }));

      setData(risksData);
      setError(null);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24 w-24 bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500">
        <h2 className="text-lg font-semibold">Error Loading Data</h2>
        <p>{error}</p>
        <button 
          onClick={() => fetchData()} 
          className="mt-2 px-4 py-2 bg-red-100 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 h-24 w-24 bg-gray-900 text-white">
      <h1 className="text-xl font-bold mb-4">Risk Analysis</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-800">
            <tr>
              <th className="border border-gray-700 px-4 py-2 text-left">Symbol</th>
              <th className="border border-gray-700 px-4 py-2 text-left">Risk Level</th>
              <th className="border border-gray-700 px-4 py-2 text-right">Price</th>
              <th className="border border-gray-700 px-4 py-2 text-right">24h Volume</th>
              <th className="border border-gray-700 px-4 py-2 text-right">24h Change</th>
            </tr>
          </thead>
          <tbody>
            {data.map((token, index) => (
              <tr 
                key={token.symbol} 
                className={index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}
              >
                <td className="border border-gray-700 px-4 py-2">{token.symbol}</td>
                <td className="border border-gray-700 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: token.riskLevel > 75 ? 'red' : 
                                      token.riskLevel > 50 ? 'yellow' : 'green'
                      }}
                    />
                    {token.riskLevel}
                  </div>
                </td>
                <td className="border border-gray-700 px-4 py-2 text-right">
                  ${token.price.toFixed(4)}
                </td>
                <td className="border border-gray-700 px-4 py-2 text-right">
                  ${(token.volume24h / 1000000).toFixed(2)}M
                </td>
                <td className={`border border-gray-700 px-4 py-2 text-right ${
                  token.percentChange24h >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {token.percentChange24h >= 0 ? '+' : ''}
                  {token.percentChange24h.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}