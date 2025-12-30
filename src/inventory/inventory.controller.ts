//src/inventory/inventory.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { InventoryService } from './inventory.service';
interface ProductDetailResult {
  unit_id: string;
  item_type: string;
  quantity_on_hand: number;
}
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('scan')
  async handleScan(
    @Body() data: { barcode: string; qty: number; type: 'IN' | 'OUT' },
  ) {
    return await this.inventoryService.processScan(
      data.barcode,
      data.qty,
      data.type,
    );
  }
  @Get('details/:barcode')
  async getDetails(
    @Param('barcode') barcode: string,
  ): Promise<ProductDetailResult> {
    return await this.inventoryService.getProductDetails(barcode);
  }
  @Get('transactions/:productId')
  async getTransactions(@Param('productId') productId: string) {
    return await this.inventoryService.getProductTransactions(productId);
  }
}
