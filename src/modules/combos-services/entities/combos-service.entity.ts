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
import { Service } from '../../services/entities/service.entity'; // ← Cambio importante

@Entity('combos_services')
export class CombosServiceEntity {
  @PrimaryGeneratedColumn()
  comboServiceId: number;

  @Column({ name: 'comboId', nullable: false })
  comboId: number;

  @Column({ name: 'serviceId', nullable: false }) // ← antes 'servicesTypeVehicleId'
  serviceId: number;

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

  @ManyToOne(() => Service, (service) => service.combosServices) // ← relación con Service
  @JoinColumn({ name: 'serviceId' })
  service: Service;
}