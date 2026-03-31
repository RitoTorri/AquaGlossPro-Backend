import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { TypeUnit } from '../../../shared/enums/unit.type.enums';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    productId: number;

    @Column()
    categoryId: number;

    @Column({ length: 100, unique: true })
    name: string;

    @Column({ type: 'enum', enum: TypeUnit, default: TypeUnit.LITERS })
    unitType: TypeUnit;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    unitCostLiter: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    currentStock: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    minStock: number;

    @Column({ default: true })
    active: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', nullable: true })
    updatedAt: Date | null;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deletedAt: Date | null;

    // Relations
    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({
        name: 'categoryId', // Nombre de la columna en la tabla 'products' (DB)
        referencedColumnName: 'categoryId', // Nombre del atributo @PrimaryGeneratedColumn en 'Category'
        foreignKeyConstraintName: 'fk_product_category' // Nombre del "candado" en la DB
    })
    category: Category;
}