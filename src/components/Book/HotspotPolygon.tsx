import { memo } from "react";
import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import type { ManifestHotspot } from "../../types";
import { getHotspotCentroid, pointsToSvgString } from "../../utils";

interface HotspotPolygonProps {
  hotspot: ManifestHotspot;
  isActive: boolean;
  onSelect?: (hotspot: ManifestHotspot) => void;
}

export const HotspotPolygon = memo(function HotspotPolygon({
  hotspot,
  isActive,
  onSelect,
}: HotspotPolygonProps) {
  const SHRINK_FACTOR = 1;
  const centroid = getHotspotCentroid(hotspot.points);
  const scaledPoints = centroid
    ? hotspot.points.map((point) => ({
        dx: centroid.x + (point.dx - centroid.x) * SHRINK_FACTOR,
        dy: centroid.y + (point.dy - centroid.y) * SHRINK_FACTOR,
      }))
    : hotspot.points;
  const points = pointsToSvgString(scaledPoints);
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
        className="cursor-pointer fill-cyan-400/20 stroke-cyan-400 stroke-[6px] drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]"
        onClick={handleSelect}
        whileHover={{ opacity: 0.6 }}
      />
      {centroid ? (
        <motion.circle
          cx={centroid.x}
          cy={centroid.y}
          r={isActive ? 36 : 28}
          className="cursor-pointer fill-cyan-400/70 stroke-white/90 stroke-[8px]"
          onClick={handleSelect}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: isActive ? 1.05 : 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      ) : null}
    </>
  );
});
