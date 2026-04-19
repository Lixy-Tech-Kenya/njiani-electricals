import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MailModule } from '../mail/mail.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [MailModule, WhatsAppModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
