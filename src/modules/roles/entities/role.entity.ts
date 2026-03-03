import { User } from 'src/modules/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { OneToMany } from 'typeorm';
import { RolePermission } from '../../role_permissions/entities/role_permission.entity'; // Ajusta las rutas

@Entity("roles")
export class Role {
    @PrimaryGeneratedColumn()
    roleId: number;

    @Column({ unique: true, nullable: false, length: 50 })
    name: string;

    @Column({ default: true })
    active: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: null })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz', default: null })
    deletedAt: Date | null;

    @OneToMany(() => User, (user) => user.role)
    users: User[];

    @OneToMany(() => RolePermission, (rolePermissions) => rolePermissions.role)
    rolesPermissions: RolePermission[]; // Carga en memoria
}