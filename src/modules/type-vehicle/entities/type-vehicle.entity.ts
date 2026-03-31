import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

@Entity('types_vehicles')
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

    // Relaciones
    @OneToMany(() => Vehicle, (vehicle) => vehicle.typeVehicle)
    vehicles: Vehicle[];
}