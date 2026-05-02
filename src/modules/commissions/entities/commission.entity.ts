import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
} from 'typeorm';
import { StatusPayments } from '../../../shared/enums/status-payments.enum';
import { ServicesAssigment } from '../../services_assigments/entities/services_assigment.entity';

@Entity('commissions')
export class Commission {
  @PrimaryGeneratedColumn()
  commissionId: number;

  @Column({ nullable: false, type: 'int' })
  serviceAssigmentId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  comissionTotal: number;

  @Column({
    type: 'enum',
    enum: StatusPayments,
    default: StatusPayments.PENDING,
  })
  statusPaymentComission: StatusPayments;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  paymentDate: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedAt: Date | null;
}
