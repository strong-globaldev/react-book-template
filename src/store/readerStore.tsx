import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type {
  ExternalPlaybackCommand,
  FeatureFlags,
  ReaderSettings,
  ReaderStoreState,
  ReaderStoreAction,
} from "../types/reader";

type ReaderStoreContextValue = {
  state: ReaderStoreState;
  dispatch: Dispatch<ReaderStoreAction>;
};

const ReaderStoreContext = createContext<ReaderStoreContextValue | undefined>(
  undefined
);

const STORE_STORAGE_KEY = "reader-store";

const defaultFeatureFlags: FeatureFlags = {
  enableAutoZoom: true,
  defaultZoomScale: 2.5,
  autoplayDelayMs: 2000,
  subtitleDefaultOn: true,
  maxAudioRetryCount: 3,
  analyticsEnabled: true,
};

const defaultSettings: ReaderSettings = {
  subtitlesEnabled: defaultFeatureFlags.subtitleDefaultOn,
  autoplayEnabled: false,
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
  settings: defaultSettings,
};

const cloneDefaultState = (): ReaderStoreState => ({
  playback: { ...defaultState.playback },
  zoom: { ...defaultState.zoom },
  readState: { ...defaultState.readState },
  featureFlags: { ...defaultState.featureFlags },
  settings: { ...defaultState.settings },
});

const persistableKeys: Array<keyof ReaderStoreState> = [
  "readState",
  "settings",
];

type PersistedReaderState = Pick<ReaderStoreState, "readState" | "settings">;

const loadPersistedState = (): PersistedReaderState | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const raw = window.sessionStorage.getItem(STORE_STORAGE_KEY);
    if (!raw) {
      return undefined;
    }
    const parsed = JSON.parse(raw) as PersistedReaderState;
    if (!parsed || typeof parsed !== "object") {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
};

const persistState = (state: ReaderStoreState) => {
  if (typeof window === "undefined") {
    return;
  }

  const payload = persistableKeys.reduce<PersistedReaderState>(
    (acc, key) => ({
      ...acc,
      [key]: state[key],
    }),
    {} as PersistedReaderState
  );

  try {
    window.sessionStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Swallow storage errors during private browsing or quota issues.
  }
};

const createInitialState = (): ReaderStoreState => {
  const persisted = loadPersistedState();
  const base = cloneDefaultState();

  if (!persisted) {
    return base;
  }

  return {
    ...base,
    readState: persisted.readState ?? base.readState,
    settings: {
      ...base.settings,
      ...persisted.settings,
      subtitlesEnabled:
        persisted.settings?.subtitlesEnabled ?? base.settings.subtitlesEnabled,
    },
  };
};

const readerReducer = (
  state: ReaderStoreState,
  action: ReaderStoreAction
): ReaderStoreState => {
  switch (action.type) {
    case "playback/setMode":
      return {
        ...state,
        playback: {
          ...state.playback,
          mode: action.mode,
        },
      };

    case "playback/setPhase":
      return {
        ...state,
        playback: {
          ...state.playback,
          phase: action.phase,
          activeHotspotId: action.activeHotspotId,
          activeItemId: action.activeItemId,
          queue: action.queue ?? state.playback.queue,
          error: action.error,
        },
      };

    case "playback/clear":
      return {
        ...state,
        playback: {
          ...defaultState.playback,
          mode: state.playback.mode,
        },
      };

    case "zoom/setTarget":
      return {
        ...state,
        zoom: {
          ...state.zoom,
          ...action.payload,
        },
      };

    case "zoom/endAnimation":
      return {
        ...state,
        zoom: {
          ...state.zoom,
          isAnimating: false,
          scale: action.scale ?? state.zoom.scale,
          targetScale: action.scale ?? state.zoom.targetScale,
        },
      };

    case "hotspot/markRead":
      return {
        ...state,
        readState: {
          ...state.readState,
          [action.hotspotId]: true,
        },
      };

    case "hotspot/resetReads":
      return {
        ...state,
        readState: {},
      };

    case "settings/toggleSubtitles":
      return {
        ...state,
        settings: {
          ...state.settings,
          subtitlesEnabled: action.enabled ?? !state.settings.subtitlesEnabled,
        },
      };

    case "settings/toggleAutoplay":
      return {
        ...state,
        settings: {
          ...state.settings,
          autoplayEnabled: action.enabled ?? !state.settings.autoplayEnabled,
        },
      };

    case "featureFlags/patch":
      return {
        ...state,
        featureFlags: {
          ...state.featureFlags,
          ...action.payload,
        },
      };

    default:
      return state;
  }
};

export const ReaderProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(
    readerReducer,
    undefined,
    createInitialState
  );

  useEffect(() => {
    persistState(state);
  }, [state.settings, state.readState]);

  const value = useMemo<ReaderStoreContextValue>(
    () => ({ state, dispatch }),
    [state, dispatch]
  );

  return (
    <ReaderStoreContext.Provider value={value}>
      {children}
    </ReaderStoreContext.Provider>
  );
};

export const useReaderStore = () => {
  const context = useContext(ReaderStoreContext);
  if (!context) {
    throw new Error("useReaderStore must be used within a ReaderProvider");
  }
  return context;
};

export const useReaderState = () => useReaderStore().state;

export const useReaderDispatch = () => useReaderStore().dispatch;

const handleExternalPlaybackCommand = (
  command: ExternalPlaybackCommand,
  dispatch: Dispatch<ReaderStoreAction>
) => {
  switch (command.type) {
    case "SET_MODE":
      dispatch({ type: "playback/setMode", mode: command.mode });
      if (command.mode === "quiet") {
        dispatch({ type: "settings/toggleAutoplay", enabled: false });
      }
      return;

    case "PLAY_HOTSPOT":
      dispatch({
        type: "playback/setPhase",
        phase: "loading",
        activeHotspotId: command.hotspotId,
        activeItemId: undefined,
      });
      return;

    case "GOTO_HOTSPOT":
      dispatch({
        type: "hotspot/markRead",
        hotspotId: command.hotspotId,
      });
      dispatch({
        type: "playback/setPhase",
        phase: "idle",
        activeHotspotId: command.hotspotId,
        activeItemId: undefined,
      });
      return;

    case "PAUSE_PLAYBACK":
      dispatch({
        type: "playback/setPhase",
        phase: "paused",
      });
      return;

    case "RESUME_PLAYBACK":
      dispatch({
        type: "playback/setPhase",
        phase: "playing",
      });
      return;

    case "STOP_PLAYBACK":
      dispatch({ type: "playback/clear" });
      dispatch({ type: "zoom/endAnimation" });
      return;

    default:
      return;
  }
};

/**
 * Exposes a stable callback to bridge teacher-driven session commands or other
 * external control surfaces into the reader store.
 */
export const usePlaybackCommandDispatcher = () => {
  const dispatch = useReaderDispatch();

  return useMemo(
    () => ({
      dispatchCommand: (command: ExternalPlaybackCommand) =>
        handleExternalPlaybackCommand(command, dispatch),
    }),
    [dispatch]
  );
};
