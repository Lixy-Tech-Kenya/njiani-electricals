import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from '@njiani/shared';
import { OrderEntity } from '../common/entities';
import { MailService } from '../mail/mail.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderEntity> {
    // 1. Fetch products and validate status
    const productIds = createOrderDto.items.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== createOrderDto.items.length) {
      throw new BadRequestException('Some products were not found');
    }

    if (products.some(p => p.status !== 'ACTIVE')) {
      throw new BadRequestException('One or more products are not active');
    }

    // 2. Calculate total amount server-side
    let totalAmount = 0;
    const orderItemsData = createOrderDto.items.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      const unitPrice = product.price;
      totalAmount += unitPrice * item.quantity;
      
      return {
        productId: item.productId,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice: unitPrice,
      };
    });

    // 3. Generate reference number
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
        },
      },
    });
    const referenceNumber = `NJE-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

    // 4. Persist in transaction
    const order = await this.prisma.order.create({
      data: {
        referenceNumber,
        customerName: createOrderDto.customerName,
        customerPhone: createOrderDto.customerPhone,
        customerEmail: createOrderDto.customerEmail,
        customerLocation: createOrderDto.customerLocation,
        notes: createOrderDto.notes,
        channel: createOrderDto.channel,
        totalAmount,
        status: 'PENDING',
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    // 5. Fire emails non-blocking
    this.mailService.sendOrderAlerts(order).catch(err => {
      console.error('Failed to send order emails:', err);
    });

    return new OrderEntity(order);
  }

  async findAll(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.OrderWhereInput = status ? { status: status as any } : {};

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { items: true },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: data.map(o => new OrderEntity(o)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<OrderEntity> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return new OrderEntity(order);
  }

  async updateStatus(id: string, updateDto: UpdateOrderStatusDto): Promise<OrderEntity> {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status: updateDto.status },
      include: { items: true },
    });
    return new OrderEntity(order);
  }

  async getStats() {
    const [totalOrders, pendingOrders, totalProducts, activeProducts, outOfStockProducts] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.product.count(),
      this.prisma.product.count({ where: { status: 'ACTIVE' } }),
      this.prisma.product.count({ where: { status: 'OUT_OF_STOCK' } }),
    ]);

    const recentOrders = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { items: true },
    });

    return {
      totalOrders,
      pendingOrders,
      totalProducts,
      activeProducts,
      outOfStockProducts,
      recentOrders: recentOrders.map(o => new OrderEntity(o)),
    };
  }
}
