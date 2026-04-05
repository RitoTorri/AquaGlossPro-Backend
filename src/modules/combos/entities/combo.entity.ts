import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { CombosServiceEntity } from '../../combos-services/entities/combos-service.entity';

@Entity('combos')
export class Combo {
    @PrimaryGeneratedColumn()
    comboId: number;

    @Column({ length: 40, unique: true })
    name: string;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    discountPercentage: number;

    @Column({ default: false })
    isPromotion: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    expirationDate: Date;

    @Column({ default: true })
    active: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', nullable: true })
    updatedAt: Date | null;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deletedAt: Date | null;

    @OneToMany(() => CombosServiceEntity, (cs) => cs.combo)
    combosServices: CombosServiceEntity[];
}