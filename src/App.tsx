import { useEffect, useMemo, useState } from "react";
import { BookViewer } from "./components";
import { useManifest } from "./hooks";

function App() {
  const { data: manifest, error, loading } = useManifest();
  const [currentPage, setCurrentPage] = useState(1);

  const availablePages = useMemo(() => {
    if (!manifest) {
      return [] as number[];
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

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        Loading book manifest…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-red-300">
        {error}
      </div>
    );
  }

  if (!manifest) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        Manifest could not be loaded.
      </div>
    );
  }

  return (
    <div className="fixed inset-0">
      <BookViewer
        currentPage={currentPage}
        manifest={manifest}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default App;
