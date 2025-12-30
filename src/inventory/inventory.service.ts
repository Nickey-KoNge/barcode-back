//src/inventory/inventory.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Barcode } from '../barcodes/barcode.entity';
import { InventoryTransaction } from './transaction.entity';

interface ProductDetailResult {
  unit_id: string;
  item_type: string;
  quantity_on_hand: number;
}
@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Barcode)
    private barcodeRepo: Repository<Barcode>,
    @InjectRepository(InventoryTransaction)
    private transRepo: Repository<InventoryTransaction>,
    private dataSource: DataSource, // QueryRunner အတွက် DataSource သုံးရပါမယ်
  ) {}

  async processScan(barcodeValue: string, qty: number, type: 'IN' | 'OUT') {
    const barcode = await this.barcodeRepo.findOne({
      where: { barcode_value: barcodeValue },
    });
    if (!barcode) throw new NotFoundException('Barcode not found');

    const qtyChange = type === 'IN' ? qty : -qty;

    // Database Transaction logic
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newTrans = this.transRepo.create({
        product_id: barcode.unit_id,
        qty_change: qtyChange,
        transaction_type: `STOCK_${type}`,
      });
      await queryRunner.manager.save(newTrans);

      await queryRunner.manager.query(
        `INSERT INTO stock_balances (product_id, quantity_on_hand) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE quantity_on_hand = quantity_on_hand + ?`,
        [barcode.unit_id, qtyChange, qtyChange],
      );

      await queryRunner.commitTransaction();
      return {
        message: 'Stock updated successfully',
        unit_id: barcode.unit_id,
      };
    } catch (_err) {
      await queryRunner.rollbackTransaction();
      console.error(_err);
      throw new InternalServerErrorException('Transaction Failed');
    } finally {
      await queryRunner.release();
    }
  }
  async getProductTransactions(
    productId: string,
  ): Promise<InventoryTransaction[]> {
    return await this.transRepo.find({
      where: { product_id: productId },
      order: { created_at: 'DESC' }, // Show newest transactions first
      take: 10, // Limit to last 10 transactions
    });
  }
  async getProductDetails(barcodeValue: string): Promise<ProductDetailResult> {
    // query<ProductDetailResult[]> ဟု Type သတ်မှတ်ပေးလိုက်ပါ
    const details = await this.dataSource.query<ProductDetailResult[]>(
      `SELECT b.unit_id, b.item_type, s.quantity_on_hand 
       FROM barcodes b 
       LEFT JOIN stock_balances s ON b.unit_id = s.product_id 
       WHERE b.barcode_value = ?`,
      [barcodeValue],
    );

    if (!details || details.length === 0) {
      throw new NotFoundException('Product not found');
    }

    return details[0]; // အခုဆိုရင် details သည် any မဟုတ်တော့သဖြင့် Error မတက်တော့ပါ
  }
}
