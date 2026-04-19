import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

/**
 * WhatsApp Cloud API (Meta) — free tier, no cost per message.
 *
 * Setup (one-time, 5 minutes):
 *   1. Go to https://developers.facebook.com and create an app (type: Business)
 *   2. Add the WhatsApp product to the app
 *   3. Copy the temporary "Access Token" and "Phone Number ID" from the API setup page
 *   4. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_ID in .env
 *   5. Set WHATSAPP_BUSINESS_NUMBER to your business WhatsApp number (with country code, no +)
 *
 * For TEST mode (sandbox): add the customer phone as a recipient in the Meta console.
 * For PRODUCTION: verify your own phone number in Meta and use approved message templates.
 */
@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly token: string | undefined;
  private readonly phoneNumberId: string | undefined;
  private readonly businessNumber: string | undefined;
  private readonly apiVersion = 'v19.0';

  constructor(private config: ConfigService) {
    this.token = config.get<string>('WHATSAPP_TOKEN');
    this.phoneNumberId = config.get<string>('WHATSAPP_PHONE_ID');
    this.businessNumber = config.get<string>('BUSINESS_WHATSAPP')?.replace(/\D/g, '');
  }

  private get isConfigured(): boolean {
    return !!(this.token && this.phoneNumberId);
  }

  /** Send a plain-text WhatsApp message to a phone number (e.g. "254712345678") */
  async sendText(to: string, body: string): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn('WhatsApp not configured — skipping message. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_ID in .env');
      return;
    }

    const normalised = to.replace(/\D/g, '');
    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

    try {
      await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          to: normalised,
          type: 'text',
          text: { body },
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      this.logger.log(`WhatsApp message sent to ${normalised}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to send WhatsApp to ${normalised}: ${message}`);
    }
  }

  // ── Notification helpers ──────────────────────────────────────────────────

  /** Notify customer: order received */
  async notifyCustomerOrderReceived(params: {
    phone: string;
    name: string;
    referenceNumber: string;
    items: { productName: string; quantity: number }[];
    totalAmount: number;
  }): Promise<void> {
    const itemList = params.items
      .map((i) => `  • ${i.productName} × ${i.quantity}`)
      .join('\n');

    const body =
      `Hello ${params.name}! 🎉\n\n` +
      `Your order *${params.referenceNumber}* has been received.\n\n` +
      `*Items:*\n${itemList}\n\n` +
      `*Total:* KES ${(params.totalAmount / 100).toLocaleString()}\n\n` +
      `We'll confirm availability and contact you shortly.\n` +
      `Thank you for choosing Njiani Electricals! ⚡`;

    await this.sendText(params.phone, body);
  }

  /** Notify business: new order alert */
  async notifyBusinessNewOrder(params: {
    customerName: string;
    customerPhone: string;
    referenceNumber: string;
    channel: string;
    items: { productName: string; quantity: number }[];
    totalAmount: number;
  }): Promise<void> {
    if (!this.businessNumber) {
      this.logger.warn('BUSINESS_WHATSAPP not set — skipping business alert');
      return;
    }

    const itemList = params.items
      .map((i) => `  • ${i.productName} × ${i.quantity}`)
      .join('\n');

    const body =
      `🔔 *New Order Alert!*\n\n` +
      `*Reference:* ${params.referenceNumber}\n` +
      `*Customer:* ${params.customerName}\n` +
      `*Phone:* ${params.customerPhone}\n` +
      `*Channel:* ${params.channel}\n\n` +
      `*Items:*\n${itemList}\n\n` +
      `*Total:* KES ${(params.totalAmount / 100).toLocaleString()}\n\n` +
      `Log in to the admin panel to process this order.`;

    await this.sendText(this.businessNumber, body);
  }

  /** Notify customer: order status changed */
  async notifyCustomerStatusUpdate(params: {
    phone: string;
    name: string;
    referenceNumber: string;
    status: string;
  }): Promise<void> {
    const statusMessages: Record<string, string> = {
      CONFIRMED:  'Your order has been *confirmed* ✅ and is being prepared.',
      PROCESSING: 'Your order is currently being *processed* 🔧.',
      DELIVERED:  'Your order has been *delivered* 🚚. Thank you for your purchase!',
      CANCELLED:  'Your order has been *cancelled* ❌. Please contact us if you have questions.',
    };

    const statusMsg = statusMessages[params.status] ?? `Your order status has been updated to *${params.status}*.`;

    const body =
      `Hello ${params.name}! 📦\n\n` +
      `Update on order *${params.referenceNumber}*:\n\n` +
      `${statusMsg}\n\n` +
      `Njiani Electricals ⚡`;

    await this.sendText(params.phone, body);
  }
}
