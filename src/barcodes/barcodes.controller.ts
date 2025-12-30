//src/barcodes/barcodes.controller.ts
import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { BarcodeGeneratorService } from './barcode-generator.service';

// @Controller('barcode-gen')
// export class BarcodesController {
//   constructor(private readonly barcodeGenService: BarcodeGeneratorService) {}

//   @Get('generate')
//   async generate(@Query('unitId') unitId: string) {
//     const qrImage = await this.barcodeGenService.generateQRCode(unitId);
//     return { unitId, qrImage };
//   }

//   // Frontend (Next.js) ကနေ Register လုပ်ဖို့ ခေါ်ရမည့် API
//   @Post('register')
//   async register(@Body() data: { unit_id: string; item_type: string }) {
//     return await this.barcodeGenService.registerProductAndGenerateQR(data);
//   }
// }

@Controller('barcode-gen')
export class BarcodesController {
  constructor(private readonly barcodeGenService: BarcodeGeneratorService) {}

  @Get('generate')
  async generate(@Query('unitId') unitId: string) {
    const barcodeImage =
      await this.barcodeGenService.generateBarcodeImage(unitId);
    return { unitId, barcodeImage };
  }

  @Post('register')
  async register(@Body() data: { unit_id: string; item_type: string }) {
    return await this.barcodeGenService.registerProductAndGenerateBarcode(data);
  }
}
