//src/barcodes/barcode.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('barcodes')
export class Barcode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  barcode_value: string;

  @Column('uuid')
  unit_id: string;

  @Column()
  item_type: string;

  @Column({ default: 'Active' })
  status: string;
}
