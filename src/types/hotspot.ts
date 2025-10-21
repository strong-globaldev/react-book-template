// Point coordinates in image space
export interface Point {
  dx: number;
  dy: number;
}

// Content item within a hotspot (audio, video, etc.)
export interface Content {
  id?: string;
  sequence?: number;
  startTime?: number;
  type: string;
  content?: {
    id?: string;
    audioFile?: string;
    subtitles?: Array<{
      id?: string;
      srtFile?: string;
      language?: string;
      isDefault?: boolean;
    }>;
    language?: string;
    isDefault?: boolean;
  };
  autoPlay?: boolean;
  duration?: number;
}

// Avatar associated with hotspot
export interface Avatar {
  id: string | null;
  name: string;
  avatarImage: string | null;
}

// Hotspot definition with polygon points and interactive content
export interface Hotspot {
  points: Point[];
  contents: Content[];
  avatar?: Avatar;
  numberOfUsers?: number | null;
  sequence?: number;
  isLeft?: boolean;
  id?: string;
  startTime?: number | null;
  type?: string | null;
  content?: unknown;
  isHotspotRead?: boolean;
}

// Page group containing page image and its hotspots
export interface PageGroup {
  pageImage: string;
  hotspots: Hotspot[];
}

// Complete manifest structure
export interface Manifest {
  slug: string;
  totalPages: number;
  defaultAvatar?: Avatar | null;
  page_groups: Record<string, PageGroup>;
}

// Props for HotspotIcon component
export interface HotspotIconProps {
  center: Point;
  isActive: boolean;
  onClick: () => void;
}
