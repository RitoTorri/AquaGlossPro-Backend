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

async function trackViewerRoleSeed() {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    console.log('Conectando a la base de datos...');
    await AppDataSource.initialize();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    // 1. Crear o obtener el Rol TRACK_VIEWER
    console.log('--- Creando el rol TRACK_VIEWER ---');
    let trackViewerRole = await queryRunner.manager.findOne(Role, {
      where: { name: 'TRACK_VIEWER' },
    });

    if (!trackViewerRole) {
      trackViewerRole = queryRunner.manager.create(Role, {
        name: 'TRACK_VIEWER',
        active: true,
      });
      trackViewerRole = await queryRunner.manager.save(trackViewerRole);
      console.log('✅ Rol TRACK_VIEWER creado correctamente.');
    } else {
      console.log('ℹ️  Rol TRACK_VIEWER ya existe.');
    }

    // 2. Definir los permisos por módulo
    // SALES: R (Read) y U (Update)
    // STOCK: U (Update)
    const modulePermissionsMap = new Map<string, string[]>([
      ['SALES', ['R', 'U']],
      ['STOCK', ['U']],
    ]);

    console.log('--- Asignando permisos al rol TRACK_VIEWER ---');

    // 3. Procesar cada módulo y sus permisos
    for (const [moduleName, permissions] of modulePermissionsMap) {
      // Buscar el módulo
      const mod = await queryRunner.manager.findOne(Modul, {
        where: { name: moduleName },
      });

      if (!mod) {
        console.log(`⚠️  Módulo "${moduleName}" no encontrado.`);
        continue;
      }

      // Para cada permiso requerido (R, U)
      for (const permType of permissions) {
        // Buscar el permiso correspondiente
        const permission = await queryRunner.manager.findOne(Permission, {
          where: {
            moduleId: mod.moduleId,
            typePermission: permType as actionsPermissions,
          },
        });

        if (!permission) {
          console.log(`⚠️  Permiso "${permType}" para módulo "${moduleName}" no encontrado.`);
          continue;
        }

        // Verificar si ya existe la asignación rol-permiso
        const existingRolePermission = await queryRunner.manager.findOne(RolePermission, {
          where: {
            roleId: trackViewerRole.roleId,
            permissionId: permission.permissionId,
          },
        });

        if (!existingRolePermission) {
          // Crear la asignación
          const rolePermission = queryRunner.manager.create(RolePermission, {
            roleId: trackViewerRole.roleId,
            permissionId: permission.permissionId,
            active: true,
          });

          await queryRunner.manager.save(rolePermission);
          console.log(`✅ Permiso "${permType}" asignado para el módulo: ${moduleName}`);
        } else {
          console.log(`ℹ️  El permiso "${permType}" para ${moduleName} ya estaba asignado.`);
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

trackViewerRoleSeed();
