import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { OrderEntity } from '../common/entities';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendOrderAlerts(order: OrderEntity) {
    const businessEmail = this.configService.get('BUSINESS_EMAIL');

    // 1. Send confirmation to customer (if email exists)
    if (order.customerEmail) {
      await this.mailerService.sendMail({
        to: order.customerEmail,
        subject: `Order Confirmation - ${order.referenceNumber}`,
        template: './order-confirmation',
        context: {
          order,
          customerName: order.customerName,
          referenceNumber: order.referenceNumber,
          totalAmount: (order.totalAmount / 100).toLocaleString('en-KE', { style: 'currency', currency: 'KES' }),
        },
      });
    }

    // 2. Send alert to business
    await this.mailerService.sendMail({
      to: businessEmail,
      subject: `New Order Alert - ${order.referenceNumber}`,
      template: './new-order-alert',
      context: {
        order,
        customerName: order.customerName,
        referenceNumber: order.referenceNumber,
        totalAmount: (order.totalAmount / 100).toLocaleString('en-KE', { style: 'currency', currency: 'KES' }),
      },
    });
  }
}
