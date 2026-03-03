import { Role } from 'src/modules/roles/entities/role.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { RefreshToken } from 'src/modules/auth/entities/refreshToken.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    userId: number;

    // Columna fisica de la DB
    @Column({ nullable: false })
    roleId: number;

    @Column({ nullable: false, length: 100 })
    name: string;

    @Column({ unique: true, nullable: false, length: 100 })
    email: string;

    @Column({ nullable: false, length: 255 })
    password: string;

    @Column({ default: true })
    active: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: null })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz', default: null })
    deletedAt: Date | null;

    // Define la relacion de las columnas 
    @ManyToOne(() => Role, (role) => role.users, {
        eager: false,      // 1. Carga bajo demanda
        cascade: true,     // 2. Persistencia en cascada
        onDelete: 'CASCADE', // 3. Borrado físico vinculado
        onUpdate: 'CASCADE', // 4. Actualización vinculada
    })
    @JoinColumn({ name: 'roleId' })
    role: Role;
    
    @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
    refreshTokens: RefreshToken[];
}
