import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { PaymentMethod } from '../../payments-methods/entities/payment-method.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { PurchaseItem } from '../../purchases_items/entities/purchase_items.entity';
import { StatusPayments } from '../../../shared/enums/status-payments.enum';

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn()
  purchaseId: number;

  @Column({ type: 'int' })
  supplierId: number;

  @Column({ type: 'int' })
  paymentMethodId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    transformer: {
      to: (value: Date) => value,
      from: (value: Date) => {
        if (!(value instanceof Date)) return value;
        const day = String(value.getDate()).padStart(2, '0');
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const year = value.getFullYear();
        const hours = String(value.getHours()).padStart(2, '0');
        const minutes = String(value.getMinutes()).padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}`;
      },
    },
  })
  purchaseDate: Date;

  @Column({ length: 50, nullable: true })
  invoiceNumber: string;

  @Column({
    type: 'enum',
    enum: StatusPayments,
    default: StatusPayments.PENDING,
  })
  purchaseStatus: StatusPayments;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.purchases)
  @JoinColumn({ name: 'paymentMethodId' })
  paymentMethod: PaymentMethod;

  @ManyToOne(() => Supplier, (supplier) => supplier.purchases)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @OneToMany(() => PurchaseItem, (item) => item.purchase, { cascade: true })
  items: PurchaseItem[];
}
