import { useState } from "react";
import type { ClickableInteraction } from "../types/book.types";

interface ClickableZoneProps {
  interaction: ClickableInteraction;
}

const ClickableZone = ({ interaction }: ClickableZoneProps) => {
  const [showPopup, setShowPopup] = useState(false);

  const handleClick = () => {
    if (interaction.action === "popup") {
      setShowPopup(true);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // Handle backdrop click to close popup
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClosePopup();
    }
  };

  // Handle escape key to close popup
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClosePopup();
    }
  };

  return (
    <>
      {/* Clickable Zone */}
      <button
        onClick={handleClick}
        className="
          w-full h-full rounded-lg flex items-center justify-center
          transition-all duration-200 hover:scale-105
          bg-green-500 bg-opacity-20 hover:bg-opacity-40 
          border-2 border-green-500 border-dashed
          cursor-pointer
        "
        aria-label="Clickable area"
      >
        <div className="text-center">
          <div className="text-2xl mb-1 animate-bounce">👆</div>
          <span className="text-xs font-medium text-green-700">Click me!</span>
        </div>
      </button>

      {/* Popup Modal */}
      {showPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Interactive Message
              </h3>
              <button
                onClick={handleClosePopup}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close popup"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🎉</div>
                <p className="text-gray-700 text-base leading-relaxed">
                  {interaction.content}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleClosePopup}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Got it!
                </button>
              </div>

              {/* Hint text */}
              <p className="text-xs text-gray-500 text-center mt-2">
                Press Escape or click outside to close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClickableZone;
