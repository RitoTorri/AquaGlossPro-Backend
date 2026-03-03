import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique, OneToMany } from 'typeorm';
import { actionsPermissions } from 'src/shared/enums/actions.enums';
import { Modul } from 'src/modules/modules/entities/module.entity';
import { RolePermission } from 'src/modules/role_permissions/entities/role_permission.entity'; // Ajusta las rutas

@Entity("permissions")
@Unique(['modul', 'typePermission'])
export class Permission {
  @PrimaryGeneratedColumn()
  permissionId: number;

  @Column({ nullable: false })
  moduleId: number;

  @Column({
    type: 'enum',
    enum: actionsPermissions
  })
  typePermission: actionsPermissions;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
  rolePermissions: RolePermission[]; // Carga en memoria

  @ManyToOne(() => Modul, (modul) => modul.permissions, {
    eager: false,
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'moduleId', })
  modul: Modul;
}