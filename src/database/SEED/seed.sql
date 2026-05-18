BEGIN;

-- =============================================
-- CATEGORÍAS
-- =============================================
INSERT INTO categories ("name", "type", "description")
VALUES 
    ('Lavado de autos',     'S', 'Servicios de lavado para vehículos'),
    ('Detallado premium',   'S', 'Servicios de detailing y encerado'),
    ('Lubricantes',         'P', 'Productos como aceites y lubricantes'),
    ('Limpieza interior',   'P', 'Productos para limpieza de tapicería y plásticos'),
    ('Ambientadores',       'P', 'Aromatizantes y ambientadores para vehículos');

-- =============================================
-- CLIENTES
-- =============================================
INSERT INTO clients ("names", "lastnames", "numberPhone", "ci")
VALUES 
    ('Carlos', 'Mendoza',   '0412-1234567', 'V12345678'),
    ('María',  'González',  '0424-9876543', 'V23456789'),
    ('Luis',   'Pérez',     '0416-5554433', 'V34567890'),
    ('Ana',    'Rodríguez', '0426-1112233', 'V45678901'),
    ('Pedro',  'Sánchez',   '0414-3332211', 'V56789012');

-- =============================================
-- PROVEEDORES
-- =============================================
INSERT INTO suppliers ("companyName", "rif", "email", "numberPhone")
VALUES 
    ('Lubricantes El Rey C.A.',  'J-12345678-9', 'ventas@elrey.com',      '0212-5551122'),
    ('Distribuidora LimpioMax',  'J-98765432-1', 'info@limpiomax.com',    '0241-3334455'),
    ('Aromas Automotrices S.A.', 'J-45678901-2', 'contacto@aromauto.com', '0251-7778899');

-- =============================================
-- CARGOS
-- =============================================
INSERT INTO jobs ("name", "baseSalary")
VALUES 
    ('Lavador',    120.00),
    ('Detallista', 200.00),
    ('Supervisor', 280.00),
    ('Cajero',     150.00);

-- =============================================
-- PRODUCTOS
-- =============================================
INSERT INTO products ("categoryId", "name", "unitType", "unitCostLiter", "currentStock", "minStock")
VALUES 
    (3, 'Aceite 20W50',           'L', 3.50, 100, 10),
    (3, 'Aceite 10W30',           'L', 4.00, 80,  8),
    (4, 'Limpiador de tapicería', 'U', 2.20, 50,  5),
    (4, 'Silicón para tablero',   'U', 1.80, 60,  6),
    (5, 'Ambientador vainilla',   'U', 0.90, 120, 12);

-- =============================================
-- SERVICIOS
-- =============================================
INSERT INTO services ("categoryId", "name", "comissionPercentage")
VALUES 
    (1, 'Lavado básico',                30.00),
    (1, 'Lavado completo',              35.00),
    (2, 'Encerado',                     40.00),
    (2, 'Pulido de faros',              45.00),
    (2, 'Descontaminación de pintura',  50.00);

-- =============================================
-- TIPOS DE VEHÍCULOS Y MÉTODOS DE PAGO
-- =============================================
INSERT INTO types_vehicles ("name")
VALUES ('Sedán'), ('Camioneta'), ('Motocicleta'), ('Coupé');

INSERT INTO payments_methods ("name")
VALUES ('Efectivo'), ('Tarjeta de débito'), ('Tarjeta de crédito'), ('Transferencia bancaria');

-- =============================================
-- EMPLEADOS
-- =============================================
INSERT INTO employees ("jobId", "names", "lastnames", "ci", "email", "numberPhone")
VALUES 
    (1, 'Javier', 'López',     'V1231231', 'javier.lopez@lavadero.com',     '0412-1111111'),
    (1, 'Rosa',   'Martínez',  'V2342342', 'rosa.martinez@lavadero.com',    '0412-2222222'),
    (2, 'Daniel', 'Hernández', 'V3453453', 'daniel.hernandez@lavadero.com', '0414-3333333'),
    (3, 'Carmen', 'Díaz',      'V4564564', 'carmen.diaz@lavadero.com',      '0426-4444444'),
    (4, 'Miguel', 'Rojas',     'V5675675', 'miguel.rojas@lavadero.com',     '0416-5555555');

-- =============================================
-- VEHÍCULOS
-- =============================================
INSERT INTO vehicles ("typeVehicleId", "ownerId", "plate")
VALUES 
    (1, 1, 'ABC123'),
    (2, 1, 'DEF456'),
    (1, 2, 'GHI789'),
    (3, 3, 'JKL012'),
    (4, 4, 'MNO345'),
    (2, 5, 'PQR678');

-- =============================================
-- RELACIÓN SERVICIO / TIPO VEHÍCULO (PRECIOS)
-- =============================================
INSERT INTO services_type_vehicle ("serviceId", "typeVehicleId", "price")
VALUES 
    (1, 1, 10.00), -- Lavado básico - Sedán
    (1, 2, 15.00), -- Lavado básico - Camioneta
    (1, 3,  8.00), -- Lavado básico - Motocicleta
    (2, 1, 20.00), -- Lavado completo - Sedán
    (2, 2, 28.00), -- Lavado completo - Camioneta
    (3, 1, 35.00), -- Encerado - Sedán
    (3, 2, 45.00), -- Encerado - Camioneta
    (4, 1, 25.00), -- Pulido de faros - Sedán
    (5, 1, 60.00); -- Descontaminación - Sedán

-- =============================================
-- COMBOS Y PROMOCIONES
-- =============================================
INSERT INTO combos ("name", "discountPercentage", "isPromotion", "expirationDate")
VALUES 
    ('Combo Verano',   15.00, TRUE,  '2026-09-01 00:00:00'),
    ('Lavado Premium', 10.00, FALSE, NULL),
    ('Super Detallado', 20.00, TRUE,  '2026-12-31 23:59:59');

-- =============================================
-- DETALLE DE COMBOS (RELACIÓN CON SERVICIOS)
-- =============================================
INSERT INTO combos_services ("comboId", "servicesTypeVehicleId")
VALUES 
    (1, 1), -- Combo Verano → Lavado básico Sedán
    (1, 6), -- Combo Verano → Encerado Sedán
    (2, 4), -- Lavado Premium → Lavado completo Sedán
    (2, 8), -- Lavado Premium → Pulido de faros Sedán
    (3, 4), -- Super Detallado → Lavado completo Sedán
    (3, 6), -- Super Detallado → Encerado Sedán
    (3, 8); -- Super Detallado → Pulido de faros Sedán

COMMIT;