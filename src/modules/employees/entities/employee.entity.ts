import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Job } from '../../jobs/entities/job.entity';

@Entity('employees')
export class Employee {
    @PrimaryGeneratedColumn()
    employeeId: number;

    @Column({ nullable: false })
    jobId: number;

    @Column({ nullable: false, length: 40 })
    names: string;

    @Column({ nullable: false, length: 40 })
    lastnames: string;

    @Column({ nullable: false, length: 40 })
    email: string;

    @Column({ nullable: false, length: 25 })
    numberPhone: string;

    @Column({ nullable: false, length: 15 })
    ci: string;

    @Column({ nullable: false, default: true })
    active: boolean;

    // Auditoria
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: null })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz', default: null })
    deletedAt: Date | null;

    // Relaciones
    @ManyToOne(() => Job, (job) => job.employee)
    @JoinColumn({ name: 'jobId' })
    job: Job;
}