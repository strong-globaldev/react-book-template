const ASSET_BASE_URL = import.meta.env.BASE_URL;

export const getImagePath = (pageNumber: number): string => {
  return `${ASSET_BASE_URL}assets/page_${pageNumber}.jpg`;
};

export const isValidPage = (page: number, totalPages: number): boolean => {
  return page >= 1 && page <= totalPages;
};

export const getNextPage = (currentPage: number, totalPages: number): number => {
  return Math.min(currentPage + 1, totalPages);
};

export const getPreviousPage = (currentPage: number): number => {
  return Math.max(currentPage - 1, 1);
};
