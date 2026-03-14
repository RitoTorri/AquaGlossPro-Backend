import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('jobs')
export class Job {
    @PrimaryGeneratedColumn()
    jobId: number;

    @Column({ unique: true, length: 50 })
    name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    baseSalary: number;

    @Column({ default: true })
    active: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', nullable: true })
    updatedAt: Date | null;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deletedAt: Date | null;

    // Relaciones
    @OneToMany(() => Employee, (employee) => employee.job)
    employee: Employee[];
}