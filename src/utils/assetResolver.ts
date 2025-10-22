import type { Manifest } from "../types/manifest";

type AssetCategory = "pageImage" | "audio" | "subtitle" | "avatar" | "generic";

export interface AssetResolverConfig {
  manifest?: Manifest;
  basePath?: string;
  cdnBaseUrl?: string;
  includeSlugFolder?: boolean;
  categoryOverrides?: Partial<Record<AssetCategory, string>>;
}

export interface AssetResolver {
  resolvePageImage: (fileName: string) => string;
  resolveAudioSource: (fileName: string) => string;
  resolveSubtitleSource: (fileName: string) => string;
  resolveAvatarSource: (fileName: string | null | undefined) => string | null;
  resolveGenericAsset: (fileName: string) => string;
}

const DEFAULT_BASE_PATH = "/assets";

const DEFAULT_CATEGORY_PATHS: Record<AssetCategory, string> = {
  pageImage: "",
  audio: "",
  subtitle: "",
  avatar: "avatars",
  generic: "",
};

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, "");

const encodeSegments = (value: string) =>
  value
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

const joinSegments = (...segments: Array<string | undefined>) => {
  const filtered = segments.filter((segment): segment is string =>
    Boolean(segment && segment.length)
  );

  if (!filtered.length) {
    return "";
  }

  return filtered.map(trimSlashes).map(encodeSegments).join("/");
};

const withBaseUrl = (path: string, cdnBaseUrl?: string) => {
  if (!path) {
    return path;
  }

  if (!cdnBaseUrl) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  const normalizedBase = cdnBaseUrl.endsWith("/")
    ? cdnBaseUrl.slice(0, -1)
    : cdnBaseUrl;

  return `${normalizedBase}/${joinSegments(path)}`;
};

const deriveBasePath = (config?: AssetResolverConfig) => {
  const manifestSlug = config?.manifest?.slug;
  const basePath = config?.basePath ?? DEFAULT_BASE_PATH;

  if (config?.includeSlugFolder && manifestSlug) {
    return joinSegments(basePath, manifestSlug);
  }

  return basePath;
};

const resolveCategory = (
  category: AssetCategory,
  fileName: string,
  config?: AssetResolverConfig
) => {
  const basePath = deriveBasePath(config);
  const categoryFolder =
    config?.categoryOverrides?.[category] ?? DEFAULT_CATEGORY_PATHS[category];
  const targetPath = joinSegments(basePath, categoryFolder, fileName);
  return withBaseUrl(targetPath, config?.cdnBaseUrl);
};

export const createAssetResolver = (
  config?: AssetResolverConfig
): AssetResolver => ({
  resolvePageImage: (fileName) =>
    resolveCategory("pageImage", fileName, config),
  resolveAudioSource: (fileName) => resolveCategory("audio", fileName, config),
  resolveSubtitleSource: (fileName) =>
    resolveCategory("subtitle", fileName, config),
  resolveAvatarSource: (fileName) =>
    fileName ? resolveCategory("avatar", fileName, config) : null,
  resolveGenericAsset: (fileName) =>
    resolveCategory("generic", fileName, config),
});
