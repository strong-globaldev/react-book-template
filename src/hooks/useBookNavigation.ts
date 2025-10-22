import { useEffect, useMemo, useRef, useState } from "react";
import type { Manifest } from "../types";

interface UseBookNavigationResult {
  availablePages: number[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export const useBookNavigation = (
  manifest: Manifest | null
): UseBookNavigationResult => {
  const NAVIGATION_COOLDOWN_MS = 500;
  const [currentPage, setCurrentPage] = useState(1);
  const lastNavigationRef = useRef(0);

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
      if (event.repeat) {
        return;
      }

      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      if (now - lastNavigationRef.current < NAVIGATION_COOLDOWN_MS) {
        return;
      }

      const guardNavigation = (update: (previousPage: number) => number) => {
        setCurrentPage((page) => {
          const nextPage = update(page);
          if (page === nextPage) {
            return page;
          }

          lastNavigationRef.current = now;
          return nextPage;
        });
      };

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        guardNavigation((page) => {
          const index = availablePages.indexOf(page);
          if (index <= 0) {
            return availablePages[0];
          }

          return availablePages[index - 1];
        });
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        guardNavigation((page) => {
          const index = availablePages.indexOf(page);
          if (index === -1) {
            return availablePages[0];
          }

          return availablePages[Math.min(index + 1, availablePages.length - 1)];
        });
      } else if (event.key === "Home") {
        event.preventDefault();
        guardNavigation(() => availablePages[0]);
      } else if (event.key === "End") {
        event.preventDefault();
        guardNavigation(() => availablePages[availablePages.length - 1]);
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
