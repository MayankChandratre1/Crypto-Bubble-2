import { useEffect, useMemo, useState, memo } from "react";
import { Loader2 } from "lucide-react";
import './bubble.css';

interface CryptoData {
  Symbol: string;
  Risk: number;
  Icon: string;
  price?: number;
  volume?: number;
  moralis?: string;
  "1mChange"?: number;
  "2wChange"?: number;
  "3mChange"?: number;
}

interface BubbleProps {
  data: CryptoData;
  onBubbleClick: (crypto: CryptoData) => void;
}

const Bubble = memo(({ data, onBubbleClick }: BubbleProps) => (
  <div className="bubble">
    <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm shadow-lg transition-transform hover:scale-105">
      <div className="w-full h-full rounded-full bg-gradient-to-br from-white/20 to-transparent" />
    </div>

    <div 
      onClick={() => onBubbleClick(data)} 
      className="absolute inset-0 flex flex-col items-center justify-center text-center group cursor-pointer"
    >
      {data?.Icon && <img 
        src={data.Icon} 
        alt={data.Symbol} 
        className="w-1/3 h-1/3 object-contain mb-1"
        loading="lazy"
      />}
      <span className="text-xs font-medium">{data.Symbol}</span>
      <span className="text-xs font-bold">{data.Risk?.toFixed(1)}%</span>
    </div>
  </div>
));

Bubble.displayName = 'Bubble';

interface BitcoinRiskChartProps {
  onBubbleClick: (crypto: CryptoData) => void;
  selectedRange: string;
}

interface Position {
  x: number;
  y: number;
}

const BUBBLE_SIZE = 48; // 3rem
const MIN_DISTANCE = BUBBLE_SIZE + 10; // Size plus margin
const CONTAINER_WIDTH = 1600; // Increased width
const CONTAINER_HEIGHT = 1200;

function calculateDistance(p1: Position, p2: Position): number {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function isValidPosition(position: Position, existingPositions: Position[], containerWidth: number, containerHeight: number): boolean {
  // Check container boundaries
  if (position.x < BUBBLE_SIZE || position.x > containerWidth - BUBBLE_SIZE ||
      position.y < BUBBLE_SIZE || position.y > containerHeight - BUBBLE_SIZE) {
    return false;
  }

  // Check collision with other bubbles
  return !existingPositions.some(pos => 
    calculateDistance(position, pos) < MIN_DISTANCE
  );
}

export default function BitcoinRiskChart({ onBubbleClick, selectedRange }: BitcoinRiskChartProps) {
  const [data, setData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://3.75.231.25/dex_risks");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const responseText = await response.text();
        const sanitizedResponseText = responseText.replace(/NaN/g, "null");
        const result = JSON.parse(sanitizedResponseText);

        const transformedData = Object.keys(result)
          .map((key) => ({
            Symbol: result[key].symbol,
            Risk: result[key].risk,
            Icon: result[key].icon,
            price: result[key].price,
            volume: result[key].volume || 0,
            moralis: result[key].moralisLink,
            "1mChange": result[key]["1mChange"],
            "2wChange": result[key]["2wChange"],
            "3mChange": result[key]["3mChange"]
          }))
          .sort((a, b) => (b.volume || 0) - (a.volume || 0));

        setData(transformedData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    let start = 0;
    let end = 100;

    if (selectedRange !== "Top 100") {
      const [startStr, endStr] = selectedRange.split(" - ");
      start = parseInt(startStr) - 1;
      end = parseInt(endStr);
    }

    return data.slice(Math.max(0, start), Math.min(data.length, end));
  }, [data, selectedRange]);

  const bubblePositions = useMemo(() => {
    const containerWidth = CONTAINER_WIDTH - BUBBLE_SIZE;
    const containerHeight = CONTAINER_HEIGHT - BUBBLE_SIZE;
  
    const positions: Position[] = filteredData.map((item, index) => {
      return {
        x: Math.min(containerWidth - BUBBLE_SIZE, Math.max(BUBBLE_SIZE, (item.Risk / 100) * containerWidth + (index % 3) * 30 - 30)), // Spread X with slight variation
        y: containerHeight - (item.Risk / 100) * containerHeight, // Spread Y based on risk
      };
    });
  
    // Function to adjust overlapping bubbles
    function adjustPositions(positions: Position[]): boolean {
      let moved = false;
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const p1 = positions[i];
          const p2 = positions[j];
          const distance = calculateDistance(p1, p2);
          
          if (distance < MIN_DISTANCE) {
            moved = true;
            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            const moveBy = (MIN_DISTANCE - distance) / 2;
            
            positions[i].x = Math.min(containerWidth - BUBBLE_SIZE, Math.max(BUBBLE_SIZE, positions[i].x - Math.cos(angle) * moveBy));
            positions[i].y = Math.min(containerHeight - BUBBLE_SIZE, Math.max(BUBBLE_SIZE, positions[i].y - Math.sin(angle) * moveBy));
            
            positions[j].x = Math.min(containerWidth - BUBBLE_SIZE, Math.max(BUBBLE_SIZE, positions[j].x + Math.cos(angle) * moveBy));
            positions[j].y = Math.min(containerHeight - BUBBLE_SIZE, Math.max(BUBBLE_SIZE, positions[j].y + Math.sin(angle) * moveBy));
          }
        }
      }
      return moved;
    }
  
    // Apply position adjustment iteratively
    let iterations = 0;
    while (adjustPositions(positions) && iterations < 15) { // Increased iteration limit
      iterations++;
    }
  
    return positions;
  }, [filteredData]);
  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4">
        <p className="text-red-600">Error loading data: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-red-100 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-[80vh] w-[1000px] overflow-y-auto overflow-x-auto">
      <div className="custom-div"  style={{ width: `${CONTAINER_WIDTH}px` }}>
        <div className="absolute -left-[30px] top-0 h-full flex flex-col justify-between text-sm">
          <span>100-</span>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</span>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</span>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</span>
          <span>80 -</span>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</span>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</span>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</span>
          <span>60 -</span>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</span>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</span>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</span>
          <span>40 -</span>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</span>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</span>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</span>
          <span>20 -</span>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</span>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</span>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</span>
          <span>00 -</span>
        </div>

        <div className="absolute left-8 top-2 text-lg font-semibold">Risk Levels</div>
        <div className="absolute bottom-2 right-4 text-emerald-300 font-medium">UNDERVALUED</div>
        <div className="absolute top-2 right-4 text-red-300 font-medium">OVERVALUED</div>

        {filteredData.map((item, index) => (
          <div
            key={item.Symbol}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${bubblePositions[index].x}px`,
              top: `${bubblePositions[index].y}px`,
            }}
          >
            <Bubble
              data={item}
              onBubbleClick={onBubbleClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
}