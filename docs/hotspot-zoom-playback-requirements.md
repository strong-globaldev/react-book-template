# Hotspot Zoom & Audio Playback – React TypeScript Technical Requirements

## 1. Overview

- **Purpose:** Translate the existing Flutter hotspot experience into a React + TypeScript reader that delivers the same tap-to-zoom and audio playback behavior.
- **Primary outcome:** When a reader taps a hotspot polygon, the UI focuses on that region, highlights it, and plays its associated content sequence (starting with audio) while maintaining subtitle sync, avatar display, and autoplay compatibility.
- **Platforms:** Desktop and tablet web (mobile optional but strongly recommended). Touch and pointer inputs must be supported.

## 2. Functional Requirements

### 2.1 Hotspot Interaction

- Determine hotspot visibility based on reader mode (standard vs quiet) and user toggles.
- Perform polygon hit-testing for pointer/touch events; taps outside hotspots must cancel active playback.
- On hotspot activation:
  - Mark hotspot as `read`.
  - Highlight the polygon (stroke/fill different from inactive).
  - Center and zoom the viewport onto the hotspot.
  - Trigger playback of the first content item in the hotspot’s playlist.
- Support keyboard activation when hotspots are focusable (e.g., Enter/Space).

### 2.2 Zoom Animation

- Default zoom scale: `2.5×`, configurable via feature flag.
- Smooth transition (≈ 250–350 ms) using CSS transforms or a physics-based animation library.
- Maintain the hotspot’s centroid as the focal point; automatically pan if the polygon lies near edges.
- Allow zoom disabling via settings; when disabled, tapping still plays audio but viewport remains static.
- Provide `EndZoomAnimation` to return to `1.0×` scale with original alignment.

### 2.3 Content Playback

- Content types: `audio`, `video`, `question`, `popupText`, `rive`, `subtitle`, `unknown`.
- For React MVP, implement `audio` content; define extension points for others.
- Each hotspot playlist item has `startTimeMs`. Playback engine must respect delays between consecutive items.
- Autoplay support: automatically progress through hotspots and pages when autoplay enabled.
- Quiet mode: disables audio triggers; taps should be ignored with subtle feedback (e.g., tooltip or toast).

### 2.4 Subtitle Handling

- When audio content includes subtitle metadata, display timed text overlay synchronized with playback.
- Subtitle formats accepted: `.srt` (converted to cues internally) and optional `.vtt`.
- Allow toggling subtitles per user preference; default on when available.

### 2.5 State Management & Persistence

- Track `PlaybackState`, `ZoomState`, and `HotspotReadState` in a global store (Redux Toolkit, Zustand, or React Context + reducer).
- Persist read states per session; optional cross-session persistence via local storage.
- Support external commands (e.g., teacher controlling playback) via exposed APIs or events.

### 2.6 Error Handling

- Missing audio file: notify user (toast/snackbar) and log analytics event; skip to next content if autoplay on.
- Subtitle parsing failure: log warning, continue with audio-only playback.
- Network failure mid-playback: attempt retry (configurable count). If unsolved, stop playback gracefully.
- Playback conflicts (new hotspot tapped while audio active): stop current audio, reset zoom, start new sequence.

## 3. Architecture

### 3.1 Component/API Diagram

```
HotspotOverlay → HotspotController → PlaybackManager → AudioEngine
                  ↓                   ↑
                ZoomManager ←─────────┘
                  ↓
              ReaderViewport

AutoplayManager ↔ PlaybackManager
SubtitleManager ← AudioEngine position updates
```

### 3.2 Core Modules

| Module              | Responsibility                                                        | Notes                                                                 |
| ------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `HotspotOverlay`    | Renders polygons, manages pointer events, highlights state            | SVG or Canvas rendering; pointer events normalized across devices     |
| `HotspotController` | Validates tap, updates read-state, dispatches play/zoom actions       | Lives within reader container; interacts with global store            |
| `ZoomManager`       | Computes target transform, animates viewport, restores baseline       | Accepts `StartZoom` & `EndZoom` commands                              |
| `PlaybackManager`   | Central coordinator for playlist execution                            | Wraps `AudioEngine`, manages timers, integrates with subtitles & zoom |
| `AudioEngine`       | Thin wrapper over Howler.js or Web Audio API                          | Handles loading, playing, pausing, seeking, event listeners           |
| `SubtitleManager`   | Loads `.srt`, converts to cues, returns active captions for timestamp | Works with `PlaybackManager` tick updates                             |
| `AutoplayManager`   | Automates hotspot traversal, listens for playback completion          | Timer-based orchestration                                             |
| `AssetResolver`     | Builds URLs for assets depending on book slug, theme, preview state   | Handles auth headers/token injection                                  |

## 4. Data Contracts

### 4.1 Interfaces

```ts
type Point = { x: number; y: number };

type SubtitleTrack = {
  id: string;
  fileName: string;
  language: string;
  isDefault?: boolean;
};

type AudioTrack = {
  id: string;
  fileName: string;
  subtitles?: SubtitleTrack[];
  language?: string;
  isDefault?: boolean;
};

type HotspotContentType =
  | "audio"
  | "video"
  | "question"
  | "popupText"
  | "rive"
  | "subtitle"
  | "unknown";

type HotspotContent = {
  id: string;
  sequence: number;
  startTimeMs: number;
  type: HotspotContentType;
  autoPlay: boolean;
  durationMs?: number;
  payload: AudioTrack | unknown;
};

type Hotspot = {
  id: string;
  sequence: number;
  isLeft: boolean;
  isRead: boolean;
  avatar?: { name: string; image?: string };
  points: Point[];
  contents: HotspotContent[];
};

type ZoomState = {
  isZooming: boolean;
  scale: number;
  focalPoint: Point;
  activeSequence?: number;
};

type PlaybackState =
  | { status: "idle" }
  | {
      status: "playing" | "paused";
      hotspotSequence: number;
      contentIndex: number;
      audioUrl?: string;
      positionMs: number;
      durationMs: number;
      avatar?: { name: string; image?: string };
      subtitle?: string;
    };
```

### 4.2 Store Shape (example with Zustand)

```ts
type ReaderStore = {
  zoomState: ZoomState;
  playbackState: PlaybackState;
  setZoomState: (state: ZoomState) => void;
  setPlaybackState: (state: PlaybackState) => void;
  markHotspotRead: (hotspotId: string) => void;
  isQuietMode: boolean;
  setQuietMode: (value: boolean) => void;
  autoplayEnabled: boolean;
  setAutoplayEnabled: (value: boolean) => void;
};
```

## 5. Sequence Flows

### 5.1 Manual Tap Flow

1. `HotspotOverlay` receives tap coordinates.
2. Use ray-casting algorithm to find matching polygon (with tolerance for finger taps).
3. Abort if quiet mode or `hotspotsVisible=false`.
4. `HotspotController` updates read state and sets highlighted hotspot.
5. Calculate centroid:
   ```ts
   const centroid = polygon.reduce(
     (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
     { x: 0, y: 0 }
   );
   centroid.x /= polygon.length;
   centroid.y /= polygon.length;
   ```
6. Dispatch `StartZoom` with centroid and sequence.
7. Build playlist queue from hotspot contents (sorted by `sequence`).
8. Pass first item to `PlaybackManager.playContent`.
9. `PlaybackManager` resolves asset URL, loads subtitles, updates store to `playing`.
10. `AudioEngine` plays clip; emits `onTime` events every 250 ms to update `positionMs` and subtitle text.
11. When clip ends, `PlaybackManager` checks for remaining items:
    - If yes: schedule next item after its `startTimeMs`.
    - If no: call `EndZoom` after 300 ms and set playback to `idle`.

### 5.2 Autoplay Flow

1. Reader toggles autoplay on.
2. `AutoplayManager` computes ordered list of hotspots for current page:
   ```ts
   const orderedHotspots = hotspots
     .filter((h) => h.contents.length > 0)
     .sort((a, b) => a.sequence - b.sequence);
   ```
3. Trigger first hotspot as if tapped (reuse manual flow).
4. Listen to `PlaybackState`. When it returns to `idle`, advance to next hotspot.
5. After final hotspot on page:
   - Delay configurable interval (default 2 s).
   - Emit navigation event to move to next page.
6. Respect quiet mode: toggling quiet mode while autoplay is active immediately pauses autoplay and stops playback.

## 6. Zoom Implementation Notes

- Use container transform rather than scaling the bitmap alone; transform origin should be the hotspot centroid.
- Consider floating UI overlays (toolbars) that must remain anchored despite zoom.
- For accessibility: ensure screen readers receive descriptive feedback when zoom starts/ends.

## 7. Playback Implementation Notes

- Prefer Howler.js for cross-browser audio; fallback to native HTMLAudioElement if necessary.
- Use `AudioContext` for precise timing if manual crossfade or advanced effects planned.
- Ensure that simultaneous playback is prevented by stopping prior `Howl` instance before starting new one.
- Keep references to unsubscribers (e.g., `howl.on('end', ...)`) to avoid memory leaks when unmounting.

## 8. Subtitle Handling

- Convert `.srt` to WebVTT once during fetch or pipeline stage.
- Example parser strategy:
  ```ts
  type SubtitleCue = { startMs: number; endMs: number; text: string };
  const cues = parseSRT(content); // returns SubtitleCue[]
  const findCue = (ms: number) =>
    cues.find((cue) => cue.startMs <= ms && cue.endMs >= ms);
  ```
- Render cue in overlay with fade transitions; support multi-line text.
- Provide translation toggle (if multiple tracks) via dropdown.

## 9. Configuration & Feature Flags

- `enableAutoZoom` (default true).
- `defaultZoomScale` (float, default 2.5).
- `autoplayDelayMs` between hotspots and between pages.
- `subtitleDefaultOn` per locale.
- `maxAudioRetryCount` for transient errors.
- `analyticsEnabled` to toggle event emitting.

## 10. Accessibility

- Hotspots must be navigable via keyboard (tab order following reading sequence).
- Provide ARIA labels describing hotspot purpose (“Play narration for character X”).
- Support screen reader announcements on zoom start/end and playback start/stop.
- Ensure captions meet WCAG contrast requirements.

## 11. Analytics & Telemetry

- Events to capture:
  - `hotspot_tap` (hotspotId, page, mode, autoplayOn)
  - `hotspot_play_start`/`hotspot_play_complete`
  - `hotspot_play_error` (errorType)
  - `subtitle_toggle` (enabled)
  - `autoplay_toggle`
- Include session identifiers, user role (teacher, student), and book slug.

## 12. Testing Plan

- **Unit Tests**
  - Polygon hit-test accuracy with varied shapes.
  - Centroid calculation.
  - Playlist scheduling with `startTimeMs`.
  - Subtitle parser outputs for sample SRT.
- **Integration Tests** (React Testing Library)
  - Simulate tap → expect state changes (`zoomState`, `playbackState`).
  - Pause/resume flows.
  - Quiet mode prevents playback.
  - Autoplay stepping through multiple hotspots.
- **End-to-End Tests** (Playwright/Cypress)
  - User taps hotspot: zoom animation occurs & audio plays.
  - Autoplay scenario: page automatically advances.
  - Error case simulation (missing audio).
- **Performance Tests**
  - Ensure zoom animation remains above 55 fps on mid-tier hardware.
  - Audio start latency under 300 ms for cached assets.

## 13. Deployment & Monitoring

- Include feature flags via config service to allow gradual rollout.
- Use monitoring (e.g., Sentry) to capture playback/asset resolution errors.
- Collect Web Vitals (Largest Contentful Paint may be impacted by zoom transitions).

## 14. Migration Checklist

- Map existing Flutter hotspot manifests to the new TypeScript interfaces.
- Confirm asset naming conventions (audio & subtitle files) remain consistent.
- Provide resource loader capable of handling both packaged assets and remote CDN paths.
- Plan knowledge transfer sessions covering tooling (Howler.js, Zustand/Redux, testing frameworks).

## 15. Open Questions

- Should autoplay respect per-hotspot `autoPlay=false` flags (i.e., skip manual-only content)?
- Do we need offline caching for audio on devices with intermittent connectivity?
- How should multi-user sessions synchronize hotspot state (e.g., teacher/student live session)?
- Is there a requirement for analytics opt-out for privacy-sensitive deployments?

## 16. Deliverables

- `HotspotOverlay` React component with hit-testing and highlighting.
- `PlaybackManager` service with unit tests.
- `ZoomManager` hook/service integrated into `ReaderViewport`.
- Subtitle rendering component with SRT parser utilities.
- Autoplay controller with integration tests.
- Documentation outlining configuration, feature flags, and integration steps.
