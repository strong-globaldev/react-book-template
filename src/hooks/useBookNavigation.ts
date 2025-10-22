import { useEffect, useMemo, useState } from "react";
import type { Manifest } from "../types";

interface UseBookNavigationResult {
  availablePages: number[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export const useBookNavigation = (
  manifest: Manifest | null
): UseBookNavigationResult => {
  const [currentPage, setCurrentPage] = useState(1);

  const availablePages = useMemo(() => {
    if (!manifest) {
      return [] as number[];
    }

    if (typeof manifest.totalPages === "number" && manifest.totalPages > 0) {
      return Array.from(
        { length: manifest.totalPages },
        (_, index) => index + 1
      );
    }

    return Object.keys(manifest.page_groups)
      .map((key) => Number.parseInt(key, 10))
      .filter(Number.isFinite)
      .sort((left, right) => left - right);
  }, [manifest]);
  console.log("availablePages", availablePages);

  useEffect(() => {
    if (!availablePages.length) {
      return;
    }

    setCurrentPage((previous) => {
      if (availablePages.includes(previous)) {
        return previous;
      }

      return availablePages[0];
    });
  }, [availablePages]);

  useEffect(() => {
    if (!availablePages.length) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setCurrentPage((page) => {
          const index = availablePages.indexOf(page);
          if (index <= 0) {
            return availablePages[0];
          }

          return availablePages[index - 1];
        });
      } else if (event.key === "ArrowRight") {
        setCurrentPage((page) => {
          const index = availablePages.indexOf(page);
          if (index === -1) {
            return availablePages[0];
          }

          return availablePages[Math.min(index + 1, availablePages.length - 1)];
        });
      } else if (event.key === "Home") {
        setCurrentPage(availablePages[0]);
      } else if (event.key === "End") {
        setCurrentPage(availablePages[availablePages.length - 1]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [availablePages]);

  return {
    availablePages,
    currentPage,
    setCurrentPage,
  };
};
