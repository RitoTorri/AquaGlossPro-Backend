import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany,
    Unique
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Service } from '../../services/entities/service.entity';
import { typeCategories } from '../../../shared/enums/types.services.enums';

@Entity('categories')
@Unique(['name', 'type'])
export class Category {
    @PrimaryGeneratedColumn()
    categoryId: number;

    @Column({ length: 100 })
    name: string;

    @Column({ type: 'enum', enum: typeCategories, default: typeCategories.PRODUCTS })
    type: typeCategories;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'boolean', default: true })
    active: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn({ default: null })
    updatedAt: Date | null;

    @DeleteDateColumn({ default: null })
    deletedAt: Date | null;

    @OneToMany(() => Product, (product) => product.category)
    products: Product[];

    @OneToMany(() => Product, (product) => product.category)
    services: Service[];
}