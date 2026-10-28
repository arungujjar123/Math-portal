// Old uploads were saved as direct S3 links, which the private bucket blocks
// with "AccessDenied". Route those through /api/file so they get a signed URL.
const S3_URL_PATTERN = /^https:\/\/[^/]+\.s3[.-][^/]*amazonaws\.com\/(slides\/[^?#]+)/;

export function toViewableUrl(url) {
  if (!url) return url;
  const match = url.match(S3_URL_PATTERN);
  if (match) {
    return `/api/file?key=${encodeURIComponent(decodeURIComponent(match[1]))}`;
  }
  return url;
}

export function toDownloadUrl(url, filename) {
  const viewable = toViewableUrl(url);
  if (viewable && viewable.startsWith('/api/file?') && filename) {
    return `${viewable}&download=${encodeURIComponent(filename)}`;
  }
  return viewable;
}
