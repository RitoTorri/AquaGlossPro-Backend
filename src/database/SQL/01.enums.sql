-- E: En espera
-- P: En proceso 
-- C: Completado
-- X: Cancelado
CREATE TYPE washing_status AS ENUM ('E', 'P', 'C', 'X');

-- P = Pendiente
-- G = Pagado
-- X = Cancelado
CREATE TYPE status_payments AS ENUM ('P', 'G', 'X');

-- C = Create  
-- U = Update
-- D = Delete
-- R = Read
CREATE TYPE actions_permissions AS ENUM('C','U','D','R');

-- P = Producto
-- S = Servicio
CREATE TYPE type_categories AS ENUM('P','S');

-- L = Litros
-- G = Galones
-- U = Unidades
CREATE TYPE type_unit AS ENUM('L','G','U');