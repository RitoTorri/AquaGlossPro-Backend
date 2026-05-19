import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Modul } from '../../modules/modules/entities/module.entity';
import { Permission } from '../../modules/permissions/entities/permission.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { RolePermission } from '../../modules/role_permissions/entities/role_permission.entity';
import { User } from '../../modules/users/entities/user.entity';
import bcrypt from 'bcrypt';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [Modul, Permission, Role, RolePermission, User],
  synchronize: true,
});

async function adminRoleSeed() {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    console.log('Conectando a la base de datos...');
    await AppDataSource.initialize();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    // 1. Crear o obtener el Rol ADMIN
    console.log('--- Creando el rol ADMIN ---');
    let adminRole = await queryRunner.manager.findOne(Role, {
      where: { name: 'ADMIN' },
    });

    if (!adminRole) {
      adminRole = queryRunner.manager.create(Role, {
        name: 'ADMIN',
        active: true,
      });
      adminRole = await queryRunner.manager.save(adminRole);
      console.log('✅ Rol ADMIN creado correctamente.');
    } else {
      console.log('ℹ️  Rol ADMIN ya existe.');
    }

    // 2. Asignar TODOS los permisos al rol ADMIN
    console.log('--- Asignando todos los permisos al rol ADMIN ---');
    
    const allPermissions = await queryRunner.manager.find(Permission);
    
    // Para llevar un conteo de permisos asignados
    let newPermissionsCount = 0;
    let existingPermissionsCount = 0;

    for (const permission of allPermissions) {
      // Buscar el módulo para mostrar información detallada
      const mod = await queryRunner.manager.findOne(Modul, {
        where: { moduleId: permission.moduleId },
      });

      const moduleName = mod ? mod.name : 'MÓDULO DESCONOCIDO';
      const permType = permission.typePermission;

      // Verificar si ya existe la asignación
      const existingRolePermission = await queryRunner.manager.findOne(RolePermission, {
        where: {
          roleId: adminRole.roleId,
          permissionId: permission.permissionId,
        },
      });

      if (!existingRolePermission) {
        // Crear nueva asignación
        const rolePermission = queryRunner.manager.create(RolePermission, {
          roleId: adminRole.roleId,
          permissionId: permission.permissionId,
          active: true,
        });

        await queryRunner.manager.save(rolePermission);
        console.log(`✅ Permiso ${permType} en el módulo ${moduleName}`);
        newPermissionsCount++;
      } else {
        existingPermissionsCount++;
      }
    }

    console.log(`📊 Resumen: ${newPermissionsCount} permisos nuevos asignados, ${existingPermissionsCount} ya existían.`);
    console.log('✅ Permisos asignados correctamente al rol ADMIN.');

    // 3. Crear usuario administrador por defecto
    console.log('--- Creando usuario ADMIN ---');
    
    let adminUser = await queryRunner.manager.findOne(User, {
      where: { email: 'admin' },
    });

    if (!adminUser) {
      const password = await bcrypt.hash('admin', 10);
      
      adminUser = queryRunner.manager.create(User, {
        roleId: adminRole.roleId,
        name: 'ADMIN',
        email: 'admin',
        password,
        active: true,
      });
      
      await queryRunner.manager.save(adminUser);
      console.log('✅ Usuario ADMIN creado correctamente.');
      console.log('📧 Email: admin');
      console.log('🔑 Contraseña: admin');
    } else {
      console.log('ℹ️  Usuario ADMIN ya existe.');
    }

    await queryRunner.commitTransaction();
    console.log('✅ Script ejecutado correctamente.');
    
  } catch (err) {
    console.error('❌ Error, haciendo rollback:', err);
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
    process.exit(0);
  }
}

adminRoleSeed();