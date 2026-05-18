import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Sale } from '../../sales/entities/sale.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  clientId: number;

  @Column({ nullable: false, length: 40 })
  names: string;

  @Column({ nullable: false, length: 40 })
  lastnames: string;

  @Column({ nullable: false, length: 25, unique: true })
  numberPhone: string;

  @Column({ nullable: false, length: 15, unique: true })
  ci: string;

  @Column({ nullable: true, length: 100, unique: true })
  email: string;

  @Column({ nullable: false, default: true })
  active: boolean;

  // Auditoria
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: null })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', default: null })
  deletedAt: Date | null;

  // Relaciones
  @OneToMany(() => Vehicle, (vehicle) => vehicle.owner)
  vehicles: Vehicle[];

  @OneToMany(() => Sale, (sales) => sales.client)
  sales: Sale[];
}
