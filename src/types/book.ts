export interface BookConfig {
  totalPages: number;
  currentPage: number;
  title?: string;
  author?: string;
}

export interface NavigationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface PageImageProps {
  pageNumber: number;
  alt?: string;
  className?: string;
}