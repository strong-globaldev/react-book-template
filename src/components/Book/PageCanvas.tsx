import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ManifestHotspot } from "../../types";
import { HotspotPolygon } from "./HotspotPolygon";
import { HotspotToggleButton } from "./HotspotToggleButton";
import { PageIndicator } from "../UI";
import { LeftIcon } from "../Icons";

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
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
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
  hasPreviousPage,
  hasNextPage,
  onPreviousPage,
  onNextPage,
}: PageCanvasProps) {
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const navigationButtonSize = 212.05;
  const navigationInset = 48;
  const navigationYOffset = dimensions
    ? Math.max(dimensions.height / 2 - navigationButtonSize / 2, 0)
    : 0;
  const navigationNextX = dimensions
    ? Math.max(dimensions.width - navigationInset - navigationButtonSize, 0)
    : 0;

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
          <g className="cursor-pointer">
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
            className="cursor-pointer"
          >
            <div className="flex h-full w-full items-end justify-end">
              <div
                className="cursor-pointer"
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
              className="cursor-pointer"
            >
              <div className="flex h-full w-full items-end">
                <div
                  className="cursor-pointer pb-6 pl-6"
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
          {hasPreviousPage ? (
            <foreignObject
              x={navigationInset}
              y={navigationYOffset}
              width={navigationButtonSize}
              height={navigationButtonSize}
              className="cursor-pointer"
            >
              <div className="flex h-full w-full items-center justify-center cursor-pointer">
                <button
                  type="button"
                  aria-label="Go to previous page"
                  className="cursor-pointer flex h-[212.05px] w-[212.05px] items-center justify-center rounded-full bg-[#0B70FE] text-white transition hover:bg-[#0a62e0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  onClick={(event) => {
                    event.stopPropagation();
                    onPreviousPage();
                  }}
                >
                  <LeftIcon className="h-32 w-32" aria-hidden="true" />
                </button>
              </div>
            </foreignObject>
          ) : null}
          {hasNextPage ? (
            <foreignObject
              x={navigationNextX}
              y={navigationYOffset}
              width={navigationButtonSize}
              height={navigationButtonSize}
              className="cursor-pointer"
            >
              <div className="flex h-full w-full items-center justify-center">
                <button
                  type="button"
                  aria-label="Go to next page"
                  className="cursor-pointer flex h-[212.05px] w-[212.05px] items-center justify-center rounded-full bg-[#0B70FE] text-white transition hover:bg-[#0a62e0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  onClick={(event) => {
                    event.stopPropagation();
                    onNextPage();
                  }}
                >
                  <LeftIcon
                    className="h-32 w-32 rotate-180"
                    aria-hidden="true"
                  />
                </button>
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
