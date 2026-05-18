import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { TypeUnit } from '../../../shared/enums/unit.type.enums';
import { PurchaseItem } from '../../purchases_items/entities/purchase_items.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  productId: number;

  @Column()
  categoryId: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'enum', enum: TypeUnit, default: TypeUnit.LITERS })
  unitType: TypeUnit;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, default: 0 })
  unitCostLiter: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentStock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  minStock: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({
    name: 'categoryId',
    referencedColumnName: 'categoryId',
    foreignKeyConstraintName: 'fk_product_category',
  })
  category: Category;

  @OneToMany(() => PurchaseItem, (item) => item.product)
  purchaseItems: PurchaseItem[];
}
