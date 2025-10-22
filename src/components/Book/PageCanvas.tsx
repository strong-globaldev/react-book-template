import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ManifestHotspot } from "../../types";
import { HotspotPolygon } from "./HotspotPolygon";
import { HotspotToggleButton } from "./HotspotToggleButton";
import { PageIndicator } from "../UI";

interface PageCanvasProps {
  alt: string;
  hotspots: ManifestHotspot[];
  imageSrc: string;
  pageNumber: number;
  onHotspotSelect?: (hotspot: ManifestHotspot) => void;
  selectedHotspotId: string | null;
  showHotspots: boolean;
  visitedHotspotIds: ReadonlySet<string>;
  onHotspotToggle: () => void;
}

interface Dimensions {
  height: number;
  width: number;
}

export function PageCanvas({
  alt,
  hotspots,
  imageSrc,
  pageNumber,
  onHotspotSelect,
  selectedHotspotId,
  showHotspots,
  visitedHotspotIds,
  onHotspotToggle,
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
            {showHotspots
              ? hotspots.map((hotspot) => (
                  <HotspotPolygon
                    key={hotspot.id}
                    hotspot={hotspot}
                    isActive={selectedHotspotId === hotspot.id}
                    isVisited={visitedHotspotIds.has(hotspot.id)}
                    onSelect={onHotspotSelect}
                  />
                ))
              : null}
          </g>
          <foreignObject
            x={Math.max(dimensions.width - 500, 0)}
            y={Math.max(dimensions.height - 220, 0)}
            width={360}
            height={220}
            className="pointer-events-none"
          >
            <div className="flex h-full w-full items-end justify-end">
              <div
                className="pointer-events-auto"
                onClick={(event) => event.stopPropagation()}
              >
                <PageIndicator pageNumber={pageNumber} />
              </div>
            </div>
          </foreignObject>
          {hotspots.length > 0 ? (
            <foreignObject
              x={300}
              y={Math.max(dimensions.height - 400, 0)}
              width={260}
              height={260}
              className="pointer-events-none"
            >
              <div className="flex h-full w-full items-end">
                <div
                  className="pointer-events-auto pb-6 pl-6"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <HotspotToggleButton
                    isVisible={showHotspots}
                    onToggle={onHotspotToggle}
                  />
                </div>
              </div>
            </foreignObject>
          ) : null}
        </svg>
      ) : (
        <div className="text-white/60">Loading page…</div>
      )}
    </motion.div>
  );
}
