import type { Manifest, ManifestHotspotPoint, ManifestPage } from "../types";

const ASSET_BASE_URL = import.meta.env.BASE_URL;

export interface NormalizedManifestPage extends ManifestPage {
  pageNumber: number;
  id: string;
}

const getPageCount = (manifest: Manifest): number => {
  if (typeof manifest.totalPages === "number" && manifest.totalPages > 0) {
    return manifest.totalPages;
  }

  return Object.keys(manifest.page_groups).length;
};

const inferPageImageFileName = (
  manifest: Manifest,
  pageNumber: number
): string => {
  const existingImage =
    manifest.page_groups[String(pageNumber)]?.pageImage ??
    Object.values(manifest.page_groups)[0]?.pageImage;

  if (!existingImage) {
    return `page_${pageNumber}.jpg`;
  }

  const match = existingImage.match(/^(.*?)(\d+)(\.[^.]+)$/);
  if (!match) {
    return `page_${pageNumber}.jpg`;
  }

  const [, prefix, digits, extension] = match;
  const requiresPadding = digits.startsWith("0");
  const width = digits.length;
  const formattedNumber = requiresPadding
    ? String(pageNumber).padStart(width, "0")
    : String(pageNumber);

  return `${prefix}${formattedNumber}${extension}`;
};

const resolveManifestPage = (
  manifest: Manifest,
  pageNumber: number
): ManifestPage => {
  const existing = manifest.page_groups[String(pageNumber)];
  if (existing) {
    return existing;
  }

  return {
    pageImage: inferPageImageFileName(manifest, pageNumber),
    hotspots: [],
  };
};

export const normalizeManifestPages = (
  manifest: Manifest
): NormalizedManifestPage[] => {
  const totalPages = getPageCount(manifest);

  return Array.from({ length: totalPages }, (_, index) => {
    const pageNumber = index + 1;
    const page = resolveManifestPage(manifest, pageNumber);

    return {
      ...page,
      pageNumber,
      id: String(pageNumber),
    };
  });
};

export const getManifestPage = (
  manifest: Manifest | null,
  pageNumber: number
): NormalizedManifestPage | undefined => {
  if (!manifest) {
    return undefined;
  }

  const totalPages = getPageCount(manifest);
  if (pageNumber < 1 || pageNumber > totalPages) {
    return undefined;
  }

  return {
    ...resolveManifestPage(manifest, pageNumber),
    pageNumber,
    id: String(pageNumber),
  };
};

export const getManifestAssetPath = (fileName: string): string => {
  return `${ASSET_BASE_URL}assets/${fileName}`;
};

export const pointsToSvgString = (
  points: ManifestHotspotPoint[]
): string => {
  return points.map((point) => `${point.dx},${point.dy}`).join(" ");
};

export const getHotspotCentroid = (
  points: ManifestHotspotPoint[]
): { x: number; y: number } | null => {
  if (points.length === 0) {
    return null;
  }

  const sum = points.reduce(
    (total, point) => ({
      x: total.x + point.dx,
      y: total.y + point.dy,
    }),
    { x: 0, y: 0 }
  );
  return {
    x: sum.x / points.length,
    y: sum.y / points.length,
  };
};
