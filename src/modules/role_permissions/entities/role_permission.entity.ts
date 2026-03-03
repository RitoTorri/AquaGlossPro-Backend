import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
    Unique
} from 'typeorm';
import { Role } from 'src/modules/roles/entities/role.entity'; // Ajusta las rutas
import { Permission } from 'src/modules/permissions/entities/permission.entity';

@Entity('roles_permissions')
@Unique(['roleId', 'permissionId']) // Garantiza que un rol no tenga el mismo permiso dos veces
export class RolePermission {

    @PrimaryGeneratedColumn()
    rolePermissionId: number;

    // Declaramos la columna física para manejar IDs directamente
    @Column()
    roleId: number;

    @Column()
    permissionId: number;

    @Column({ default: true })
    active: boolean;

    // Auditoría
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', nullable: true })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deletedAt: Date | null;

    // Relaciones
    @ManyToOne(() => Role, (role) => role.rolesPermissions, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'roleId' })
    role: Role;

    @ManyToOne(() => Permission, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'permissionId' })
    permission: Permission;
}