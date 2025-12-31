
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Barcode } from './barcode.entity';

import * as bwipjs from 'bwip-js';

@Injectable()
export class BarcodeGeneratorService {
  constructor(
    @InjectRepository(Barcode)
    private barcodeRepo: Repository<Barcode>,
    private dataSource: DataSource,
  ) {}
  async generateBarcodeImage(text: string): Promise<string> {
    const pngBuffer = await bwipjs.toBuffer({
      bcid: 'code128', // Barcode type
      text: text, // Text to encode
      scale: 3, // 3x scaling factor
      height: 10, // Bar height, in millimeters
      includetext: true, // Show human-readable text
      textxalign: 'center', // Always good to set this
    });

    return `data:image/png;base64,${pngBuffer.toString('base64')}`;
  }

  // async registerProductAndGenerateBarcode(itemData: {
  //   unit_id: string;
  //   item_type: string;
  // }) {
  //   const barcodeValue = itemData.unit_id;

  //   const newBarcode = this.barcodeRepo.create({
  //     barcode_value: barcodeValue,
  //     unit_id: itemData.unit_id,
  //     item_type: itemData.item_type,
  //   });

  //   await this.barcodeRepo.save(newBarcode);

  //   await this.dataSource.query(
  //     `INSERT INTO stock_balances (product_id, quantity_on_hand) 
  //      VALUES (?, 0) 
  //      ON DUPLICATE KEY UPDATE product_id = product_id`,
  //     [itemData.unit_id],
  //   );

  //   const barcodeImage = await this.generateBarcodeImage(barcodeValue);

  //   return { ...newBarcode, barcodeImage };
  // }
    async registerProductAndGenerateBarcode(itemData: {
    unit_id: string;
    item_type: string;
  }) {
    if (!this.dataSource?.isInitialized) {
      throw new Error('Database is not connected');
    }

    const barcodeValue = itemData.unit_id;

    const newBarcode = this.barcodeRepo.create({
      barcode_value: barcodeValue,
      unit_id: itemData.unit_id,
      item_type: itemData.item_type,
    });

    await this.barcodeRepo.save(newBarcode);

    await this.dataSource.query(
      `
      INSERT INTO stock_balances (product_id, quantity_on_hand)
      VALUES (?, 0)
      ON DUPLICATE KEY UPDATE quantity_on_hand = quantity_on_hand
      `,
      [itemData.unit_id],
    );

    const barcodeImage = await this.generateBarcodeImage(barcodeValue);

    return { ...newBarcode, barcodeImage };
  }
}
