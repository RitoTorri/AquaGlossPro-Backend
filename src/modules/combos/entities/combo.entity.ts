import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { CombosServiceEntity } from '../../combos-services/entities/combos-service.entity';

@Entity('combos')
export class Combo {
    @PrimaryGeneratedColumn()
    comboId!: number;  // ✅ añadido '!'

    @Column({ length: 40, unique: true })
    name!: string;  // ✅ añadido '!'

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    discountPercentage!: number;  // ✅ añadido '!'

    @Column({ default: false })
    isPromotion!: boolean;  // ✅ añadido '!'

    @Column({ type: 'timestamptz', nullable: true })
    expirationDate!: Date | null;  // ✅ añadido '!'

    @Column({ default: true })
    active!: boolean;  // ✅ añadido '!'

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;  // ✅ añadido '!'

    @UpdateDateColumn({ type: 'timestamptz', nullable: true })
    updatedAt!: Date | null;  // ✅ añadido '!'

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deletedAt!: Date | null;  // ✅ añadido '!'

    @OneToMany(() => CombosServiceEntity, (cs: CombosServiceEntity) => cs.combo)
    combosServices!: CombosServiceEntity[];  // ✅ añadido '!'
}