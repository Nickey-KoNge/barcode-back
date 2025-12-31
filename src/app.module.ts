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
    TypeOrmModule.forRoot({
      type: 'mysql',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,

      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
      entities: [Barcode, InventoryTransaction],
      // Production မှာဆိုရင် synchronize: false ထားတာ ပိုစိတ်ချရပါတယ်
      synchronize: false,
    }),

    TypeOrmModule.forFeature([Barcode, InventoryTransaction]),
  ],
  controllers: [InventoryController, BarcodesController],
  providers: [InventoryService, BarcodeGeneratorService],
})
export class AppModule {}
