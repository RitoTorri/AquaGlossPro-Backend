import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Modul } from '../../modules/modules/entities/module.entity';
import { Permission } from '../../modules/permissions/entities/permission.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { RolePermission } from '../../modules/role_permissions/entities/role_permission.entity';
import { actionsPermissions } from '../../shared/enums/actions.enums';
import { User } from '../../modules/users/entities/user.entity';
import bcrypt from 'bcrypt';

// 1. Cargar variables de entorno inmediatamente
config();

// 2. Crear la instancia del DataSource con tus credenciales del .env
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [Modul, Permission, Role, RolePermission, User],
  synchronize: true, // Seguridad ante todo
});

// 3. La lógica de la transacción
async function runSeed() {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    console.log('Conectando a la base de datos...');
    await AppDataSource.initialize();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const tableModules = [
      'CATEGORIES',
      'CLIENTS',
      'COMBOS',
      'COMISSIONS',
      'EMPLOYEES',
      'JOBS',
      'PAYMENT_METHODS',
      'PRODUCTS',
      'PURCHASES',
      'SALES',
      'SERVICES',
      'SERVICES_TYPE_VEHICLE',
      'SUPPLIERS',
      'TYPE_VEHICLES',
      'VEHICLES',
      'USERS',
    ];
    const actions = ['C', 'R', 'U', 'D'];

    // Crear el Rol MANAGER
    let managerRole = await queryRunner.manager.findOne(Role, {
      where: { name: 'MANAGER' },
    });
    if (!managerRole) {
      managerRole = queryRunner.manager.create(Role, {
        name: 'MANAGER',
        active: true,
      });
      managerRole = await queryRunner.manager.save(managerRole);
    }

    console.log('--- Creando Módulos y Permisos ---');

    for (const moduleName of tableModules) {
      let mod = await queryRunner.manager.findOne(Modul, {
        where: { name: moduleName },
      });
      if (!mod) {
        mod = queryRunner.manager.create(Modul, {
          name: moduleName,
          active: true,
        });
        mod = await queryRunner.manager.save(mod);
      }

      for (const action of actions) {
        let permission = await queryRunner.manager.findOne(Permission, {
          where: {
            moduleId: mod.moduleId,
            typePermission: action as actionsPermissions,
          },
        });

        if (!permission) {
          permission = queryRunner.manager.create(Permission, {
            moduleId: mod.moduleId,
            typePermission: action as actionsPermissions,
            active: true,
          });
          permission = await queryRunner.manager.save(permission);
        }

        const rolePermissionExist = await queryRunner.manager.findOne(RolePermission, {
          where: {
            roleId: managerRole.roleId,
            permissionId: permission.permissionId,
          },
        });

        if (!rolePermissionExist) {
          await queryRunner.manager.save(RolePermission, {
            roleId: managerRole.roleId,
            permissionId: permission.permissionId,
            active: true,
          });
        }
      }
      console.log(`${moduleName} creado e inicializado correctamente.`);
    }

    // Validamos que el administrador exista
    let admin = await queryRunner.manager.findOne(User, {
      where: { email: 'admin@admin.com' },
    });
    if (!admin) {
      // Creamos el usuario administrador
      const password = await bcrypt.hash('admin', 10);
      await queryRunner.manager.save(User, {
        roleId: 1,
        name: 'admin'.toUpperCase(),
        email: 'admin@admin.com',
        password,
        active: true,
      });
    }
    console.log('ADMIN creado correctamente.');

    await queryRunner.commitTransaction();
  } catch (err) {
    console.error('❌ Error, haciendo rollback:', err);
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
    process.exit(0);
  }
}

// 4. Ejecutar la función
runSeed();
