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

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn()
  supplierId: number;

  @Column({ nullable: false, length: 40, unique: true })
  companyName: string;

  @Column({ nullable: false, length: 50, unique: true })
  email: string;

  @Column({ nullable: false, length: 25, unique: true })
  numberPhone: string;

  @Column({ nullable: false, length: 20, unique: true })
  rif: string;

  @Column({ nullable: false, default: true })
  active: boolean;

  // Auditoria
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: null })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', default: null })
  deletedAt: Date | null;

  @OneToMany(() => Purchase, (purchase) => purchase.supplier)
  purchases: Purchase[];
}
