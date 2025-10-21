export interface ManifestSubtitle {
  id: string;
  srtFile: string;
  language: string;
  isDefault: boolean;
}

export interface ManifestAudioContent {
  id: string;
  audioFile: string;
  subtitles: ManifestSubtitle[] | null;
  language: string | null;
  isDefault: boolean;
}

export interface ManifestHotspotContent {
  id: string;
  sequence: number;
  startTime: number | null;
  type: string;
  content: ManifestAudioContent | null;
  autoPlay: boolean;
  duration: number;
}

export interface ManifestHotspotPoint {
  dx: number;
  dy: number;
}

export interface ManifestHotspot {
  id: string;
  avatar: {
    id: string | null;
    name: string;
    avatarImage: string | null;
  };
  numberOfUsers: number | null;
  contents: ManifestHotspotContent[];
  points: ManifestHotspotPoint[];
  sequence: number;
  isLeft: boolean;
  startTime: number | null;
  type: string | null;
  content: unknown;
  isHotspotRead: boolean;
}

export interface ManifestPage {
  pageImage: string;
  hotspots: ManifestHotspot[];
}

export interface Manifest {
  slug: string;
  totalPages: number;
  defaultAvatar: string | null;
  page_groups: Record<string, ManifestPage>;
  bookFormat: string;
  interactiveFormat: string;
  layoutFormat: string;
  fileFormat: string;
  isSinglePage: boolean;
  questions: unknown;
}
