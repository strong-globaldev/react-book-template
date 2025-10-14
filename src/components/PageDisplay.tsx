import type { BookPage } from "../types/book.types";
import AudioButton from "./AudioButton";
import ClickableZone from "./ClickableZone";

interface PageDisplayProps {
  page: BookPage;
  pageNumber: number;
}

const PageDisplay = ({ page, pageNumber }: PageDisplayProps) => {
  return (
    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden mb-6">
      {/* Page Container */}
      <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
        {/* Page Image */}
        <img
          src={page.pageImage}
          alt={`Page ${pageNumber}`}
          className="w-full h-full object-contain bg-white"
          style={{ backgroundColor: page.backgroundColor || "#ffffff" }}
          onError={(e) => {
            // Handle image loading error
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            // Show placeholder
            const placeholder = target.nextElementSibling as HTMLElement;
            if (placeholder) {
              placeholder.style.display = "flex";
            }
          }}
        />

        {/* Placeholder for missing images */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300"
          style={{ display: "none" }}
        >
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📄</div>
            <p className="text-lg font-medium">Page {pageNumber}</p>
            <p className="text-sm">Image not found</p>
          </div>
        </div>

        {/* Interactive Elements Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {page.interactions.map((interaction) => (
            <div
              key={interaction.id}
              className="absolute pointer-events-auto"
              style={{
                left: `${(interaction.position.x / 1200) * 100}%`,
                top: `${(interaction.position.y / 1600) * 100}%`,
                width: `${(interaction.position.width / 1200) * 100}%`,
                height: `${(interaction.position.height / 1600) * 100}%`,
              }}
            >
              {interaction.type === "audio" && (
                <AudioButton interaction={interaction} />
              )}

              {interaction.type === "clickable" && (
                <ClickableZone interaction={interaction} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Page Number Badge */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-medium">
        Page {pageNumber}
      </div>
    </div>
  );
};

export default PageDisplay;
