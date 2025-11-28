/**
 * Format price to Vietnamese currency
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('vi-VN')}đ`;
}

/**
 * Calculate discounted price
 */
export function calculateDiscountedPrice(price: number, discount?: number): number {
  if (!discount || discount <= 0) return price;
  return price * (1 - discount / 100);
}

/**
 * Format date to Vietnamese locale
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('vi-VN');
}

/**
 * Generate slug from string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}
