import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Service } from '../../services/entities/service.entity';
import { TypeVehicle } from '../../type-vehicle/entities/type-vehicle.entity';
import { SalesItemsEntity } from '../../sales_items/entities/sales_items.entity';

@Entity('services_type_vehicle')
export class ServicesTypeVehicle {
  @PrimaryGeneratedColumn()
  serviceTypeVehicleId: number;

  @Column()
  serviceId: number;

  @Column()
  typeVehicleId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Service, (service) => service.servicesTypeVehicle)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @ManyToOne(() => TypeVehicle, (typeVehicle) => typeVehicle.servicesTypeVehicle)
  @JoinColumn({ name: 'typeVehicleId' })
  typeVehicle: TypeVehicle;

  @OneToMany(() => SalesItemsEntity, (salesItems) => salesItems.servicesTypeVehicle)
  salesItems: SalesItemsEntity[];
}
