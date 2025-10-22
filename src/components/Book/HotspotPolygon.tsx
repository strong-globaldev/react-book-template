import { memo } from "react";
import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import type { ManifestHotspot } from "../../types";
import { getHotspotCentroid, pointsToSvgString } from "../../utils";

interface HotspotPolygonProps {
  hotspot: ManifestHotspot;
  isActive: boolean;
  isVisited: boolean;
  onSelect?: (hotspot: ManifestHotspot) => void;
}

export const HotspotPolygon = memo(function HotspotPolygon({
  hotspot,
  isActive,
  isVisited,
  onSelect,
}: HotspotPolygonProps) {
  const SHRINK_FACTOR = 1;
  const centroid = getHotspotCentroid(hotspot.points);
  const sanitizedHotspotId = hotspot.id.replace(/[^a-zA-Z0-9_-]/g, "");
  const gradientId = `hotspot-centroid-gradient-${
    sanitizedHotspotId || hotspot.sequence
  }`;
  const scaledPoints = centroid
    ? hotspot.points.map((point) => ({
        dx: centroid.x + (point.dx - centroid.x) * SHRINK_FACTOR,
        dy: centroid.y + (point.dy - centroid.y) * SHRINK_FACTOR,
      }))
    : hotspot.points;
  const points = pointsToSvgString(scaledPoints);
  const pulseAnimation = isActive
    ? { scale: [1, 1.55, 1.05], opacity: [0.65, 0.15, 0] }
    : { scale: [1, 1.28, 1.02], opacity: [0.38, 0.12, 0] };
  const pulseTransition = {
    duration: isActive ? 1.9 : 2.6,
    repeat: Infinity,
    repeatType: "loop",
    ease: "easeOut",
  } as const;
  const handleSelect = (
    event: MouseEvent<SVGPolygonElement | SVGCircleElement>
  ) => {
    event.stopPropagation();
    onSelect?.(hotspot);
  };

  return (
    <>
      <motion.polygon
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 0.5 : 0.25 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        points={points}
        className="cursor-pointer fill-transparent"
        onClick={handleSelect}
        whileHover={{ opacity: 0.6 }}
      />
      {centroid ? (
        <>
          <defs>
            <radialGradient
              id={gradientId}
              cx={centroid.x}
              cy={centroid.y}
              r={68}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#ffffff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.35" />
            </radialGradient>
          </defs>
          <motion.g
            className="cursor-pointer"
            onClick={handleSelect}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: isActive ? 1.08 : 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            whileHover={{ scale: isActive ? 1.12 : 1.05 }}
          >
            <circle
              cx={centroid.x}
              cy={centroid.y}
              r={50}
              fill={`url(#${gradientId})`}
              className="opacity-90"
            />
            <circle
              cx={centroid.x}
              cy={centroid.y}
              r={37.8}
              fill={isVisited ? "#465363" : "#7A2BEA"}
            />
            <circle
              cx={centroid.x}
              cy={centroid.y}
              r={43.26}
              fill="none"
              strokeWidth={10.92}
              className="stroke-white stroke-opacity-80"
            />
            <circle
              cx={centroid.x}
              cy={centroid.y}
              r={47.6}
              fill="none"
              strokeWidth={2.8}
              className="stroke-material-secondary stroke-opacity-60"
            />
            <motion.circle
              cx={centroid.x}
              cy={centroid.y}
              r={51.8}
              strokeWidth={5}
              className="fill-cyan-200/10 stroke-white/80 drop-shadow-[0_0_24px_rgba(191,219,254,0.55)]"
              initial={{ scale: 1, opacity: 0 }}
              animate={pulseAnimation}
              transition={pulseTransition}
              pointerEvents="none"
            />
            <circle
              cx={centroid.x}
              cy={centroid.y}
              r={8.8}
              className="fill-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            />
          </motion.g>
        </>
      ) : null}
    </>
  );
});
