export type ReaderMode = "standard" | "quiet";

export type HotspotContentType =
  | "audio"
  | "video"
  | "question"
  | "popupText"
  | "rive"
  | "subtitle"
  | "unknown";

export interface Point {
  x: number;
  y: number;
}

export interface HotspotPolygon {
  id: string;
  points: Point[];
}

export interface SubtitleTrack {
  id: string;
  fileName: string;
  language: string;
  isDefault?: boolean;
}

export interface AudioContentDescriptor {
  id: string;
  audioFile: string;
  subtitles?: SubtitleTrack[];
  language?: string | null;
  isDefault?: boolean;
}

export interface PlaylistItemBase {
  id: string;
  sequence: number;
  startTimeMs: number;
  autoPlay: boolean;
  durationMs?: number;
}

export interface AudioPlaylistItem extends PlaylistItemBase {
  type: "audio";
  content: AudioContentDescriptor;
}

export interface PlaceholderPlaylistItem extends PlaylistItemBase {
  type: Exclude<HotspotContentType, "audio">;
  content?: Record<string, unknown>;
}

export type PlaylistItem = AudioPlaylistItem | PlaceholderPlaylistItem;

export interface HotspotDefinition {
  id: string;
  polygon: HotspotPolygon;
  playlist: PlaylistItem[];
  sequence: number;
  isLeft: boolean;
  avatarId?: string | null;
}

export type HotspotReadState = Record<string, boolean>;

export type PlaybackPhase = "idle" | "loading" | "playing" | "paused" | "error";

export interface PlaybackState {
  phase: PlaybackPhase;
  activeHotspotId?: string;
  activeItemId?: string;
  mode: ReaderMode;
  queue: PlaylistItem[];
  error?: string;
}

export interface ZoomState {
  scale: number;
  targetScale: number;
  isAnimating: boolean;
  focalPoint?: Point;
}

export interface FeatureFlags {
  enableAutoZoom: boolean;
  defaultZoomScale: number;
  autoplayDelayMs: number;
  subtitleDefaultOn: boolean;
  maxAudioRetryCount: number;
  analyticsEnabled: boolean;
}

export interface ReaderSettings {
  subtitlesEnabled: boolean;
  autoplayEnabled: boolean;
}

export interface ReaderStoreState {
  playback: PlaybackState;
  zoom: ZoomState;
  readState: HotspotReadState;
  featureFlags: FeatureFlags;
  settings: ReaderSettings;
}

export interface PlaybackPhaseUpdate {
  phase: PlaybackPhase;
  activeHotspotId?: string;
  activeItemId?: string;
  queue?: PlaylistItem[];
  error?: string;
}

export type ExternalPlaybackCommand =
  | { type: "PLAY_HOTSPOT"; hotspotId: string }
  | { type: "PAUSE_PLAYBACK" }
  | { type: "RESUME_PLAYBACK" }
  | { type: "STOP_PLAYBACK" }
  | { type: "GOTO_HOTSPOT"; hotspotId: string }
  | { type: "SET_MODE"; mode: ReaderMode };

export type ReaderStoreAction =
  | { type: "playback/setMode"; mode: ReaderMode }
  | ({ type: "playback/setPhase" } & PlaybackPhaseUpdate)
  | { type: "playback/clear" }
  | { type: "zoom/setTarget"; payload: Partial<ZoomState> }
  | { type: "zoom/endAnimation"; scale?: number }
  | { type: "hotspot/markRead"; hotspotId: string }
  | { type: "hotspot/resetReads" }
  | { type: "settings/toggleSubtitles"; enabled?: boolean }
  | { type: "settings/toggleAutoplay"; enabled?: boolean }
  | { type: "featureFlags/patch"; payload: Partial<FeatureFlags> };
