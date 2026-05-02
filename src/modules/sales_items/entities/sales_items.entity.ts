import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

// relationships
import { Sale } from '../../sales/entities/sale.entity';
import { ServicesTypeVehicle } from '../../services-type-vehicle/entities/services-type-vehicle.entity';
import { Combo } from '../../combos/entities/combo.entity';
import { ServicesAssigment } from '../../services_assigments/entities/services_assigment.entity';

@Entity('sales_items')
export class SalesItemsEntity {
  @PrimaryGeneratedColumn()
  saleItemId: number;

  @Column({ nullable: false, type: 'int' })
  saleId: number;

  @Column({ nullable: true, type: 'int' })
  serviceTypeVehicleId: number;

  @Column({ nullable: true, type: 'int' })
  comboOriginId: number;

  @Column({ nullable: true, type: 'numeric', precision: 10, scale: 2 })
  salePrice: number;

  @Column({ nullable: true, type: 'numeric', precision: 10, scale: 2 })
  discount: number;

  // Relaciones
  @ManyToOne(() => Sale, (sale) => sale.salesItems)
  @JoinColumn({ name: 'saleId' })
  sale: Sale;

  @ManyToOne(() => ServicesTypeVehicle, (servicesTypeVehicle) => servicesTypeVehicle.salesItems)
  @JoinColumn({ name: 'serviceTypeVehicleId' })
  servicesTypeVehicle: ServicesTypeVehicle;

  @ManyToOne(() => Combo, (combo) => combo.salesItems)
  @JoinColumn({ name: 'comboOriginId' })
  comboOrigin: Combo;

  @OneToMany(() => ServicesAssigment, (sa) => sa.saleItem)
  serviceAssigment: ServicesAssigment[];
}
