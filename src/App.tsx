import { useState, useEffect, useCallback } from "react";

const RESOLUTION_SCALE_MAP: Array<{
  width: number;
  height: number;
  scale: number;
}> = [
  // { width: 2048, height: 1536, scale: 0.4128 },
  // { width: 2732, height: 2048, scale: 0.5507 },
  // { width: 1280, height: 800, scale: 0.258 },
  // { width: 2800, height: 1840, scale: 0.5644 },
  // { width: 2560, height: 1600, scale: 0.516 },
  // { width: 3456, height: 2234, scale: 0.6966 },
  // { width: 1920, height: 1080, scale: 0.387 },
  // { width: 2560, height: 1440, scale: 0.516 },
  // { width: 3840, height: 2160, scale: 0.774 },

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

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [imageScale, setImageScale] = useState(DEFAULT_SCALE);
  const totalPages = 15;

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

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <div
        className="relative w-full h-full cursor-pointer flex items-center justify-center"
        onClick={handleNavigation}
      >
        <img
          src={`/src/assets/images/page-${currentPage}.jpg`}
          alt={`Page ${currentPage}`}
          className="max-w-full max-h-full object-contain block"
          style={{
            width: "auto",
            height: "auto",
            maxWidth: "100vw",
            maxHeight: "100vh",
            transform: `scale(${imageScale})`,
            transformOrigin: "center center",
          }}
        />

        <div className="absolute inset-0 flex">
          <div className="w-2/5 h-full opacity-0 hover:bg-white hover:opacity-10 transition-opacity duration-200" />
          <div className="w-1/5 h-full" />
          <div className="w-2/5 h-full opacity-0 hover:bg-white hover:opacity-10 transition-opacity duration-200" />
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
          {currentPage} / {totalPages}
        </div>
      </div>
    </div>
  );
}

export default App;
