import { useState, useEffect, useCallback } from "react";
import QuizHotspot from "./components/Hotspot/Quiz";

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 15;

  const handleNavigation = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const containerWidth = rect.width;
    const clickPosition = clickX / containerWidth;

    if (clickPosition <= 0.4) {
      // Left 40% - go to previous page
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } else if (clickPosition >= 0.6) {
      // Right 40% - go to next page
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    }
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else if (event.key === "ArrowRight" && currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    },
    [currentPage, totalPages]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

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
          }}
        />

        {/* Navigation zones - invisible overlays */}
        <div className="absolute inset-0 flex">
          <div className="w-2/5 h-full opacity-0 hover:bg-white hover:opacity-10 transition-opacity duration-200" />
          <div className="w-1/5 h-full" />
          <div className="w-2/5 h-full opacity-0 hover:bg-white hover:opacity-10 transition-opacity duration-200" />
        </div>

        {/* Page indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
          {currentPage} / {totalPages}
        </div>

        {/* Navigation hints */}
        {currentPage > 1 && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white opacity-30 text-2xl">
            ←
          </div>
        )}
        {currentPage < totalPages && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white opacity-30 text-2xl">
            →
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
