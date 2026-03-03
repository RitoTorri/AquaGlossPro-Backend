import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { OneToMany } from 'typeorm';

@Entity("modules")
export class Modul {
    @PrimaryGeneratedColumn()
    moduleId: number;

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

    @OneToMany(() => Permission, (permission) => permission.modul)
    permissions: Permission[];
}