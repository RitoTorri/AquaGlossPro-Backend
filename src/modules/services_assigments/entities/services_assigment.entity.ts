import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';

// relationships
import { SalesItemsEntity } from '../../sales_items/entities/sales_items.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Commission } from '../../commissions/entities/commission.entity';

@Entity('services_assignments')
export class ServicesAssigment {
  @PrimaryGeneratedColumn()
  serviceAssigmentId: number;

  @Column({ nullable: false, type: 'int' })
  saleItemId: number;

  @Column({ nullable: false, type: 'int' })
  employeeId: number;

  @Column({ type: 'text', default: null, name: 'notes' })
  notes: string;

  @Column({ nullable: false, type: 'boolean', default: true })
  active: boolean;

  @Column({
    nullable: false,
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'assignmentDate',
  })
  assigmentDate: Date;

  @Column({ nullable: false, type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  // Relaciones
  @ManyToOne(() => SalesItemsEntity, (salesItems) => salesItems.serviceAssigment)
  @JoinColumn({ name: 'saleItemId' })
  saleItem: SalesItemsEntity;

  @ManyToOne(() => Employee, (employee) => employee.serviceAssigment)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @OneToOne(() => Commission, (commission) => commission.servicesAssigments)
  union: Commission;
}
