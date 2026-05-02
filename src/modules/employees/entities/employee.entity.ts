import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Job } from '../../jobs/entities/job.entity';
import { ServicesAssigment } from '../../services_assigments/entities/services_assigment.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  employeeId: number;

  @Column()
  jobId: number;

  @Column({ length: 40 })
  names: string;

  @Column({ length: 40 })
  lastnames: string;

  @Column({ length: 40, unique: true })
  email: string;

  @Column({ length: 25, unique: true })
  numberPhone: string;

  @Column({ length: 15, unique: true })
  ci: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  // Relación con Job
  @ManyToOne(() => Job, (job) => job.employees)
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @OneToMany(() => ServicesAssigment, (sa) => sa.employee)
  serviceAssigment: ServicesAssigment[];
}
