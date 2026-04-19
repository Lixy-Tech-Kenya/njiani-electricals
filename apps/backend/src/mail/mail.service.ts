import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { OrderEntity } from '../common/entities';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  /** Pre-format items so Handlebars doesn't need arithmetic */
  private formatItems(order: OrderEntity) {
    return (order.items ?? []).map(item => ({
      ...item,
      unitPriceFormatted: `KES ${(item.unitPrice / 100).toLocaleString()}`,
      subtotalFormatted: `KES ${((item.unitPrice * item.quantity) / 100).toLocaleString()}`,
    }));
  }

  private formatTotal(order: OrderEntity) {
    return `KES ${(order.totalAmount / 100).toLocaleString()}`;
  }

  /** On order creation: confirmation to customer + alert to business */
  async sendOrderAlerts(order: OrderEntity): Promise<void> {
    const businessEmail = this.configService.get<string>('BUSINESS_EMAIL');
    const items = this.formatItems(order);
    const totalAmount = this.formatTotal(order);

    // 1. Customer confirmation (only if they provided an email)
    if (order.customerEmail) {
      try {
        await this.mailerService.sendMail({
          to: order.customerEmail,
          subject: `Order Confirmation — ${order.referenceNumber}`,
          template: './order-confirmation',
          context: {
            customerName: order.customerName,
            referenceNumber: order.referenceNumber,
            items,
            totalAmount,
            channel: order.channel,
          },
        });
        this.logger.log(`Confirmation email sent to ${order.customerEmail}`);
      } catch (err) {
        this.logger.error(`Failed to send confirmation to customer: ${(err as Error).message}`);
      }
    }

    // 2. Business alert
    if (businessEmail) {
      try {
        await this.mailerService.sendMail({
          to: businessEmail,
          subject: `🔔 New Order — ${order.referenceNumber}`,
          template: './new-order-alert',
          context: {
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerEmail: order.customerEmail ?? '—',
            customerLocation: order.customerLocation ?? '—',
            referenceNumber: order.referenceNumber,
            channel: order.channel,
            notes: order.notes ?? '—',
            items,
            totalAmount,
          },
        });
        this.logger.log(`New-order alert sent to ${businessEmail}`);
      } catch (err) {
        this.logger.error(`Failed to send new-order alert: ${(err as Error).message}`);
      }
    }
  }

  /** On status update: notify customer */
  async sendStatusUpdate(order: OrderEntity): Promise<void> {
    if (!order.customerEmail) return;

    const statusLabels: Record<string, string> = {
      CONFIRMED:  'Confirmed ✅',
      PROCESSING: 'Processing 🔧',
      DELIVERED:  'Delivered 🚚',
      CANCELLED:  'Cancelled ❌',
    };

    const statusMessages: Record<string, string> = {
      CONFIRMED:  'Great news! Your order has been confirmed and is being prepared.',
      PROCESSING: 'Your order is currently being processed by our team.',
      DELIVERED:  'Your order has been delivered. We hope you enjoy your purchase!',
      CANCELLED:  'Unfortunately, your order has been cancelled. Please contact us if you have any questions.',
    };

    const statusLabel = statusLabels[order.status] ?? order.status;
    const statusMessage = statusMessages[order.status] ?? `Your order status has been updated to ${order.status}.`;

    try {
      await this.mailerService.sendMail({
        to: order.customerEmail,
        subject: `Order Update — ${order.referenceNumber} is ${statusLabel}`,
        template: './order-status-update',
        context: {
          customerName: order.customerName,
          referenceNumber: order.referenceNumber,
          statusLabel,
          statusMessage,
        },
      });
      this.logger.log(`Status update email sent to ${order.customerEmail} (${order.status})`);
    } catch (err) {
      this.logger.error(`Failed to send status update email: ${(err as Error).message}`);
    }
  }
}
