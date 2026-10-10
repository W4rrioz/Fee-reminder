import React, { useState } from 'react';

/**
 * Modern lightweight SVG Pie & Donut Chart
 * Zero external charting dependencies. Pure React + SVG.
 * 
 * Props:
 * - data: Array of { label: string, value: number, color?: string, formattedValue?: string }
 * - size: number (default: 200)
 * - donut: boolean (default: true)
 * - strokeWidth: number (thickness of donut ring, default: 28)
 * - centerLabel: string (e.g. "Total Fees")
 * - centerValue: string (e.g. "₹12,200")
 * - showLegend: boolean (default: true)
 * - interactive: boolean (default: true)
 * - emptyMessage: string (default: "No data available")
 */
export const PieChart = ({
  data = [],
  size = 200,
  donut = true,
  strokeWidth = 26,
  centerLabel = '',
  centerValue = '',
  showLegend = true,
  interactive = true,
  emptyMessage = 'No data available',
  title = '',
  subtitle = ''
}) => {
  const [activeIdx, setActiveIdx] = useState(null);

  // Filter out negative values
  const validData = data
    .map((item, idx) => ({
      ...item,
      value: Math.max(0, Number(item.value) || 0),
      _id: idx
    }))
    .filter((item) => item.value > 0);

  const total = validData.reduce((acc, curr) => acc + curr.value, 0);

  // Palette fallback if color is missing
  const DEFAULT_COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#EC4899', // Pink
    '#6366F1'  // Indigo
  ];

  // If no data or total is 0, render empty state
  if (total === 0 || validData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
        {title && <h4 className="text-xs font-bold text-slate-800 mb-1">{title}</h4>}
        <div
          className="rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center my-3 text-slate-400"
          style={{ width: size * 0.7, height: size * 0.7 }}
        >
          <span className="text-[11px] font-medium px-2">{emptyMessage}</span>
        </div>
      </div>
    );
  }

  // Pre-calculate arc coordinates
  // Center is (radius, radius)
  const radius = size / 2;
  // Arc outer radius
  const outerR = radius - 8;
  // Arc inner radius (for donut)
  const innerR = donut ? Math.max(10, outerR - strokeWidth) : 0;

  // Helper to convert polar to cartesian
  const polarToCartesian = (centerX, centerY, r, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians)
    };
  };

  // Build SVG path for slice
  let currentAngle = 0;
  const slices = validData.map((item, idx) => {
    const sliceAngle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const percentage = ((item.value / total) * 100).toFixed(1);
    const color = item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
    const isSingleSlice = sliceAngle >= 359.99;

    let pathD = '';
    // If it's a 360 circle or near 360
    if (isSingleSlice) {
      if (donut) {
        pathD = `
          M ${radius} ${radius - outerR}
          A ${outerR} ${outerR} 0 1 0 ${radius} ${radius + outerR}
          A ${outerR} ${outerR} 0 1 0 ${radius} ${radius - outerR}
          M ${radius} ${radius - innerR}
          A ${innerR} ${innerR} 0 1 1 ${radius} ${radius + innerR}
          A ${innerR} ${innerR} 0 1 1 ${radius} ${radius - innerR}
          Z
        `;
      } else {
        pathD = `
          M ${radius} ${radius - outerR}
          A ${outerR} ${outerR} 0 1 0 ${radius} ${radius + outerR}
          A ${outerR} ${outerR} 0 1 0 ${radius} ${radius - outerR}
          Z
        `;
      }
    } else {
      const p1 = polarToCartesian(radius, radius, outerR, startAngle);
      const p2 = polarToCartesian(radius, radius, outerR, endAngle);
      const largeArcFlag = sliceAngle > 180 ? 1 : 0;

      if (donut) {
        const p3 = polarToCartesian(radius, radius, innerR, endAngle);
        const p4 = polarToCartesian(radius, radius, innerR, startAngle);
        pathD = [
          `M ${p1.x} ${p1.y}`,
          `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${p2.x} ${p2.y}`,
          `L ${p3.x} ${p3.y}`,
          `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${p4.x} ${p4.y}`,
          'Z'
        ].join(' ');
      } else {
        pathD = [
          `M ${radius} ${radius}`,
          `L ${p1.x} ${p1.y}`,
          `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${p2.x} ${p2.y}`,
          'Z'
        ].join(' ');
      }
    }

    return {
      ...item,
      percentage,
      color,
      pathD,
      startAngle,
      endAngle,
      midAngle: startAngle + sliceAngle / 2
    };
  });

  const activeSlice = activeIdx !== null ? slices[activeIdx] : null;

  return (
    <div className="flex flex-col items-center w-full">
      {(title || subtitle) && (
        <div className="w-full text-left mb-2 px-1">
          {title && <h4 className="text-xs font-bold text-slate-800 leading-snug">{title}</h4>}
          {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
        </div>
      )}

      {/* SVG Canvas with center content */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible select-none transition-transform"
        >
          <g>
            {slices.map((slice, idx) => {
              const isHovered = activeIdx === idx;
              return (
                <path
                  key={idx}
                  d={slice.pathD}
                  fill={slice.color}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  className="transition-all duration-200 cursor-pointer"
                  style={{
                    filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))' : 'none',
                    transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                    transformOrigin: `${radius}px ${radius}px`,
                    opacity: activeIdx !== null && !isHovered ? 0.6 : 1
                  }}
                  onMouseEnter={() => interactive && setActiveIdx(idx)}
                  onMouseLeave={() => interactive && setActiveIdx(null)}
                  onClick={() => interactive && setActiveIdx(activeIdx === idx ? null : idx)}
                />
              );
            })}
          </g>
        </svg>

        {/* Center Donut Label / Dynamic Active Tooltip */}
        {donut && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4"
            style={{
              width: innerR * 2,
              height: innerR * 2,
              margin: 'auto'
            }}
          >
            {activeSlice ? (
              <div className="animate-fade-in flex flex-col items-center justify-center leading-tight">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[90px]">
                  {activeSlice.label}
                </span>
                <span className="text-xs font-extrabold text-slate-900 mt-0.5">
                  {activeSlice.formattedValue || activeSlice.value}
                </span>
                <span
                  className="text-[10px] font-black px-1.5 py-0.2 rounded-full mt-0.5 text-white shadow-2xs"
                  style={{ backgroundColor: activeSlice.color }}
                >
                  {activeSlice.percentage}%
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center leading-tight">
                {centerLabel && (
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate max-w-[95px]">
                    {centerLabel}
                  </span>
                )}
                {centerValue ? (
                  <span className="text-xs sm:text-sm font-black text-slate-800 mt-0.5">
                    {centerValue}
                  </span>
                ) : (
                  <span className="text-xs sm:text-sm font-black text-slate-800 mt-0.5">
                    {total}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Legend with touch-friendly pills */}
      {showLegend && (
        <div className="w-full mt-3 flex flex-wrap items-center justify-center gap-1.5 px-1">
          {slices.map((slice, idx) => {
            const isHovered = activeIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIdx(activeIdx === idx ? null : idx)}
                onMouseEnter={() => interactive && setActiveIdx(idx)}
                onMouseLeave={() => interactive && setActiveIdx(null)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                  isHovered
                    ? 'border-slate-400 bg-slate-100 shadow-xs scale-102 font-bold text-slate-900'
                    : 'border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="truncate max-w-[90px]">{slice.label}</span>
                <span className="font-bold text-slate-900">
                  {slice.percentage}%
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PieChart;
