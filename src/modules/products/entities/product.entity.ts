import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    productId: number;

    @Column({ length: 100, unique: true })
    name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    unitCostLiter: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    currentStock: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    minStock: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    maxStock: number;

    @Column({ default: true })
    active: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', nullable: true })
    updatedAt: Date | null;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deletedAt: Date | null;
}