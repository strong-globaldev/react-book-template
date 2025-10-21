import type { Manifest, ManifestHotspotPoint, ManifestPage } from "../types";

const ASSET_BASE_URL = import.meta.env.BASE_URL;

export interface NormalizedManifestPage extends ManifestPage {
  pageNumber: number;
  id: string;
}

export const normalizeManifestPages = (
  manifest: Manifest
): NormalizedManifestPage[] => {
  return Object.entries(manifest.page_groups)
    .map(([key, page]) => ({
      ...page,
      pageNumber: Number.parseInt(key, 10),
      id: key,
    }))
    .sort((left, right) => left.pageNumber - right.pageNumber);
};

export const getManifestPage = (
  manifest: Manifest | null,
  pageNumber: number
): NormalizedManifestPage | undefined => {
  if (!manifest) {
    return undefined;
  }

  const raw = manifest.page_groups[String(pageNumber)];
  if (!raw) {
    return undefined;
  }

  return {
    ...raw,
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

  if (points.length === 1) {
    return { x: points[0].dx, y: points[0].dy };
  }

  let twiceArea = 0;
  let centroidX = 0;
  let centroidY = 0;

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    const cross = current.dx * next.dy - next.dx * current.dy;

    twiceArea += cross;
    centroidX += (current.dx + next.dx) * cross;
    centroidY += (current.dy + next.dy) * cross;
  }

  if (twiceArea === 0) {
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
  }

  const area = twiceArea * 0.5;
  return {
    x: centroidX / (6 * area),
    y: centroidY / (6 * area),
  };
};
