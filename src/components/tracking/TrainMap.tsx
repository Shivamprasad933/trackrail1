import { useEffect, useMemo, useRef, useState } from 'react';
import type { RouteStop, Station, Train, TrainLocation } from '@/types';
import { cn } from '@/lib/cn';

// A dependency-free interactive map. We project lat/lng into an SVG viewBox
// using an equirectangular projection scaled to the route's bounding box.
// This keeps the app runnable without a map API key while still showing the
// train moving along the route with station markers.

interface Projected {
  x: number;
  y: number;
}

function projectBounds(route: RouteStop[]) {
  const lats = route.map((r) => r.station.latitude);
  const lngs = route.map((r) => r.station.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const padLat = (maxLat - minLat) * 0.15 || 0.2;
  const padLng = (maxLng - minLng) * 0.15 || 0.2;
  return {
    minLat: minLat - padLat,
    maxLat: maxLat + padLat,
    minLng: minLng - padLng,
    maxLng: maxLng + padLng,
  latRange: maxLat - minLat + padLat * 2,
    lngRange: maxLng - minLng + padLng * 2,
  };
}

function project(lat: number, lng: number, b: ReturnType<typeof projectBounds>, w: number, h: number): Projected {
  const x = ((lng - b.minLng) / b.lngRange) * w;
  const y = h - ((lat - b.minLat) / b.latRange) * h;
  return { x, y };
}

// Interpolate position along the route polyline given a progress 0..1.
function pointAlongPath(points: Projected[], progress: number): Projected & { heading: number } {
  if (points.length === 0) return { x: 0, y: 0, heading: 0 };
  if (points.length === 1) return { ...points[0], heading: 0 };
  const totalLen = points.reduce((acc, p, i) => (i === 0 ? 0 : acc + dist(points[i - 1], p)), 0);
  let target = progress * totalLen;
  for (let i = 1; i < points.length; i++) {
    const segLen = dist(points[i - 1], points[i]);
    if (target <= segLen) {
      const t = target / segLen;
      return {
        x: points[i - 1].x + (points[i].x - points[i - 1].x) * t,
        y: points[i - 1].y + (points[i].y - points[i - 1].y) * t,
        heading: Math.atan2(points[i].y - points[i - 1].y, points[i].x - points[i - 1].x),
      };
    }
    target -= segLen;
  }
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  return { x: last.x, y: last.y, heading: Math.atan2(last.y - prev.y, last.x - prev.x) };
}

function dist(a: Projected, b: Projected) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function TrainMap({
  train,
  location,
  nextStationId,
  className,
}: {
  train: Train;
  location: TrainLocation | null;
  nextStationId: string | null;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 500 });
  const [animatedProgress, setAnimatedProgress] = useState(location?.routeProgress ?? 0);

  // Resize observer to keep the SVG responsive.
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Smoothly animate the marker between updates instead of teleporting.
  useEffect(() => {
    if (location == null) return;
    let raf = 0;
    const start = animatedProgress;
    const target = location.routeProgress;
    const t0 = performance.now();
    const dur = 900;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedProgress(start + (target - start) * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.routeProgress, location?.latitude, location?.longitude]);

  const bounds = useMemo(() => projectBounds(train.route), [train.route]);
  const stationPoints = useMemo(
    () => train.route.map((r) => project(r.station.latitude, r.station.longitude, bounds, size.w, size.h)),
    [train.route, bounds, size]
  );
  const pathD = useMemo(
    () => stationPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' '),
    [stationPoints]
  );

  const marker = useMemo(() => pointAlongPath(stationPoints, animatedProgress), [stationPoints, animatedProgress]);
  const angleDeg = (marker.heading * 180) / Math.PI;

  return (
    <div ref={containerRef} className={cn('relative h-full w-full overflow-hidden bg-primary-950', className)}>
      {/* Subtle grid backdrop */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="xMidYMid slice">
        {/* Route glow */}
        <path d={pathD} fill="none" stroke="#1d66f5" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.25" />
        {/* Route line */}
        <path d={pathD} fill="none" stroke="#59a6ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {/* Completed portion */}
        <path
          d={pathD}
          fill="none"
          stroke="#ff8512"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="1000"
          strokeDashoffset={1000 - animatedProgress * 1000}
          style={{ transition: 'stroke-dashoffset 0.9s ease-out' }}
        />

        {/* Station markers */}
        {train.route.map((stop, i) => {
          const p = stationPoints[i];
          const isOrigin = i === 0;
          const isDest = i === train.route.length - 1;
          const isNext = stop.stationId === nextStationId;
          return (
            <g key={stop.stationId}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isNext ? 7 : isOrigin || isDest ? 6 : 4}
                fill={isOrigin ? '#19b067' : isDest ? '#f04438' : isNext ? '#ff8512' : '#fff'}
                stroke={isNext ? '#ff8512' : '#1d66f5'}
                strokeWidth="2"
              />
              {isNext && (
                <circle cx={p.x} cy={p.y} r="7" fill="none" stroke="#ff8512" strokeWidth="2" opacity="0.6">
                  <animate attributeName="r" from="7" to="16" dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="1.6s" repeatCount="indefinite" />
                </circle>
              )}
              <text
                x={p.x}
                y={p.y - 12}
                textAnchor="middle"
                className="fill-white/90 text-[11px] font-semibold"
                style={{ paintOrder: 'stroke', stroke: 'rgba(2,6,23,0.7)', strokeWidth: 3 }}
              >
                {stop.station.name.length > 18 ? stop.station.code : stop.station.name}
              </text>
            </g>
          );
        })}

        {/* Train marker */}
        <g transform={`translate(${marker.x} ${marker.y}) rotate(${angleDeg})`}>
          <circle r="14" fill="#ff8512" opacity="0.25">
            <animate attributeName="r" from="14" to="22" dur="1.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.35" to="0" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <circle r="11" fill="#ff8512" stroke="white" strokeWidth="3" />
          <path d="M -5 -3 L 5 0 L -5 3 Z" fill="white" />
        </g>
      </svg>

      {location && (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-neutral-950/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
          Last updated {new Date(location.lastUpdated).toLocaleTimeString('en-IN')}
        </div>
      )}
      <div className="pointer-events-none absolute right-3 top-3 flex flex-col items-end gap-1">
        <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur">
          Live Map
        </span>
        {location && (
          <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-semibold text-white/80 backdrop-blur">
            {Math.round(location.speedKmph)} km/h
          </span>
        )}
      </div>
    </div>
  );
}
