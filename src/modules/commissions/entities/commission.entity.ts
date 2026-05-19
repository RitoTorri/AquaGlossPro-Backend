import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
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
  conmissionTotal: number;

  @Column({
    type: 'enum',
    enum: StatusPayments,
    default: StatusPayments.PENDING,
  })
  statusPaymentConmission: StatusPayments;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  paymentDate: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  // Relaciones
  @OneToOne(() => ServicesAssigment, (sa) => sa.union)
  @JoinColumn({ name: 'serviceAssigmentId' })
  servicesAssigments: ServicesAssigment;
}
