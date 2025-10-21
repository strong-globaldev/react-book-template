import { useState, useEffect, useCallback, useRef } from "react";

import type {
  Point,
  Hotspot,
  Manifest,
  HotspotIconProps,
} from "./types/hotspot";
const RESOLUTION_SCALE_MAP: Array<{
  width: number;
  height: number;
  scale: number;
}> = [
  { width: 2048, height: 1536, scale: 1 },
  { width: 2732, height: 2048, scale: 1 },
  { width: 1280, height: 800, scale: 1 },
  { width: 2800, height: 1840, scale: 1 },
  { width: 2560, height: 1600, scale: 1 },
  { width: 3456, height: 2234, scale: 1 },
  { width: 1920, height: 1080, scale: 1 },
  { width: 2560, height: 1440, scale: 1 },
  { width: 3840, height: 2160, scale: 1 },
];
const DEFAULT_SCALE = 1;

const calculateCenterPoint = (points: Point[]): Point => {
  if (points.length === 0) return { dx: 0, dy: 0 };

  const sumDx = points.reduce((sum, p) => sum + p.dx, 0);
  const sumDy = points.reduce((sum, p) => sum + p.dy, 0);

  return {
    dx: sumDx / points.length,
    dy: sumDy / points.length,
  };
};

// Hotspot Icon Component - displays pulse effect at center
const HotspotIcon = ({ center, isActive, onClick }: HotspotIconProps) => {
  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      {isActive && (
        <>
          <circle
            cx={center.dx}
            cy={center.dy}
            r="50"
            fill="rgba(255, 200, 0, 0.1)"
            style={{
              animation: "pulse 2s infinite",
            }}
          />
          <circle
            cx={center.dx}
            cy={center.dy}
            r="40"
            fill="rgba(255, 200, 0, 0.2)"
          />
        </>
      )}

      {/* Center icon circle */}
      <circle
        cx={center.dx}
        cy={center.dy}
        r="30"
        fill="rgb(255, 200, 0)"
        stroke="rgb(255, 150, 0)"
        strokeWidth="2"
        style={{
          transition: "all 0.2s ease",
          filter: isActive
            ? "drop-shadow(0 0 8px rgba(255, 200, 0, 0.8))"
            : "none",
        }}
      />
    </g>
  );
};

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [imageScale, setImageScale] = useState(DEFAULT_SCALE);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [activeHotspotIndex, setActiveHotspotIndex] = useState<number | null>(
    null
  );
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [imagePosition, setImagePosition] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>({ x: 0, y: 0, width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const totalPages = 22;

  const [hotspotsVisible, setHotspotsVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateImagePosition = useCallback(() => {
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      setImagePosition({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
      console.log("Image position updated:", {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
    }
  }, []);

  useEffect(() => {
    const fetchManifest = async () => {
      try {
        const response = await fetch("/assets/manifest.json");
        const data = await response.json();
        setManifest(data);
      } catch (error) {
        console.error("Failed to load manifest:", error);
      }
    };

    fetchManifest();
  }, []);

  // const getPolygonPoints = (points: Point[]): string => {
  //   return points.map((p) => `${p.dx},${p.dy}`).join(" ");
  // };

  const currentPageData = manifest?.page_groups[currentPage.toString()];
  const hotspots = currentPageData?.hotspots || [];

  const handleNavigation = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const containerWidth = rect.width;
    const clickPosition = clickX / containerWidth;

    if (clickPosition <= 0.4) {
      if (currentPage > 1) {
        setCurrentPage((page) => page - 1);
      }
    } else if (clickPosition >= 0.6) {
      if (currentPage < totalPages) {
        setCurrentPage((page) => page + 1);
      }
    }
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setCurrentPage((page) => Math.max(1, page - 1));
      } else if (event.key === "ArrowRight") {
        setCurrentPage((page) => Math.min(totalPages, page + 1));
      }
    },
    [totalPages]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const calculateScaleForResolution = useCallback(
    (width: number, height: number) => {
      let bestMatch = DEFAULT_SCALE;
      let smallestDelta = Number.POSITIVE_INFINITY;

      for (const entry of RESOLUTION_SCALE_MAP) {
        const delta =
          Math.abs(entry.width - width) + Math.abs(entry.height - height);
        if (delta < smallestDelta) {
          smallestDelta = delta;
          bestMatch = entry.scale;
        }
      }

      return bestMatch;
    },
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const applyScale = () => {
      const { innerWidth, innerHeight } = window;
      const nextScale = calculateScaleForResolution(innerWidth, innerHeight);

      setImageScale((currentScale) =>
        currentScale !== nextScale ? nextScale : currentScale
      );
    };

    applyScale();
    window.addEventListener("resize", applyScale);

    return () => {
      window.removeEventListener("resize", applyScale);
    };
  }, [calculateScaleForResolution]);

  useEffect(() => {
    if (imageRef.current) {
      updateImagePosition();
    }
    window.addEventListener("resize", updateImagePosition);
    return () => window.removeEventListener("resize", updateImagePosition);
  }, [updateImagePosition]);

  useEffect(() => {
    updateImagePosition();
  }, [currentPage, updateImagePosition]);

  const handleHotspotClick = (index: number, hotspot: Hotspot) => {
    setActiveHotspotIndex(index);

    // Get audio file if available
    const audioContent = hotspot.contents.find((c) => c.type === "audio");
    if (audioContent?.content?.audioFile) {
      console.log(`Playing audio: ${audioContent.content.audioFile}`);
      const audio = new Audio(`/assets/${audioContent.content.audioFile}`);
      audio.play().catch((err) => console.error("Audio playback error:", err));
    }

    // Reset active state after animation
    setTimeout(() => setActiveHotspotIndex(null), 1500);
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <div
        className="relative w-full h-full cursor-pointer flex items-center justify-center"
        onClick={handleNavigation}
      >
        <img
          ref={imageRef}
          src={`/assets/page_${currentPage}.jpg`}
          alt={`Page ${currentPage}`}
          className="max-w-full max-h-full object-contain block"
          style={{
            width: "auto",
            height: "auto",
            transform: `scale(${imageScale})`,
            transformOrigin: "center center",
          }}
          onLoad={(e) => {
            if (e.target instanceof HTMLImageElement) {
              setImageDimensions({
                width: e.target.naturalWidth,
                height: e.target.naturalHeight,
              });
              // Update position after image loads
              setTimeout(() => updateImagePosition(), 0);
            }
          }}
        />

        {manifest &&
          imageDimensions &&
          imagePosition.width > 0 &&
          hotspotsVisible && (
            <svg
              className="absolute pointer-events-none"
              style={{
                pointerEvents: "auto",
                position: "fixed",
                left: `${imagePosition.x}px`,
                top: `${imagePosition.y}px`,
                width: `${imagePosition.width}px`,
                height: `${imagePosition.height}px`,
                zIndex: 10,
              }}
              viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Hotspot polygons - Area around the hotspot */}
              {/* {hotspots.map((hotspot, index) => (
              <g key={`hotspot-group-${index}`}>
                <polygon
                  key={`polygon-${index}`}
                  points={getPolygonPoints(hotspot.points)}
                  fill="rgba(0, 0, 0, 0)"
                  stroke="rgba(100, 200, 255, 0.5)"
                  strokeWidth="2"
                  style={{
                    cursor: "pointer",
                    pointerEvents: "auto",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHotspotClick(index, hotspot);
                  }}
                />
              </g>
            ))} */}

              {hotspots.map((hotspot, index) => {
                const center = calculateCenterPoint(hotspot.points);
                console.log(`Hotspot ${index} center (image coords):`, center);
                return (
                  <HotspotIcon
                    key={`icon-${index}`}
                    center={center}
                    isActive={activeHotspotIndex === index}
                    onClick={() => handleHotspotClick(index, hotspot)}
                  />
                );
              })}
            </svg>
          )}
      </div>
    </div>
  );
}

export default App;
