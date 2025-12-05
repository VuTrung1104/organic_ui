/**
 * Format date to Vietnamese locale
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('vi-VN');
}

/**
 * Format price to Vietnamese currency
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('vi-VN')}đ`;
}
