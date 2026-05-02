import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Combo } from '../../combos/entities/combo.entity';
import { ServicesTypeVehicle } from '../../services-type-vehicle/entities/services-type-vehicle.entity';

@Entity('combos_services')
export class CombosServiceEntity {
  @PrimaryGeneratedColumn()
  comboServiceId: number;

  @Column({ name: 'comboId', nullable: false })
  comboId: number;

  @Column({ name: 'servicesTypeVehicleId', nullable: false })
  servicesTypeVehicleId: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true, default: null })
  updatedAt: Date | null;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true, default: null })
  deletedAt: Date | null;

  @ManyToOne(() => Combo, (combo) => combo.combosServices)
  @JoinColumn({ name: 'comboId' })
  combo: Combo;

  @ManyToOne(() => ServicesTypeVehicle, (stv) => stv.combosServices)
  @JoinColumn({ name: 'servicesTypeVehicleId' })
  servicesTypeVehicle: ServicesTypeVehicle;
}
