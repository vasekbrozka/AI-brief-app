import { useId } from 'react';

// Cup body geometry shared with the `cup` icon in Icon.tsx.
const BODY = 'M5.4 6.4H16.2L15.1 15A2.3 2.3 0 0 1 12.9 17H8.7A2.3 2.3 0 0 1 6.5 15Z';
const TOP_Y = 6.4;
const BOTTOM_Y = 17;

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** The espresso cup that fills as the day's brief gets read (0…1). */
export function FillingCup({ fraction, size = 30 }: { fraction: number; size?: number }) {
  const clipId = useId();
  const f = Math.max(0, Math.min(1, fraction));
  const height = (BOTTOM_Y - TOP_Y) * f;
  const y = BOTTOM_Y - height;

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clipId}>
          <path d={BODY} />
        </clipPath>
      </defs>
      <rect
        className="cup-fill"
        x="4"
        y={y}
        width="14"
        height={height}
        clipPath={`url(#${clipId})`}
        fill="currentColor"
        opacity="0.35"
      />
      <path d={BODY} {...S} />
      <path d="M16.3 8h1.8a2.7 2.7 0 0 1 0 5.4h-1.4" {...S} />
      <path d="M4.2 19.6h15.6" {...S} />
    </svg>
  );
}
