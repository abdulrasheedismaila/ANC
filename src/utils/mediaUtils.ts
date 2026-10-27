/**
 * Media Utility functions for AFNAAN CARES Nurses & Caregiver
 * Handles smart URL parsing, sanitization, YouTube/Google Drive embedding,
 * and direct image uploads.
 */

export interface ParsedVideoInfo {
  isValid: boolean;
  platform: 'youtube' | 'googledrive' | 'direct' | 'unknown';
  videoId?: string;
  embedUrl: string;
  thumbnailUrl?: string;
  errorMessage?: string;
}

/**
 * Extracts a clean image URL from user input, handling:
 * - HTML snippet pasted from ImgBB / image hosters (e.g. <a href="..."><img src="..."/></a>)
 * - Markdown image syntax (![alt](url))
 * - URLs missing protocol (e.g. i.ibb.co/...)
 * - Excess whitespace and wrapping quotes
 */
export function extractCleanImageUrl(rawInput: string): string {
  if (!rawInput) return '';

  let cleaned = rawInput.trim();

  // 1. Detect HTML <img> tag with src
  const imgTagMatch = cleaned.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgTagMatch && imgTagMatch[1]) {
    return imgTagMatch[1].trim();
  }

  // 2. Detect <a> tag with href pointing to an image
  const aTagMatch = cleaned.match(/<a[^>]+href=["']([^"']+\.(?:jpg|jpeg|png|webp|gif|svg)[^"']*)["']/i);
  if (aTagMatch && aTagMatch[1]) {
    return aTagMatch[1].trim();
  }

  // 3. Detect markdown image syntax: ![alt](url)
  const mdMatch = cleaned.match(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/i);
  if (mdMatch && mdMatch[1]) {
    return mdMatch[1].trim();
  }

  // 4. Remove leading/trailing quotes
  cleaned = cleaned.replace(/^["']|["']$/g, '').trim();

  // 5. If it's a relative uploaded path, return as is
  if (cleaned.startsWith('/uploads/media/')) {
    return cleaned;
  }

  // 6. If it's a bare domain without protocol (e.g. i.ibb.co/...)
  if (/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/i.test(cleaned)) {
    return `https://${cleaned}`;
  }

  return cleaned;
}

/**
 * Parses and converts YouTube or Google Drive links to playable embed formats.
 */
export function parseVideoUrl(rawUrl: string): ParsedVideoInfo {
  if (!rawUrl || !rawUrl.trim()) {
    return {
      isValid: false,
      platform: 'unknown',
      embedUrl: '',
      errorMessage: 'Please provide a video link from YouTube or Google Drive.',
    };
  }

  const url = rawUrl.trim();

  // 1. Check YouTube
  // Standard: https://www.youtube.com/watch?v=dQw4w9WgXcQ
  // Shortened: https://youtu.be/dQw4w9WgXcQ
  // Shorts: https://www.youtube.com/shorts/dQw4w9WgXcQ
  // Embed: https://www.youtube.com/embed/dQw4w9WgXcQ
  const ytMatch =
    url.match(/(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      isValid: true,
      platform: 'youtube',
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  // 2. Check Google Drive
  // Share link: https://drive.google.com/file/d/1vA5W0mK9Z_xyz/view?usp=sharing
  // Open link: https://drive.google.com/open?id=1vA5W0mK9Z_xyz
  // UC link: https://drive.google.com/uc?id=1vA5W0mK9Z_xyz
  // Preview link: https://drive.google.com/file/d/1vA5W0mK9Z_xyz/preview
  const gDriveMatch =
    url.match(/drive\.google\.com\/(?:file\/d\/([a-zA-Z0-9_-]+)|open\?id=([a-zA-Z0-9_-]+)|uc\?id=([a-zA-Z0-9_-]+))/i);

  if (gDriveMatch) {
    const driveId = gDriveMatch[1] || gDriveMatch[2] || gDriveMatch[3];
    return {
      isValid: true,
      platform: 'googledrive',
      videoId: driveId,
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
      thumbnailUrl: '',
    };
  }

  // 3. Direct video file (mp4, webm, uploads)
  if (/\.(mp4|webm|ogg)($|\?)/i.test(url) || url.startsWith('/uploads/media/')) {
    return {
      isValid: true,
      platform: 'direct',
      embedUrl: url,
    };
  }

  // Unsupported or invalid video url
  return {
    isValid: false,
    platform: 'unknown',
    embedUrl: url,
    errorMessage:
      'Supported formats: YouTube (e.g. youtube.com/watch?v=... or youtu.be/...) or Google Drive (e.g. drive.google.com/file/d/.../view).',
  };
}
