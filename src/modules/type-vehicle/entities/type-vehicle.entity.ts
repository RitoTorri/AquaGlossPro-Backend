import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { ServicesTypeVehicle } from '../../services-type-vehicle/entities/services-type-vehicle.entity';

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

    @OneToMany(() => ServicesTypeVehicle, (stv) => stv.typeVehicle)
    servicesTypeVehicle: ServicesTypeVehicle[];
}