import type { JSX } from 'react';

export type IconName =
  | 'sparkles'
  | 'stack'
  | 'sliders'
  | 'check'
  | 'chevronRight'
  | 'chevronLeft'
  | 'share'
  | 'globe'
  | 'external'
  | 'close'
  | 'sparkle'
  | 'cup';

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const PATHS: Record<IconName, JSX.Element> = {
  sparkles: (
    <>
      <path
        d="M12 3.4l1.9 5.1a1 1 0 00.6.6l5.1 1.9-5.1 1.9a1 1 0 00-.6.6L12 18.6l-1.9-5.1a1 1 0 00-.6-.6L4.4 11l5.1-1.9a1 1 0 00.6-.6z"
        fill="currentColor"
      />
      <path d="M18.7 3l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6z" fill="currentColor" opacity="0.8" />
    </>
  ),
  stack: (
    <>
      <rect x="3.5" y="9.2" width="17" height="11" rx="2.6" {...S} />
      <path d="M6 6.4h12" {...S} />
      <path d="M8 3.8h8" {...S} />
    </>
  ),
  sliders: (
    <>
      <path d="M4 8.5h9" {...S} />
      <path d="M17.5 8.5H20" {...S} />
      <circle cx="15" cy="8.5" r="2.2" {...S} />
      <path d="M4 15.5h4" {...S} />
      <path d="M12.5 15.5H20" {...S} />
      <circle cx="10" cy="15.5" r="2.2" {...S} />
    </>
  ),
  check: <path d="M5 12.5l4.2 4.2L19 7" {...S} strokeWidth={2} />,
  chevronRight: <path d="M9 5l7 7-7 7" {...S} strokeWidth={1.8} />,
  chevronLeft: <path d="M15 5l-7 7 7 7" {...S} strokeWidth={1.8} />,
  share: (
    <>
      <path d="M12 3v11.5" {...S} />
      <path d="M8.4 6.4L12 2.8l3.6 3.6" {...S} />
      <path d="M7 10.5H5.6A1.6 1.6 0 004 12.1v6.3A1.6 1.6 0 005.6 20h12.8a1.6 1.6 0 001.6-1.6v-6.3a1.6 1.6 0 00-1.6-1.6H17" {...S} />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.2" {...S} />
      <path d="M3.9 12h16.2" {...S} />
      <path d="M12 3.8c2.4 2.2 3.7 5.1 3.7 8.2S14.4 18 12 20.2C9.6 18 8.3 15.1 8.3 12S9.6 6 12 3.8z" {...S} />
    </>
  ),
  external: (
    <>
      <path d="M7.5 16.5L16 8" {...S} />
      <path d="M9.5 8H16v6.5" {...S} />
    </>
  ),
  close: (
    <>
      <path d="M6.5 6.5l11 11" {...S} />
      <path d="M17.5 6.5l-11 11" {...S} />
    </>
  ),
  sparkle: (
    <path
      d="M12 4l1.7 4.6a1 1 0 00.7.7L19 11l-4.6 1.7a1 1 0 00-.7.7L12 18l-1.7-4.6a1 1 0 00-.7-.7L5 11l4.6-1.7a1 1 0 00.7-.7z"
      fill="currentColor"
    />
  ),
  cup: (
    <>
      <path d="M6.4 8H15.1L14.2 14.5A2 2 0 0 1 12.3 16.3H9.2A2 2 0 0 1 7.3 14.5Z" {...S} />
      <path d="M15 9.4h1.5a2.3 2.3 0 0 1 0 4.6h-1.1" {...S} />
      <path d="M6 18.6h11" {...S} />
    </>
  ),
};

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
}

export function Icon({ name, className, size = 24 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
