import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ManifestHotspot } from "../../types";
import { HotspotPolygon } from "./HotspotPolygon";
import { HotspotToggleButton } from "./HotspotToggleButton";
import { PageIndicator } from "../UI";
import { LeftIcon } from "../Icons";
import { getHotspotCentroid } from "../../utils";

const ZOOM_SCALE = 2.5;

const clamp = (value: number, min: number, max: number) => {
  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
};

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

interface ZoomState {
  height: number;
  hotspotId: string;
  width: number;
  x: number;
  y: number;
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
  const [zoomState, setZoomState] = useState<ZoomState | null>(null);
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

  useEffect(() => {
    if (!showHotspots) {
      setZoomState(null);
    }
  }, [showHotspots]);

  useEffect(() => {
    if (!selectedHotspotId) {
      setZoomState(null);
    }
  }, [selectedHotspotId]);

  const handleHotspotSelect = useCallback(
    (hotspot: ManifestHotspot) => {
      if (!dimensions) {
        onHotspotSelect?.(hotspot);
        return;
      }

      const centroid = getHotspotCentroid(hotspot.points);
      if (!centroid) {
        setZoomState((previous) =>
          previous?.hotspotId === hotspot.id ? null : previous
        );
        onHotspotSelect?.(hotspot);
        return;
      }

      setZoomState((previous) => {
        if (previous?.hotspotId === hotspot.id) {
          return null;
        }

        const zoomWidth = dimensions.width / ZOOM_SCALE;
        const zoomHeight = dimensions.height / ZOOM_SCALE;
        const maxX = Math.max(dimensions.width - zoomWidth, 0);
        const maxY = Math.max(dimensions.height - zoomHeight, 0);
        const x = clamp(centroid.x - zoomWidth / 2, 0, maxX);
        const y = clamp(centroid.y - zoomHeight / 2, 0, maxY);

        return {
          hotspotId: hotspot.id,
          width: zoomWidth,
          height: zoomHeight,
          x,
          y,
        };
      });

      onHotspotSelect?.(hotspot);
    },
    [dimensions, onHotspotSelect]
  );

  const viewBox = (() => {
    if (!dimensions) {
      return undefined;
    }

    if (!zoomState) {
      return `0 0 ${dimensions.width} ${dimensions.height}`;
    }

    return `${zoomState.x} ${zoomState.y} ${zoomState.width} ${zoomState.height}`;
  })();

  const spotlightCenter = zoomState
    ? {
        x: 50,
        y: 50,
      }
    : null;

  const spotlightStops =
    zoomState && dimensions
      ? (() => {
          const relativeWidth = zoomState.width / dimensions.width;
          const relativeHeight = zoomState.height / dimensions.height;
          const maxRelative = Math.max(relativeWidth, relativeHeight);

          const transparentStop = clamp(maxRelative * 60, 28, 44);
          const featherStart = clamp(transparentStop + 10, 38, 56);
          const featherMid = clamp(featherStart + 16, 54, 72);
          const featherEnd = clamp(featherMid + 14, 68, 90);

          return {
            featherEnd,
            featherMid,
            featherStart,
            transparentStop,
          };
        })()
      : null;

  const spotlightStyle: CSSProperties | undefined =
    spotlightCenter && spotlightStops
      ? {
          background: `radial-gradient(circle at ${spotlightCenter.x}% ${spotlightCenter.y}%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${spotlightStops.transparentStop}%, rgba(0,0,0,0.35) ${spotlightStops.featherStart}%, rgba(0,0,0,0.75) ${spotlightStops.featherMid}%, rgba(0,0,0,0.98) ${spotlightStops.featherEnd}%, rgba(0,0,0,1) 100%)`,
          transformOrigin: `${spotlightCenter.x}% ${spotlightCenter.y}%`,
        }
      : undefined;

  return (
    <motion.div
      className="relative flex h-full w-full items-center justify-center"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {dimensions ? (
        <>
          <svg
            viewBox={viewBox}
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
                      onSelect={handleHotspotSelect}
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
          <AnimatePresence>
            {zoomState ? (
              <motion.div
                key="spotlight-overlay"
                className="pointer-events-none absolute inset-0"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.03 }}
                transition={{ duration: 0.42, ease: "easeOut" }}
                style={
                  spotlightStyle ?? {
                    background:
                      "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.9) 100%)",
                  }
                }
              />
            ) : null}
          </AnimatePresence>
        </>
      ) : (
        <div className="text-white/60">Loading page…</div>
      )}
    </motion.div>
  );
}
