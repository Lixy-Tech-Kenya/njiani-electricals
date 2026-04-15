import { CartItem } from './types/order';

/**
 * Converts an integer KES cent value to a display string.
 * formatPrice(150000) → "KES 1,500"
 * formatPrice(99900) → "KES 999"
 */
export function formatPrice(cents: number): string {
  const whole = Math.round(cents / 100);
  return `KES ${whole.toLocaleString('en-KE')}`;
}

/**
 * Converts a string to a URL-safe kebab-case slug.
 * generateSlug("LED Ceiling Lights") → "led-ceiling-lights"
 * generateSlug("Sockets (Waterproof & Non-Waterproof)") → "sockets-waterproof-non-waterproof"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // remove special chars except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-')           // spaces → hyphens
    .replace(/-+/g, '-');           // collapse consecutive hyphens
}

/**
 * Builds a fully encoded wa.me deep link with a pre-filled message listing each item,
 * quantity, price, a total, and the customer's name.
 *
 * buildWhatsAppOrderUrl('+254700000000', cartItems, 'John Doe')
 */
export function buildWhatsAppOrderUrl(
  phone: string,
  items: CartItem[],
  customerName: string,
): string {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');

  const itemLines = items
    .map((item) => `• ${item.productName} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`)
    .join('\n');

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const message =
    `Hello Njiani Electricals! 👋\n\n` +
    `I'd like to place an order:\n\n` +
    `${itemLines}\n\n` +
    `*Total: ${formatPrice(total)}*\n\n` +
    `Customer: ${customerName}\n\n` +
    `Please confirm availability and delivery details. Thank you!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
