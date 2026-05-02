import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';

// relationships
import { SalesItemsEntity } from '../../sales_items/entities/sales_items.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Commission } from '../../commissions/entities/commission.entity';

@Entity('services_assigments')
export class ServicesAssigment {
  @PrimaryGeneratedColumn()
  serviceAssigmentId: number;

  @Column({ nullable: false, type: 'int' })
  saleItemId: number;

  @Column({ nullable: false, type: 'int' })
  employeeId: number;

  @Column({ nullable: false, type: 'text' })
  note: string;

  @Column({ nullable: false, type: 'boolean', default: true })
  active: boolean;

  @Column({ nullable: false, type: 'timestamptz', default: new Date() })
  assigmentDate: Date;

  @Column({ nullable: false, type: 'timestamptz', default: new Date() })
  createdAt: Date;

  @UpdateDateColumn({ name: 'name', type: 'timestamp', default: null })
  updatedAt: Date | null;

  // Relaciones
  @ManyToOne(() => SalesItemsEntity, (salesItems) => salesItems.serviceAssigment)
  @JoinColumn({ name: 'saleItemId' })
  saleItem: SalesItemsEntity;

  @ManyToOne(() => Employee, (employee) => employee.serviceAssigment)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;
}
