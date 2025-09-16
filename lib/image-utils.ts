/**
 * Image optimization utilities
 */

export interface ImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

/**
 * Generates a blur data URL for image placeholders
 */
export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, width, height);
  }
  
  return canvas.toDataURL();
}

/**
 * Validates image source URL
 */
export function validateImageSrc(src: string): boolean {
  if (!src || typeof src !== 'string') {
    return false;
  }

  // Check for valid image extensions
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.svg'];
  const hasValidExtension = validExtensions.some(ext => 
    src.toLowerCase().endsWith(ext)
  );

  // Check for valid protocols
  const isValidProtocol = src.startsWith('/') || 
                         src.startsWith('https://') || 
                         src.startsWith('data:');

  return hasValidExtension && isValidProtocol;
}

/**
 * Default image configuration
 */
export const defaultImageConfig: Partial<ImageConfig> = {
  quality: 85,
  placeholder: 'blur',
  priority: false,
};
