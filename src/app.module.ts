import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Barcode } from './barcodes/barcode.entity';
import { InventoryTransaction } from './inventory/transaction.entity';
import { InventoryController } from './inventory/inventory.controller';
import { InventoryService } from './inventory/inventory.service';
import { BarcodeGeneratorService } from './barcodes/barcode-generator.service';
import { BarcodesController } from './barcodes/barcodes.controller';

@Module({
  imports: [
    // ၁။ Database ကိုအရင်ချိတ်ရပါမယ် (forRoot ကို သုံးပါ)
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root', // သင့် MySQL username
      password: '', // သင့် MySQL password
      database: 'barcodedb',
      entities: [Barcode, InventoryTransaction],
      synchronize: true, // Table တွေကို Auto ဆောက်ပေးဖို့ (Dev mode မှာပဲ သုံးပါ)
    }),

    // ၂။ Entity တွေကို ဒီ Module မှာ သုံးမယ်လို့ ကြေညာပါ (forFeature ကို သုံးပါ)
    TypeOrmModule.forFeature([Barcode, InventoryTransaction]),
  ],
  controllers: [InventoryController, BarcodesController],
  providers: [InventoryService, BarcodeGeneratorService],
})
export class AppModule {}
