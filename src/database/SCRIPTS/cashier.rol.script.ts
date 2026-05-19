import { DataSource, In } from 'typeorm';
import { config } from 'dotenv';
import { Modul } from '../../modules/modules/entities/module.entity';
import { Permission } from '../../modules/permissions/entities/permission.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { RolePermission } from '../../modules/role_permissions/entities/role_permission.entity';
import { User } from '../../modules/users/entities/user.entity';
import { actionsPermissions } from '../../shared/enums/actions.enums';

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

async function cashierRoleSeed() {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    console.log('Conectando a la base de datos...');
    await AppDataSource.initialize();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    // 1. Crear o obtener el Rol CASHIER
    console.log('--- Creando el rol CASHIER ---');
    let cashierRole = await queryRunner.manager.findOne(Role, {
      where: { name: 'CASHIER' },
    });

    if (!cashierRole) {
      cashierRole = queryRunner.manager.create(Role, {
        name: 'CASHIER',
        active: true,
      });
      cashierRole = await queryRunner.manager.save(cashierRole);
      console.log('✅ Rol CASHIER creado correctamente.');
    } else {
      console.log('ℹ️  Rol CASHIER ya existe.');
    }

    // 2. Definir los permisos por módulo
    const modulePermissionsMap = new Map<string, string[]>([
      ['SALES', ['C', 'R', 'U']],
      ['COMBOS', ['R']],
      ['SERVICES', ['R']],
      ['SUPPLIERS', ['R']],
      ['CLIENTS', ['R']],
      ['VEHICLES', ['R']],
      ['EMPLOYEES', ['R']],
    ]);

    console.log('--- Asignando permisos al rol CASHIER ---');

    // 3. Procesar cada módulo y sus permisos
    for (const [moduleName, permissions] of modulePermissionsMap) {
      const mod = await queryRunner.manager.findOne(Modul, {
        where: { name: moduleName },
      });

      if (!mod) {
        console.log(`⚠️  Módulo "${moduleName}" no encontrado.`);
        continue;
      }

      for (const permType of permissions) {
        const permission = await queryRunner.manager.findOne(Permission, {
          where: {
            moduleId: mod.moduleId,
            typePermission: permType as actionsPermissions,
          },
        });

        if (!permission) {
          console.log(`⚠️  Permiso ${permType} para módulo "${moduleName}" no encontrado.`);
          continue;
        }

        const existingRolePermission = await queryRunner.manager.findOne(RolePermission, {
          where: {
            roleId: cashierRole.roleId,
            permissionId: permission.permissionId,
          },
        });

        if (!existingRolePermission) {
          const rolePermission = queryRunner.manager.create(RolePermission, {
            roleId: cashierRole.roleId,
            permissionId: permission.permissionId,
            active: true,
          });

          await queryRunner.manager.save(rolePermission);
          console.log(`✅ Permiso ${permType} en el módulo ${moduleName}`);
        } else {
          console.log(`ℹ️  El permiso ${permType} en el módulo ${moduleName} ya estaba asignado.`);
        }
      }
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

cashierRoleSeed();
