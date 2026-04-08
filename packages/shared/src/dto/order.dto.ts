import { IsString, IsPhoneNumber, IsEmail, IsOptional, IsEnum, IsArray, ValidateNested, IsInt, Min, Max, IsUUID, MinLength, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderChannel, OrderStatus } from '../types/order';

export class CreateOrderItemDto {
  @IsUUID()
  productId!: string;

  @IsInt()
  @Min(1)
  @Max(999)
  quantity!: number;
}

export class CreateOrderDto {
  @IsString()
  @MinLength(2)
  customerName!: string;

  @IsString()
  @MinLength(9)
  customerPhone!: string; // Validation regex could be added but phone validation is tricky

  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @IsString()
  @IsOptional()
  @Max(200)
  customerLocation?: string;

  @IsString()
  @IsOptional()
  @Max(500)
  notes?: string;

  @IsEnum(['WHATSAPP', 'EMAIL'])
  channel!: OrderChannel;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(['PENDING', 'CONFIRMED', 'PROCESSING', 'DELIVERED', 'CANCELLED'])
  status!: OrderStatus;
}
