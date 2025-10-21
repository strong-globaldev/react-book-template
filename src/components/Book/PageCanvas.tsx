import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ManifestHotspot } from "../../types";
import { HotspotPolygon } from "./HotspotPolygon";

interface PageCanvasProps {
  alt: string;
  hotspots: ManifestHotspot[];
  imageSrc: string;
  onHotspotSelect?: (hotspot: ManifestHotspot) => void;
  selectedHotspotId: string | null;
}

interface Dimensions {
  height: number;
  width: number;
}

export function PageCanvas({
  alt,
  hotspots,
  imageSrc,
  onHotspotSelect,
  selectedHotspotId,
}: PageCanvasProps) {
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let active = true;
    const image = new window.Image();

    image.src = imageSrc;
    image.onload = () => {
      if (!active) {
        return;
      }

      setDimensions({
        height: image.naturalHeight * 1,
        width: image.naturalWidth * 1,
      });
    };

    image.onerror = () => {
      if (!active) {
        return;
      }

      setDimensions(null);
    };

    return () => {
      active = false;
    };
  }, [imageSrc]);
  console.log("dimensions: ", dimensions);
  return (
    <motion.div
      className="relative flex h-full w-full items-center justify-center"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {dimensions ? (
        <svg
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="max-h-full max-w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <title>{alt}</title>
          <image
            href={imageSrc}
            width={dimensions.width}
            height={dimensions.height}
            preserveAspectRatio="xMidYMid meet"
          />
          <g className="pointer-events-auto">
            {hotspots.map((hotspot) => (
              <HotspotPolygon
                key={hotspot.id}
                hotspot={hotspot}
                isActive={selectedHotspotId === hotspot.id}
                onSelect={onHotspotSelect}
              />
            ))}
          </g>
        </svg>
      ) : (
        <div className="text-white/60">Loading page…</div>
      )}
    </motion.div>
  );
}
