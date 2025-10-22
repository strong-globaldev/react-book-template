import { memo, useCallback, useId } from "react";
import type { MouseEvent } from "react";

interface HotspotToggleButtonProps {
  isVisible: boolean;
  onToggle: () => void;
}

const SCALE = 1.8;
const BASE_RADIUS = 50;
const SECOND_LAYER_RADIUS = 37.8;
const WHITE_RING_RADIUS = 43.26;
const WHITE_RING_STROKE = 10.92;
const OUTLINE_RADIUS = 47.6;
const OUTLINE_STROKE = 2.8;
const INNER_RADIUS = 8.8;
const GRADIENT_RADIUS = 68;
const VIEWBOX_SIZE = 240;
const CENTER = VIEWBOX_SIZE / 2;

const scaled = (value: number) => value * SCALE;

export const HotspotToggleButton = memo(function HotspotToggleButton({
  isVisible,
  onToggle,
}: HotspotToggleButtonProps) {
  const rawId = useId();
  const gradientId = `hotspot-toggle-gradient-${rawId.replace(/:/g, "-")}`;

  const secondLayerColor = isVisible ? "#E63E5E" : "#465363";
  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onToggle();
    },
    [onToggle]
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isVisible}
      aria-label={isVisible ? "Hide hotspots" : "Show hotspots"}
      title={isVisible ? "Hide hotspots" : "Show hotspots"}
      className="group cursor-pointer ring-5 inline-flex h-50 w-50 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        className="pointer-events-none drop-shadow-[0_10px_25px_rgba(2,82,153,0.45)]"
        role="presentation"
      >
        <defs>
          <radialGradient
            id={gradientId}
            cx={CENTER}
            cy={CENTER}
            r={scaled(GRADIENT_RADIUS)}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.35" />
          </radialGradient>
        </defs>
        <g>
          <circle
            cx={CENTER}
            cy={CENTER}
            r={scaled(BASE_RADIUS)}
            fill={`url(#${gradientId})`}
            opacity={0.9}
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={scaled(SECOND_LAYER_RADIUS)}
            fill={secondLayerColor}
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={scaled(WHITE_RING_RADIUS)}
            fill="none"
            strokeWidth={scaled(WHITE_RING_STROKE)}
            className="stroke-white stroke-opacity-80"
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={scaled(OUTLINE_RADIUS)}
            fill="none"
            strokeWidth={scaled(OUTLINE_STROKE)}
            className="stroke-material-secondary stroke-opacity-60"
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={scaled(INNER_RADIUS)}
            className="fill-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          />
        </g>
      </svg>
    </button>
  );
});
