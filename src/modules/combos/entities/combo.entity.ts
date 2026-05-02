import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { CombosServiceEntity } from '../../combos-services/entities/combos-service.entity';
import { SalesItemsEntity } from '../../sales_items/entities/sales_items.entity';

@Entity('combos')
export class Combo {
  @PrimaryGeneratedColumn()
  comboId: number;

  @Column({ length: 40, unique: true, nullable: false })
  name: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: false })
  discountPercentage: number;

  @Column({ default: false, nullable: false })
  isPromotion: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  expirationDate: Date;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => CombosServiceEntity, (cs) => cs.combo)
  combosServices: CombosServiceEntity[];

  @OneToMany(() => SalesItemsEntity, (si) => si.comboOrigin)
  salesItems: SalesItemsEntity[];
}
