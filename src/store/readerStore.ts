import { create, type StateCreator } from "zustand";
import {
  createJSONStorage,
  persist,
  type PersistOptions,
} from "zustand/middleware";
import type {
  ExternalPlaybackCommand,
  FeatureFlags,
  PlaybackPhaseUpdate,
  ReaderMode,
  ReaderStoreState,
  ZoomState,
} from "../types/reader";

const STORE_STORAGE_KEY = "reader-store";

type ReaderStore = ReaderStoreState & {
  setPlaybackMode: (mode: ReaderMode) => void;
  setPlaybackPhase: (payload: PlaybackPhaseUpdate) => void;
  clearPlayback: () => void;
  setZoomTarget: (payload: Partial<ZoomState>) => void;
  endZoomAnimation: (scale?: number) => void;
  markHotspotRead: (hotspotId: string) => void;
  resetHotspotReads: () => void;
  toggleSubtitles: (enabled?: boolean) => void;
  toggleAutoplay: (enabled?: boolean) => void;
  patchFeatureFlags: (payload: Partial<FeatureFlags>) => void;
  dispatchCommand: (command: ExternalPlaybackCommand) => void;
};

type ReaderStorePersistedState = Pick<ReaderStore, "readState" | "settings">;

const defaultFeatureFlags: FeatureFlags = {
  enableAutoZoom: true,
  defaultZoomScale: 2.5,
  autoplayDelayMs: 2000,
  subtitleDefaultOn: true,
  maxAudioRetryCount: 3,
  analyticsEnabled: true,
};

const defaultState: ReaderStoreState = {
  playback: {
    phase: "idle",
    activeHotspotId: undefined,
    activeItemId: undefined,
    mode: "standard",
    queue: [],
    error: undefined,
  },
  zoom: {
    scale: 1,
    targetScale: 1,
    isAnimating: false,
    focalPoint: undefined,
  },
  readState: {},
  featureFlags: defaultFeatureFlags,
  settings: {
    subtitlesEnabled: defaultFeatureFlags.subtitleDefaultOn,
    autoplayEnabled: false,
  },
};

const storeCreator: StateCreator<ReaderStore> = (set, get) => ({
  ...defaultState,
  setPlaybackMode: (mode: ReaderMode) =>
    set((state) => ({
      playback: {
        ...state.playback,
        mode,
      },
    })),
  setPlaybackPhase: (update: PlaybackPhaseUpdate) =>
    set((state) => ({
      playback: {
        ...state.playback,
        phase: update.phase,
        activeHotspotId: update.activeHotspotId,
        activeItemId: update.activeItemId,
        queue: update.queue ?? state.playback.queue,
        error: update.error,
      },
    })),
  clearPlayback: () =>
    set((state) => ({
      playback: {
        ...defaultState.playback,
        mode: state.playback.mode,
      },
    })),
  setZoomTarget: (update: Partial<ZoomState>) =>
    set((state) => ({
      zoom: {
        ...state.zoom,
        ...update,
        isAnimating: update.isAnimating ?? state.zoom.isAnimating,
      },
    })),
  endZoomAnimation: (scale?: number) =>
    set((state) => ({
      zoom: {
        ...state.zoom,
        isAnimating: false,
        scale: scale ?? state.zoom.scale,
        targetScale: scale ?? state.zoom.targetScale,
      },
    })),
  markHotspotRead: (hotspotId: string) =>
    set((state) => ({
      readState: {
        ...state.readState,
        [hotspotId]: true,
      },
    })),
  resetHotspotReads: () =>
    set(() => ({
      readState: {},
    })),
  toggleSubtitles: (enabled?: boolean) =>
    set((state) => ({
      settings: {
        ...state.settings,
        subtitlesEnabled: enabled ?? !state.settings.subtitlesEnabled,
      },
    })),
  toggleAutoplay: (enabled?: boolean) =>
    set((state) => ({
      settings: {
        ...state.settings,
        autoplayEnabled: enabled ?? !state.settings.autoplayEnabled,
      },
    })),
  patchFeatureFlags: (flags: Partial<FeatureFlags>) =>
    set((state) => {
      const featureFlags = { ...state.featureFlags, ...flags };
      const subtitlesEnabled =
        flags.subtitleDefaultOn ?? state.settings.subtitlesEnabled;
      return {
        featureFlags,
        settings: {
          ...state.settings,
          subtitlesEnabled,
        },
      };
    }),
  dispatchCommand: (command: ExternalPlaybackCommand) => {
    const store = get();

    switch (command.type) {
      case "SET_MODE":
        store.setPlaybackMode(command.mode);
        if (command.mode === "quiet") {
          store.toggleAutoplay(false);
        }
        return;
      case "PLAY_HOTSPOT":
        store.setPlaybackPhase({
          phase: "loading",
          activeHotspotId: command.hotspotId,
        });
        return;
      case "GOTO_HOTSPOT":
        store.markHotspotRead(command.hotspotId);
        store.setPlaybackPhase({
          phase: "idle",
          activeHotspotId: command.hotspotId,
        });
        return;
      case "PAUSE_PLAYBACK":
        store.setPlaybackPhase({ phase: "paused" });
        return;
      case "RESUME_PLAYBACK":
        store.setPlaybackPhase({ phase: "playing" });
        return;
      case "STOP_PLAYBACK":
        store.clearPlayback();
        store.endZoomAnimation();
        return;
      default:
        return;
    }
  },
});

const storage =
  typeof window === "undefined"
    ? undefined
    : createJSONStorage<ReaderStorePersistedState>(() => window.sessionStorage);

const persistOptions: PersistOptions<ReaderStore, ReaderStorePersistedState> = {
  name: STORE_STORAGE_KEY,
  storage,
  partialize: (state) => ({
    readState: state.readState,
    settings: state.settings,
  }),
};

export const useReaderStore = create<ReaderStore>()(
  persist(storeCreator, persistOptions)
);

export const usePlaybackCommandDispatcher = () =>
  useReaderStore((state) => state.dispatchCommand);

export const getReaderState = () => useReaderStore.getState();
