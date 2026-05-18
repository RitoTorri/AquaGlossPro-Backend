-- W: En espera
-- I: En proceso 
-- D: Completado
-- C: Cancelado
CREATE TYPE washing_status AS ENUM ('W', 'I', 'D', 'C');

-- W = Waiting
-- P = Paid
-- C = Cancelled
CREATE TYPE status_payments AS ENUM ('W', 'P', 'C');

-- C = Create  
-- U = Update
-- D = Delete
-- R = Read
CREATE TYPE actions_permissions AS ENUM('C','R','U','D');

-- P = Producto
-- S = Servicio
CREATE TYPE type_categories AS ENUM('P','S');

-- L = Litros
-- G = Galones
-- U = Unidades
CREATE TYPE type_unit AS ENUM('L','G','U');