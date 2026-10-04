// Normalises buy-goods product media.
// `products.product_images` can be: an array of URLs, a single URL string,
// a JSON-encoded array string, or objects ({ url }). Videos (mp4, mov...) are
// stored in the same column as images, so they are split here by extension.

const VIDEO_EXT = /\.(mp4|mov|m4v|webm|3gp|mkv)(\?|#|$)/i;

export const parseMediaList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(parseMediaList);
  if (typeof value === 'object') {
    const url = value.url || value.uri || value.src;
    return url ? [String(url)] : [];
  }
  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return [];
    if (s.startsWith('[')) {
      try {
        return parseMediaList(JSON.parse(s));
      } catch {
        // not JSON, treat as a plain URL below
      }
    }
    return [s];
  }
  return [];
};

export const isVideoUrl = (url) => VIDEO_EXT.test(url || '');

export const getProductMedia = (product) => {
  if (!product) return { all: [], images: [], videos: [] };
  const all = [
    ...new Set([
      ...parseMediaList(product.product_images),
      ...parseMediaList(product.images),
      ...parseMediaList(product.thumbnail),
      ...parseMediaList(product.image),
    ]),
  ];
  return {
    all,
    images: all.filter((u) => !isVideoUrl(u)),
    videos: all.filter(isVideoUrl),
  };
};

export const getProductCoverImage = (product) => getProductMedia(product).images[0] || null;
