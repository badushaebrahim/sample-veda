import React, { useState, useEffect } from "react";

export interface HistoricDataPoint {
  _id: string; // "YYYY-MM-DD"
  revenue: number;
  ordersCount: number;
}

export const HistoricChart: React.FC = () => {
  const [data, setData] = useState<HistoricDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchHistoricData = async () => {
      try {
        const res = await fetch("/api/metrics/historic");
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      } catch (e) {
        console.error("Failed to fetch historic metrics", e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistoricData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-64 bg-surface-container-low rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-xs font-bold text-cream-900/40 tracking-wider uppercase">Loading Graph...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-64 border border-dashed border-soft-sage/30 rounded-xl flex items-center justify-center bg-surface-container-low/30">
        <span className="text-xs font-bold text-cream-900/40 tracking-wider uppercase">No Revenue History</span>
      </div>
    );
  }

  // Calculate max values for dynamic scaling
  const maxRevenue = Math.max(...data.map(d => d.revenue), 100);
  
  return (
    <div className="w-full bg-card-surface border border-soft-sage/20 rounded-2xl p-6 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-bold text-primary font-serif uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-lg">monitoring</span>
          30-Day Historic Revenue Growth
        </h3>
        <p className="text-xs text-on-surface-variant mt-1">
          Aggregated verified sales performance from physical inventory checkouts.
        </p>
      </div>

      <div className="relative w-full h-56 mt-6 flex items-end justify-between gap-1 sm:gap-2 px-1">
        {data.map((point, idx) => {
          // Height percentage
          const heightPercent = Math.max((point.revenue / maxRevenue) * 100, 5); // min 5% height to be visible
          const isHovered = hoverIndex === idx;

          return (
            <div
              key={point._id}
              className="relative flex-1 group flex flex-col justify-end h-full"
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-primary-dark text-white text-[10px] px-2 py-1.5 rounded shadow-lg z-10 w-max pointer-events-none transition-opacity">
                  <div className="font-bold border-b border-white/20 pb-0.5 mb-0.5">{point._id}</div>
                  <div>₹{point.revenue.toFixed(2)} ({point.ordersCount} orders)</div>
                </div>
              )}
              
              {/* Bar */}
              <div
                className={`w-full rounded-t-sm transition-all duration-300 ease-out cursor-pointer ${
                  isHovered ? "bg-secondary" : "bg-secondary/40"
                }`}
                style={{ height: `${heightPercent}%` }}
              />
            </div>
          );
        })}
      </div>
      
      {/* X-axis simplified labels (Start and End date) */}
      <div className="flex justify-between items-center text-[10px] font-bold text-cream-900/40 uppercase tracking-widest border-t border-soft-sage/20 pt-2">
        <span>{data[0]._id}</span>
        <span>{data[data.length - 1]._id}</span>
      </div>
    </div>
  );
};
