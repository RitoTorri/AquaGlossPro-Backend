import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { StatusPayments } from '../../../shared/enums/status-payments.enum';
import { StatusWashing } from '../../../shared/enums/status.washing';

// relationships
import { Client } from '../../clients/entities/client.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { PaymentMethod } from '../../payments-methods/entities/payment-method.entity';
import { SalesItemsEntity } from '../../sales_items/entities/sales_items.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  saleId: number;

  @Column({ nullable: false, type: 'int' })
  clientId: number;

  @Column({ nullable: false, type: 'int' })
  vehicleId: number;

  @Column({ nullable: false, type: 'int' })
  paymentMethodId: number;

  @Column({ nullable: false, type: 'varchar', length: 30, unique: true })
  invoiceNumber: string;

  @Column({ nullable: false, type: 'enum', enum: StatusPayments, default: StatusPayments.PENDING })
  statusSale: StatusPayments;

  @Column({ nullable: false, type: 'enum', enum: StatusWashing, default: StatusWashing.WAITING })
  statusWashing: StatusWashing;

  @Column({ nullable: true, type: 'text' })
  initialState: string;

  @Column({
    nullable: true,
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP', // Mejor usar la función nativa de DB
    transformer: {
      to: (value: Date) => value,
      from: (value: Date) => {
        if (!(value instanceof Date)) return value;
        const day = String(value.getDate()).padStart(2, '0');
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const year = value.getFullYear();
        const hours = String(value.getHours()).padStart(2, '0');
        const minutes = String(value.getMinutes()).padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}`;
      },
    },
  })
  saleDate: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true, default: null })
  updatedAt: Date | null;

  @ManyToOne(() => Client, (client) => client.sales)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.sales)
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.sales)
  @JoinColumn({ name: 'paymentMethodId' })
  paymentMethod: PaymentMethod;

  @OneToMany(() => SalesItemsEntity, (salesItems) => salesItems.sale)
  salesItems: SalesItemsEntity[];
}
