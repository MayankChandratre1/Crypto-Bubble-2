import { useEffect, useMemo, useState, memo, useRef } from "react";
import { Loader2, GripVertical } from "lucide-react";
import * as d3 from 'd3';
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
  bubbleSize?: number;
  x?: number;
  y?: number;
  radius?: number;
}

interface BubbleProps {
  data: CryptoData;
  onBubbleClick: (crypto: CryptoData) => void;
}

const Bubble = memo(({ data, onBubbleClick }: BubbleProps) => {
  const size = data.bubbleSize ? 48 * data.bubbleSize : 48;
  
  const calculateBubbleColor = (risk: number) => {
    if (risk >= 50 && risk <= 55) return 'hsl(0, 0%, 50%)';
    
    if (risk < 50) {
      const intensity = (risk / 50) * 100;
      return `hsl(${120 - (intensity * 0.5)}, ${70 - (intensity * 0.3)}%, ${30 + (intensity * 0.4)}%)`;
    }
    
    const intensity = ((risk - 55) / 45) * 100;
    return `hsl(0, ${50 + (intensity * 0.5)}%, ${50 - (intensity * 0.3)}%)`;
  };

  return (
    <div className="bubble">
      <div 
        className="rounded-full bg-black/20 backdrop-blur-sm shadow-lg transition-transform hover:scale-105"
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          backgroundColor: calculateBubbleColor(data.Risk) 
        }}
      >
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
  );
});

Bubble.displayName = 'Bubble';

interface BitcoinRiskChartProps {
  onBubbleClick: (crypto: CryptoData) => void;
  selectedRange: string;
}

const CONTAINER_WIDTH = 1140;
const MIN_WIDTH = 800;
const CONTAINER_HEIGHT = 600;

export default function BitcoinRiskChart({ onBubbleClick, selectedRange }: BitcoinRiskChartProps) {
  const [data, setData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(CONTAINER_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(CONTAINER_WIDTH);

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
            "3mChange": result[key]["3mChange"],
            bubbleSize: result[key].bubbleSize
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

  useEffect(() => {
    if (!containerRef.current || !filteredData.length) return;

    const container = d3.select(containerRef.current);
    container.selectAll("*").remove();

    const initializedData = filteredData.map(d => ({
      ...d,
      x: Math.random() * chartWidth,
      y: CONTAINER_HEIGHT - (d.Risk / 100) * CONTAINER_HEIGHT,
      radius: (d.bubbleSize ? (d.bubbleSize * 48) % 200 : 48) / 2
    }));

    const simulation = d3.forceSimulation<CryptoData>(initializedData as any)
      .force("charge", d3.forceManyBody().strength(15))
      .force("collide", d3.forceCollide<CryptoData>(d => d.radius ? d.radius + 5 : 5))
      .force("y", d3.forceY<CryptoData>(d => 
        CONTAINER_HEIGHT - (d.Risk / 100) * CONTAINER_HEIGHT
      ).strength(0.5))
      .force("x", d3.forceX(chartWidth / 2).strength(0.02))
      .force("bound", () => {
        initializedData.forEach(d => {
          d.x = Math.max(d.radius || 0, Math.min(chartWidth - (d.radius || 0), d.x || 0));
          d.y = Math.max(d.radius || 0, Math.min(CONTAINER_HEIGHT - (d.radius || 0), d.y || 0));
        });
      })
      .alphaDecay(0.02)
      .alphaTarget(0)
      .velocityDecay(0.4);

    const bubbles = container.selectAll(".bubble-container")
      .data(initializedData)
      .enter()
      .append("div")
      .attr("class", "bubble-container absolute transform -translate-x-1/2 -translate-y-1/2")
      .style("left", d => `${d.x}px`)
      .style("top", d => `${d.y}px`)
      .html(d => `
        <div class="bubble">
          <div class="rounded-full bg-black/20 backdrop-blur-sm shadow-lg transition-transform hover:scale-105"
               style="width: ${d.radius * 2}px; height: ${d.radius * 2}px">
            <div class="w-full h-full rounded-full bg-gradient-to-br from-white/20 to-transparent" />
          </div>
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center group cursor-pointer">
            ${d.Icon ? `<img src="${d.Icon}" alt="${d.Symbol}" class="w-1/3 h-1/3 object-contain mb-1" loading="lazy" />` : ''}
            <span class="text-xs font-medium">${d.Symbol}</span>
            <span class="text-xs font-bold">${d.Risk?.toFixed(1)}%</span>
          </div>
        </div>
      `)
      .on("click", (_, d) => onBubbleClick(d));

    simulation.on("tick", () => {
      bubbles
        .style("left", d => `${d.x}px`)
        .style("top", d => `${d.y}px`);
    });

    return () => {
      simulation.stop();
    };
  }, [filteredData, chartWidth, onBubbleClick]);

  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(chartWidth);
  };

  const handleResize = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const newWidth = Math.max(MIN_WIDTH, Math.min(
      startWidth + (e.clientX - startX),
      window.innerWidth - 100
    ));
    setChartWidth(newWidth);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResize);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, startWidth, startX]);

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
    <div className="relative flex">
      <div className="relative bg-black flex-grow overflow-hidden" style={{ height: CONTAINER_HEIGHT }}>
        <div className="absolute left-0 top-0 flex flex-col text-sm text-white"
             style={{ width: '30px', height: `${CONTAINER_HEIGHT-50}px` }}>
          {[100, 80, 60, 40, 20, 0].map(level => (
            <span 
              key={level}
              className="absolute text-xs"
              style={{ 
                top: `${CONTAINER_HEIGHT - (level / 100) * CONTAINER_HEIGHT}px`,
                transform: 'translateY(-10%)'
              }}
            >
              {level} -
            </span>
          ))}
        </div>

        <div className="absolute left-8 top-2 text-lg font-semibold text-white">Risk Levels</div>
        <div className="absolute bottom-2 right-4 text-emerald-300 font-medium">UNDERVALUED</div>
        <div className="absolute top-2 right-4 text-red-300 font-medium">OVERVALUED</div>

        <div 
          ref={containerRef}
          className="custom-div mx-auto ml-7" 
          style={{ 
            width: `${chartWidth}px`, 
            height: `${CONTAINER_HEIGHT}px`,
            position: 'relative',
            marginTop: '0px'
          }}
        />
      </div>
      
      <div
        className="w-2 bg-gray-800 cursor-col-resize flex items-center justify-center hover:bg-gray-700"
        onMouseDown={handleResizeStart}
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
}