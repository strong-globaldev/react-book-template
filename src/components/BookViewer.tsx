import { useState, useEffect } from "react";
import type { BookConfiguration } from "../types/book.types";
import PageDisplay from "./PageDisplay";
import Navigation from "./Navigation";
import bookConfig from "../data/book-config.json";

const BookViewer = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [bookData, setBookData] = useState<BookConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookData = async () => {
      try {
        setBookData(bookConfig as BookConfiguration);
        setLoading(false);
      } catch {
        setError("Failed to load book configuration");
        setLoading(false);
      }
    };

    loadBookData();
  }, []);

  const handlePageChange = (newPage: number) => {
    if (!bookData) return;

    if (newPage >= 0 && newPage < bookData.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const nextPage = () => {
    handlePageChange(currentPage + 1);
  };

  const previousPage = () => {
    handlePageChange(currentPage - 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your interactive book...</p>
        </div>
      </div>
    );
  }

  if (error || !bookData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600">{error || "Book not found"}</p>
        </div>
      </div>
    );
  }

  const currentPageData = bookData.pages[currentPage];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Book Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">
            {bookData.bookMetadata.title}
          </h1>
          {bookData.bookMetadata.author && (
            <p className="text-gray-600">by {bookData.bookMetadata.author}</p>
          )}
        </div>
      </header>

      {/* Main Book Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <PageDisplay page={currentPageData} pageNumber={currentPage + 1} />

          <Navigation
            currentPage={currentPage}
            totalPages={bookData.totalPages}
            onNextPage={nextPage}
            onPreviousPage={previousPage}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
    </div>
  );
};

export default BookViewer;
