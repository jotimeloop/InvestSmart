import React, { useState, useId } from 'react';

interface InteractiveChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  color?: string;
  isPositive?: boolean;
  unitPrefix?: string;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  data,
  labels,
  height = 140,
  isPositive = true,
  unitPrefix = '₹',
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const chartId = useId();

  if (!data || data.length < 2) {
    return <div className="h-28 flex items-center justify-center text-xs text-slate-500">No chart data available</div>;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Viewbox coordinates
  const width = 400;
  const paddingX = 10;
  const paddingY = 15;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const points = data.map((val, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * chartW;
    const y = paddingY + chartH - ((val - min) / range) * chartH;
    return { x, y, val, label: labels ? labels[idx] : `Point ${idx + 1}` };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)},${height} L ${points[0].x.toFixed(1)},${height} Z`;

  const strokeColor = isPositive ? '#10b981' : '#f43f5e';
  const fillColor = isPositive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)';

  const activePoint = activeIndex !== null ? points[activeIndex] : points[points.length - 1];

  const handleTouch = (e: React.TouchEvent<SVGSVGElement> | React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const relativeX = clientX - rect.left;
    const pct = Math.max(0, Math.min(1, relativeX / rect.width));
    const closestIdx = Math.round(pct * (data.length - 1));
    setActiveIndex(closestIdx);
  };

  return (
    <div className="w-full relative select-none">
      {/* Active tooltip indicator */}
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="text-[11px] font-medium text-slate-400">
          {activePoint.label || 'Latest'}
        </span>
        <span className={`text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {unitPrefix}
          {activePoint.val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible cursor-crosshair touch-none"
        onMouseMove={handleTouch}
        onTouchMove={handleTouch}
        onMouseLeave={() => setActiveIndex(null)}
        onTouchEnd={() => setActiveIndex(null)}
      >
        <defs>
          <linearGradient id={`grad-${chartId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Shaded Area */}
        <path d={areaD} fill={`url(#grad-${chartId})`} />

        {/* Line Stroke */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Active hover crosshair and circle */}
        {activeIndex !== null && (
          <g>
            <line
              x1={activePoint.x}
              y1={paddingY}
              x2={activePoint.x}
              y2={height}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeDasharray="3 3"
              strokeWidth="1.5"
            />
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="5"
              fill={strokeColor}
              stroke="#0f172a"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
