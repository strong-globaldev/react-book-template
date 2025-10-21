import { useEffect, useState } from "react";
import type { Manifest } from "../types";

const MANIFEST_URL = `${import.meta.env.BASE_URL}assets/manifest.json`;

interface UseManifestState {
  data: Manifest | null;
  error: string | null;
  loading: boolean;
}

export const useManifest = (): UseManifestState => {
  const [state, setState] = useState<UseManifestState>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    const controller = new AbortController();

    const loadManifest = async () => {
      try {
        const response = await fetch(MANIFEST_URL, {
          cache: "no-cache",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch manifest: ${response.statusText}`);
        }

        const payload = (await response.json()) as Manifest;
        setState({
          data: payload,
          error: null,
          loading: false,
        });
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setState({
          data: null,
          error:
            error instanceof Error ? error.message : "Unable to load manifest",
          loading: false,
        });
      }
    };

    loadManifest();

    return () => controller.abort();
  }, []);

  return state;
};
