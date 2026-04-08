import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { CartService, CartItemData } from './cart.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private getCartId(req: Request, res: Response): string {
    let cartId = req.cookies['cart_id'];
    if (!cartId) {
      cartId = uuidv4();
      res.cookie('cart_id', cartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }
    return cartId;
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get current cart' })
  async getCart(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cartId = this.getCartId(req, res);
    return this.cartService.getCart(cartId);
  }

  @Post('items')
  @Public()
  @ApiOperation({ summary: 'Add item to cart' })
  async addItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() item: CartItemData,
  ) {
    const cartId = this.getCartId(req, res);
    return this.cartService.addItem(cartId, item);
  }

  @Patch('items/:productId')
  @Public()
  @ApiOperation({ summary: 'Update item quantity' })
  async updateQuantity(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('productId') productId: string,
    @Body('quantity') quantity: number,
  ) {
    const cartId = this.getCartId(req, res);
    return this.cartService.updateQuantity(cartId, productId, quantity);
  }

  @Delete('items/:productId')
  @Public()
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('productId') productId: string,
  ) {
    const cartId = this.getCartId(req, res);
    return this.cartService.removeItem(cartId, productId);
  }

  @Delete()
  @Public()
  @ApiOperation({ summary: 'Clear cart' })
  async clearCart(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cartId = this.getCartId(req, res);
    return this.cartService.clearCart(cartId);
  }
}
