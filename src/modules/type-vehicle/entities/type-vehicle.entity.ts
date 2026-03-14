import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('type_vehicle')
export class TypeVehicle {
    @PrimaryGeneratedColumn()
    typeVehicleId: number;

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