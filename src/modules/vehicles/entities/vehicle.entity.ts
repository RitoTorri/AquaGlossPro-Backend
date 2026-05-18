import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { TypeVehicle } from '../../type-vehicle/entities/type-vehicle.entity';
import { Client } from '../../clients/entities/client.entity';
import { Sale } from '../../sales/entities/sale.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  vehicleId: number;

  @Column({ nullable: false })
  typeVehicleId: number;

  @Column({ nullable: false })
  ownerId: number;

  @Column({ nullable: false, length: 20, unique: true })
  plate: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: null })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', default: null })
  deletedAt: Date | null;

  // Relaciones
  @ManyToOne(() => TypeVehicle, (typeVehicle) => typeVehicle.vehicles)
  @JoinColumn({ name: 'typeVehicleId' })
  typeVehicle: TypeVehicle;

  @ManyToOne(() => Client, (client) => client.vehicles)
  @JoinColumn({ name: 'ownerId' })
  owner: Client;

  @OneToMany(() => Sale, (sales) => sales.vehicle)
  sales: Sale[];
}
