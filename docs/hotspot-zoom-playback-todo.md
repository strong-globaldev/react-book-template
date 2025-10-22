# Hotspot Zoom & Audio Playback – Development TODO

## Phase 1 – Foundations

- [x] Define hotspot, playlist, playback, zoom, and feature-flag interfaces in `src/types`.
- [x] Stand up shared store (e.g., Zustand/Redux Toolkit) with playback, zoom, hotspot-read, feature-flag slices plus session persistence helpers.
- [x] Implement `AssetResolver` in `src/utils` for audio/subtitle URL construction and future auth/CDN handling notes.
- [x] Document external control/API hooks for teacher-driven playback commands.

## Phase 2 – Hotspot Overlay Layer

- [ ] Build `HotspotOverlay` component with SVG polygons, focus outlines, and quiet-mode visibility toggles.
- [ ] Add polygon hit-testing utility and integrate pointer/touch/keyboard activation events.
- [ ] Surface activation/cancel callbacks and read-state highlighting to `HotspotController`.
- [ ] Implement quiet-mode ignored tap feedback (tooltip/toast stub).

## Phase 3 – Zoom Management

- [ ] Create `ZoomManager` hook/service to compute centroid-based transforms with configurable scale and animation timing.
- [ ] Dispatch zoom start/end actions to the global store and ensure toolbar overlays stay anchored.
- [ ] Provide `EndZoomAnimation` flow tied to playback completion and cancel events while respecting `enableAutoZoom`.
- [ ] Announce zoom transitions via ARIA live region helper for accessibility.

## Phase 4 – Playback & Subtitles

- [ ] Implement `PlaybackManager` orchestrating hotspot playlist sequencing, conflicts, and timers.
- [ ] Wrap Howler.js/HTMLAudio in `AudioEngine` with retry logic, quiet-mode guard, and cleanup of listeners.
- [ ] Build subtitle parsing utilities (SRT → cues) and `SubtitleManager` hook for active cue lookup.
- [ ] Render subtitle overlay component with toggle state, default-on config, and fade transitions.

## Phase 5 – Autoplay Orchestration

- [ ] Develop `AutoplayManager` to order hotspots, trigger playback progression, and handle page-advance delay.
- [ ] Sync autoplay store slice with quiet-mode toggles and manual interaction cancellation rules.
- [ ] Support optional per-hotspot skip flags or future configuration overrides.
- [ ] Emit autoplay-related analytics hooks (`autoplay_toggle`, `hotspot_play_complete` integration).

## Phase 6 – Error Handling & Telemetry

- [ ] Implement toast/snackbar notifications for missing assets, retries exhausted, and subtitle parse warnings.
- [ ] Add analytics utility for hotspot events, toggles, and error telemetry with session metadata.
- [ ] Ensure audio/subtitle listener cleanup on unmount to prevent leaks.
- [ ] Wire feature-flag configuration overrides and monitoring hooks (Sentry/Web Vitals stubs).

## Phase 7 – Testing & QA

- [ ] Write unit tests for hit-testing, centroid math, playlist scheduling, subtitle parsing, autoplay ordering.
- [ ] Add React Testing Library integration tests for tap → zoom → playback, quiet-mode suppression, conflict handling, autoplay flow.
- [ ] Plan Playwright smoke tests for zoom animation, autoplay navigation, and missing-audio path.
- [ ] Document manual QA checklist (desktop/tablet inputs, keyboard, screen reader, performance metrics).
