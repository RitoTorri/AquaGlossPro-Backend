import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('services')
export class Service {
    @PrimaryGeneratedColumn()
    serviceId: number;

    @Column({ nullable: false, length: 40, unique: true })
    name: string;

    @Column({ nullable: false, default: 0 })
    comissionPercentage: number;

    @Column({ default: true })
    active: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: null })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz', default: null })
    deletedAt: Date | null;
}