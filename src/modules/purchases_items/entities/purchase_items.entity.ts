import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Purchase } from '../../purchases/entities/purchase.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('purchases_items')
export class PurchaseItem {
  @PrimaryGeneratedColumn()
  purchaseItemId: number;

  @Column({ type: 'int' })
  purchaseId: number;

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => Purchase, (purchase) => purchase.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchaseId' })
  purchase: Purchase;

  @ManyToOne(() => Product, (product) => product.purchaseItems)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
