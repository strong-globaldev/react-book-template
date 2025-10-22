import { useCallback, useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { AnimatePresence } from "framer-motion";
import type { Manifest, ManifestHotspot } from "../../types";
import {
  getManifestAssetPath,
  getManifestPage,
  normalizeManifestPages,
} from "../../utils";
import { PageCanvas } from "./PageCanvas";

interface BookViewerProps {
  currentPage: number;
  manifest: Manifest;
  onPageChange: (page: number) => void;
}

export function BookViewer({
  currentPage,
  manifest,
  onPageChange,
}: BookViewerProps) {
  const [selectedHotspot, setSelectedHotspot] =
    useState<ManifestHotspot | null>(null);
  const [showHotspots, setShowHotspots] = useState(true);
  const [visitedHotspotIds, setVisitedHotspotIds] = useState<Set<string>>(
    () => new Set()
  );

  const pages = useMemo(() => normalizeManifestPages(manifest), [manifest]);
  const pageNumbers = useMemo(
    () => pages.map((page) => page.pageNumber),
    [pages]
  );
  const activePage = useMemo(() => {
    return (
      getManifestPage(manifest, currentPage) ??
      getManifestPage(manifest, 1) ??
      null
    );
  }, [currentPage, manifest]);

  useEffect(() => {
    if (!activePage) {
      return;
    }

    const activeHotspotForPage = activePage.hotspots.find(
      (hotspot) => hotspot.id === selectedHotspot?.id
    );

    if (!activeHotspotForPage) {
      setSelectedHotspot(null);
    }
  }, [activePage, selectedHotspot]);

  useEffect(() => {
    if (!showHotspots && selectedHotspot) {
      setSelectedHotspot(null);
    }
  }, [showHotspots, selectedHotspot]);

  useEffect(() => {
    if (!activePage) {
      return;
    }

    if (currentPage !== activePage.pageNumber) {
      onPageChange(activePage.pageNumber);
    }
  }, [activePage, currentPage, onPageChange]);

  const handleSurfaceClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!activePage) {
        return;
      }

      const container = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - container.left;
      const relative = clickX / container.width;
      const index = pageNumbers.indexOf(activePage.pageNumber);

      if (relative <= 0.4 && index > 0) {
        onPageChange(pageNumbers[index - 1]);
      } else if (
        relative >= 0.6 &&
        index !== -1 &&
        index < pageNumbers.length - 1
      ) {
        onPageChange(pageNumbers[index + 1]);
      }
    },
    [activePage, onPageChange, pageNumbers]
  );

  const handleHotspotSelect = useCallback((hotspot: ManifestHotspot) => {
    setSelectedHotspot(hotspot);
    setVisitedHotspotIds((previous) => {
      if (previous.has(hotspot.id)) {
        return previous;
      }

      const next = new Set(previous);
      next.add(hotspot.id);
      return next;
    });
  }, []);

  const handleToggleHotspots = useCallback(() => {
    setShowHotspots((previous) => !previous);
  }, []);

  if (!activePage) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        No page data found in manifest.
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-black text-white">
      <div
        className="relative flex h-full flex-1 cursor-pointer items-center justify-center"
        onClick={handleSurfaceClick}
      >
        <AnimatePresence mode="wait">
          <PageCanvas
            key={activePage.id}
            alt={`Page ${activePage.pageNumber}`}
            hotspots={activePage.hotspots}
            imageSrc={getManifestAssetPath(activePage.pageImage)}
            pageNumber={activePage.pageNumber}
            onHotspotSelect={handleHotspotSelect}
            selectedHotspotId={selectedHotspot?.id ?? null}
            showHotspots={showHotspots}
            visitedHotspotIds={visitedHotspotIds}
            onHotspotToggle={handleToggleHotspots}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
