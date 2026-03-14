import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('payments_methods')
export class PaymentMethod {
    @PrimaryGeneratedColumn()
    paymentMethodId: number;

    @Column({ length: 50, unique: true })
    name: string;

    @Column({ default: true })
    active: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', nullable: true })
    updatedAt: Date | null;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deletedAt: Date | null;
}