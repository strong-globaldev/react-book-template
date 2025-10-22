import { BookViewer } from "./components";
import { useBookNavigation, useManifest } from "./hooks";

function App() {
  const { data: manifest, error, loading } = useManifest();
  const { currentPage, setCurrentPage } = useBookNavigation(manifest);

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
