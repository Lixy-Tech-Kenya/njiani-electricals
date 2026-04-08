export type OrderChannel = 'WHATSAPP' | 'EMAIL';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  referenceNumber: string;   // e.g. NJE-20240601-0042
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerLocation?: string;
  notes?: string;
  channel: OrderChannel;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
}
