export interface BookMetadata {
  bookId: string;
  title: string;
  author?: string;
  gradeLevel?: string;
  description?: string;
}

export interface InteractionPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AudioInteraction {
  id: string;
  type: "audio";
  position: InteractionPosition;
  audioFile: string;
  audioUrl?: string;
  label?: string;
  volume?: number;
  autoplay?: boolean;
}

export interface ClickableInteraction {
  id: string;
  type: "clickable";
  position: InteractionPosition;
  action: "popup";
  content: string;
}

export type Interaction = AudioInteraction | ClickableInteraction;

export interface BookPage {
  pageNumber: number;
  pageImage: string;
  backgroundColor?: string;
  interactions: Interaction[];
}

export interface BookConfiguration {
  bookMetadata: BookMetadata;
  totalPages: number;
  pages: BookPage[];
  assets: {
    audioFiles: string[];
    images?: string[];
  };
}
