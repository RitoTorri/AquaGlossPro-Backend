import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Purchase } from '../../purchases/entities/purchase.entity';
import { Sale } from '../../sales/entities/sale.entity';

@Entity('payments_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn()
  paymentMethodId: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => Purchase, (purchase) => purchase.paymentMethod)
  purchases: Purchase[];

  @OneToMany(() => Sale, (sale) => sale.paymentMethod)
  sales: Sale[];
}
