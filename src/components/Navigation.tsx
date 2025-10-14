import { useEffect } from "react";

interface NavigationProps {
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onPageChange: (page: number) => void;
}

const Navigation = ({
  currentPage,
  totalPages,
  onNextPage,
  onPreviousPage,
  onPageChange,
}: NavigationProps) => {
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onPreviousPage();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onNextPage();
      } else if (event.key >= "1" && event.key <= "9") {
        const pageNumber = parseInt(event.key) - 1;
        if (pageNumber >= 0 && pageNumber < totalPages) {
          event.preventDefault();
          onPageChange(pageNumber);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentPage, totalPages, onNextPage, onPreviousPage, onPageChange]);

  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        {/* Previous Button */}
        <button
          onClick={onPreviousPage}
          disabled={!canGoPrevious}
          className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
            canGoPrevious
              ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </button>

        {/* Page Indicator */}
        <div className="flex items-center space-x-4">
          {/* Page Counter */}
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">
              {currentPage + 1} / {totalPages}
            </div>
            <div className="text-xs text-gray-500">Page</div>
          </div>

          {/* Page Dots */}
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => onPageChange(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentPage
                    ? "bg-blue-600"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={onNextPage}
          disabled={!canGoNext}
          className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
            canGoNext
              ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Next
          <svg
            className="w-5 h-5 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        Use ← → arrow keys or click to navigate • Press 1-{totalPages} for
        direct page access
      </div>
    </div>
  );
};

export default Navigation;
