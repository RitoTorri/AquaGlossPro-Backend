import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Modul } from '../../modules/modules/entities/module.entity';
import { Permission } from '../../modules/permissions/entities/permission.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { RolePermission } from '../../modules/role_permissions/entities/role_permission.entity';
import { actionsPermissions } from '../../shared/enums/actions.enums';
import { User } from '../../modules/users/entities/user.entity';

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

// 3. La lógica de la transacción
async function modulesSeed() {
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
      'ROLES',
      'STOCK'
    ];
    const actions = ['C', 'R', 'U', 'D'];

    console.log('--- Creando Módulos y Permisos ---');

    // Exploramos el arreglo de modulos
    for (const moduleName of tableModules) {
      // Verificamos si el modulo existe
      let mod = await queryRunner.manager.findOne(Modul, {
        where: { name: moduleName },
      });

      // Si no existe, lo creamos
      if (!mod) {
        mod = queryRunner.manager.create(Modul, {
          name: moduleName,
          active: true,
        });
        mod = await queryRunner.manager.save(mod);
      }

      // Exploramos las acciones C, R, U, D
      for (const action of actions) {
        // Verificamos si el modulo tiene el permiso
        let permission = await queryRunner.manager.findOne(Permission, {
          where: {
            moduleId: mod.moduleId,
            typePermission: action as actionsPermissions,
          },
        });

        // Si no existe, lo creamos
        if (!permission) {
          permission = queryRunner.manager.create(Permission, {
            moduleId: mod.moduleId,
            typePermission: action as actionsPermissions,
            active: true,
          });
          permission = await queryRunner.manager.save(permission);
        }
      }
      console.log(`${moduleName} creado e inicializado correctamente.`);
    }

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

modulesSeed();
