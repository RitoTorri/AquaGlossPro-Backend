import { SetMetadata } from '@nestjs/common';

// Definimos una clave para identificar estos metadatos
export const PERMISSION_KEY = 'permissions';

// Este decorador recibirá el método y el nombre
export const CheckPermission = (action: string, name: string) =>
  SetMetadata(PERMISSION_KEY, { action, name });