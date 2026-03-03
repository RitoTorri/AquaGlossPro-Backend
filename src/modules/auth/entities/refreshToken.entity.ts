import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

@Entity("refresh_tokens")
export class RefreshToken {
    @PrimaryGeneratedColumn()
    tokenId: number;

    @Column({ nullable: false })
    userId: number;

    @Column({ nullable: false, unique: true })
    token: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.refreshTokens, {
        onDelete: 'CASCADE', // Si se elimina el usuario, también se elimina el token
    })
    @JoinColumn({ name: 'userId' })
    user: User;
}