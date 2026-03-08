import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('suppliers')
export class Supplier {
    @PrimaryGeneratedColumn()
    supplierId: number;

    @Column({ nullable: false, length: 40 })
    names: string;

    @Column({ nullable: false, length: 40 })
    lastnames: string;

    @Column({ nullable: false, length: 50 })
    email: string;
    
    @Column({ nullable: false, length: 25 })
    numberPhone: string;

    @Column({nullable: false, length: 20})
    ci: string;
    
    @Column({ nullable: false, default: true })
    active : boolean;

    // Auditoria
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: null })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz', default: null })
    deletedAt: Date | null;
}