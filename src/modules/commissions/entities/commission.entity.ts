import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { StatusPayments } from '../../../shared/enums/status-payments.enum';

@Entity('commissions')
export class Commission {
  @PrimaryGeneratedColumn()
  commissionId: number;

  @Column({ name: 'employeeId' })
  employeeId: number;

  @Column({ name: 'saleDetailId' })
  saleDetailId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  comissionTotal: number;

  @Column({
    type: 'enum',
    enum: StatusPayments,
    default: StatusPayments.PENDING,
  })
  statusPaymentComission: StatusPayments;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Employee, (employee) => employee.commissions)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;
}
