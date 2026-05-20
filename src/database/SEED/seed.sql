-- ============================================================
-- SEED COMPLETO PARA REPORTES (CATÁLOGO + VENTAS + COMISIONES)
-- ============================================================
BEGIN;

-- ============================================================
-- 1. LIMPIEZA PREVIA (OPCIONAL: descomentar si quieres empezar limpio)
-- ============================================================
-- TRUNCATE commissions, services_assignments, sales_items, sales, product_usage CASCADE;
-- TRUNCATE combos_services, combos, services_type_vehicle, vehicles, employees, payments_methods, types_vehicles, services, products, jobs, suppliers, clients, categories RESTART IDENTITY CASCADE;

-- ============================================================
-- 2. CATEGORÍAS
-- ============================================================
INSERT INTO categories ("name", "type", "description") VALUES 
    ('Lavado de autos',     'S', 'Servicios de lavado para vehículos'),
    ('Detallado premium',   'S', 'Servicios de detailing y encerado'),
    ('Lubricantes',         'P', 'Productos como aceites y lubricantes'),
    ('Limpieza interior',   'P', 'Productos para limpieza de tapicería y plásticos'),
    ('Ambientadores',       'P', 'Aromatizantes y ambientadores para vehículos')
ON CONFLICT ("categoryId") DO NOTHING;

-- ============================================================
-- 3. CLIENTES
-- ============================================================
INSERT INTO clients ("names", "lastnames", "numberPhone", "ci", "email") VALUES 
    ('Carlos', 'Mendoza',   '0412-1234567', 'V12345678', 'carlos.m@mail.com'),
    ('María',  'González',  '0424-9876543', 'V23456789', 'maria.g@mail.com'),
    ('Luis',   'Pérez',     '0416-5554433', 'V34567890', 'luis.p@mail.com'),
    ('Ana',    'Rodríguez', '0426-1112233', 'V45678901', 'ana.r@mail.com'),
    ('Pedro',  'Sánchez',   '0414-3332211', 'V56789012', 'pedro.s@mail.com')
ON CONFLICT ("clientId") DO NOTHING;

-- ============================================================
-- 4. PROVEEDORES
-- ============================================================
INSERT INTO suppliers ("companyName", "rif", "email", "numberPhone") VALUES 
    ('Lubricantes El Rey C.A.',  'J-12345678-9', 'ventas@elrey.com',      '0212-5551122'),
    ('Distribuidora LimpioMax',  'J-98765432-1', 'info@limpiomax.com',    '0241-3334455'),
    ('Aromas Automotrices S.A.', 'J-45678901-2', 'contacto@aromauto.com', '0251-7778899')
ON CONFLICT ("supplierId") DO NOTHING;

-- ============================================================
-- 5. CARGOS (JOBS)
-- ============================================================
INSERT INTO jobs ("name", "baseSalary") VALUES 
    ('Lavador',    120.00),
    ('Detallista', 200.00),
    ('Supervisor', 280.00),
    ('Cajero',     150.00)
ON CONFLICT ("jobId") DO NOTHING;

-- ============================================================
-- 6. PRODUCTOS
-- ============================================================
INSERT INTO products ("categoryId", "name", "unitType", "unitCostLiter", "currentStock", "minStock") VALUES 
    ((SELECT "categoryId" FROM categories WHERE "name" = 'Lubricantes' LIMIT 1), 'Aceite 20W50',           'L', 3.50, 100, 10),
    ((SELECT "categoryId" FROM categories WHERE "name" = 'Lubricantes' LIMIT 1), 'Aceite 10W30',           'L', 4.00, 80,  8),
    ((SELECT "categoryId" FROM categories WHERE "name" = 'Limpieza interior' LIMIT 1), 'Limpiador de tapicería', 'U', 2.20, 50,  5),
    ((SELECT "categoryId" FROM categories WHERE "name" = 'Limpieza interior' LIMIT 1), 'Silicón para tablero',   'U', 1.80, 60,  6),
    ((SELECT "categoryId" FROM categories WHERE "name" = 'Ambientadores' LIMIT 1), 'Ambientador vainilla',   'U', 0.90, 120, 12)
ON CONFLICT ("productId") DO NOTHING;

-- ============================================================
-- 7. SERVICIOS
-- ============================================================
INSERT INTO services ("categoryId", "name", "comissionPercentage") VALUES 
    ((SELECT "categoryId" FROM categories WHERE "name" = 'Lavado de autos' LIMIT 1), 'Lavado básico',                30.00),
    ((SELECT "categoryId" FROM categories WHERE "name" = 'Lavado de autos' LIMIT 1), 'Lavado completo',              35.00),
    ((SELECT "categoryId" FROM categories WHERE "name" = 'Detallado premium' LIMIT 1), 'Encerado',                     40.00),
    ((SELECT "categoryId" FROM categories WHERE "name" = 'Detallado premium' LIMIT 1), 'Pulido de faros',              45.00),
    ((SELECT "categoryId" FROM categories WHERE "name" = 'Detallado premium' LIMIT 1), 'Descontaminación de pintura',  50.00)
ON CONFLICT ("serviceId") DO NOTHING;

-- ============================================================
-- 8. TIPOS DE VEHÍCULO
-- ============================================================
INSERT INTO types_vehicles ("name") VALUES 
    ('Sedán'),
    ('Camioneta'),
    ('Motocicleta'),
    ('Coupé')
ON CONFLICT ("typeVehicleId") DO NOTHING;

-- ============================================================
-- 9. MÉTODOS DE PAGO
-- ============================================================
INSERT INTO payments_methods ("name") VALUES 
    ('Efectivo'),
    ('Tarjeta de débito'),
    ('Tarjeta de crédito'),
    ('Transferencia bancaria')
ON CONFLICT ("paymentMethodId") DO NOTHING;

-- ============================================================
-- 10. EMPLEADOS
-- ============================================================
INSERT INTO employees ("jobId", "names", "lastnames", "ci", "email", "numberPhone") VALUES 
    ((SELECT "jobId" FROM jobs WHERE "name" = 'Lavador' LIMIT 1), 'Javier', 'López',     'V1231231', 'javier.lopez@lavadero.com',     '0412-1111111'),
    ((SELECT "jobId" FROM jobs WHERE "name" = 'Lavador' LIMIT 1), 'Rosa',   'Martínez',  'V2342342', 'rosa.martinez@lavadero.com',    '0412-2222222'),
    ((SELECT "jobId" FROM jobs WHERE "name" = 'Detallista' LIMIT 1), 'Daniel', 'Hernández', 'V3453453', 'daniel.hernandez@lavadero.com', '0414-3333333'),
    ((SELECT "jobId" FROM jobs WHERE "name" = 'Supervisor' LIMIT 1), 'Carmen', 'Díaz',      'V4564564', 'carmen.diaz@lavadero.com',      '0426-4444444'),
    ((SELECT "jobId" FROM jobs WHERE "name" = 'Cajero' LIMIT 1), 'Miguel', 'Rojas',     'V5675675', 'miguel.rojas@lavadero.com',     '0416-5555555')
ON CONFLICT ("employeeId") DO NOTHING;

-- ============================================================
-- 11. VEHÍCULOS
-- ============================================================
INSERT INTO vehicles ("typeVehicleId", "ownerId", "plate") VALUES 
    ((SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Sedán' LIMIT 1), (SELECT "clientId" FROM clients WHERE "ci" = 'V12345678' LIMIT 1), 'ABC123'),
    ((SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Camioneta' LIMIT 1), (SELECT "clientId" FROM clients WHERE "ci" = 'V12345678' LIMIT 1), 'DEF456'),
    ((SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Sedán' LIMIT 1), (SELECT "clientId" FROM clients WHERE "ci" = 'V23456789' LIMIT 1), 'GHI789'),
    ((SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Motocicleta' LIMIT 1), (SELECT "clientId" FROM clients WHERE "ci" = 'V34567890' LIMIT 1), 'JKL012'),
    ((SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Coupé' LIMIT 1), (SELECT "clientId" FROM clients WHERE "ci" = 'V45678901' LIMIT 1), 'MNO345'),
    ((SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Camioneta' LIMIT 1), (SELECT "clientId" FROM clients WHERE "ci" = 'V56789012' LIMIT 1), 'PQR678')
ON CONFLICT ("vehicleId") DO NOTHING;

-- ============================================================
-- 12. PRECIOS POR SERVICIO Y TIPO DE VEHÍCULO
-- ============================================================
INSERT INTO services_type_vehicle ("serviceId", "typeVehicleId", "price") VALUES 
    ((SELECT "serviceId" FROM services WHERE "name" = 'Lavado básico' LIMIT 1), (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Sedán' LIMIT 1), 10.00),
    ((SELECT "serviceId" FROM services WHERE "name" = 'Lavado básico' LIMIT 1), (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Camioneta' LIMIT 1), 15.00),
    ((SELECT "serviceId" FROM services WHERE "name" = 'Lavado básico' LIMIT 1), (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Motocicleta' LIMIT 1), 8.00),
    ((SELECT "serviceId" FROM services WHERE "name" = 'Lavado completo' LIMIT 1), (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Sedán' LIMIT 1), 20.00),
    ((SELECT "serviceId" FROM services WHERE "name" = 'Lavado completo' LIMIT 1), (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Camioneta' LIMIT 1), 28.00),
    ((SELECT "serviceId" FROM services WHERE "name" = 'Encerado' LIMIT 1), (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Sedán' LIMIT 1), 35.00),
    ((SELECT "serviceId" FROM services WHERE "name" = 'Encerado' LIMIT 1), (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Camioneta' LIMIT 1), 45.00),
    ((SELECT "serviceId" FROM services WHERE "name" = 'Pulido de faros' LIMIT 1), (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Sedán' LIMIT 1), 25.00),
    ((SELECT "serviceId" FROM services WHERE "name" = 'Descontaminación de pintura' LIMIT 1), (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Sedán' LIMIT 1), 60.00)
ON CONFLICT ("serviceTypeVehicleId") DO NOTHING;

-- ============================================================
-- 13. COMBOS Y PROMOCIONES
-- ============================================================
INSERT INTO combos ("name", "discountPercentage", "isPromotion", "expirationDate") VALUES 
    ('Combo Verano',   15.00, TRUE,  '2026-09-01 00:00:00'),
    ('Lavado Premium', 10.00, FALSE, NULL),
    ('Super Detallado', 20.00, TRUE,  '2026-12-31 23:59:59')
ON CONFLICT ("comboId") DO NOTHING;

-- Combos - servicios (usando serviceTypeVehicleId)
INSERT INTO combos_services ("comboId", "servicesTypeVehicleId") VALUES 
    ((SELECT "comboId" FROM combos WHERE "name" = 'Combo Verano' LIMIT 1), 
     (SELECT "serviceTypeVehicleId" FROM services_type_vehicle WHERE "serviceId" = (SELECT "serviceId" FROM services WHERE "name" = 'Lavado básico' LIMIT 1) AND "typeVehicleId" = (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Sedán' LIMIT 1) LIMIT 1)),
    ((SELECT "comboId" FROM combos WHERE "name" = 'Combo Verano' LIMIT 1), 
     (SELECT "serviceTypeVehicleId" FROM services_type_vehicle WHERE "serviceId" = (SELECT "serviceId" FROM services WHERE "name" = 'Encerado' LIMIT 1) AND "typeVehicleId" = (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Sedán' LIMIT 1) LIMIT 1)),
    ((SELECT "comboId" FROM combos WHERE "name" = 'Lavado Premium' LIMIT 1), 
     (SELECT "serviceTypeVehicleId" FROM services_type_vehicle WHERE "serviceId" = (SELECT "serviceId" FROM services WHERE "name" = 'Lavado completo' LIMIT 1) AND "typeVehicleId" = (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Sedán' LIMIT 1) LIMIT 1)),
    ((SELECT "comboId" FROM combos WHERE "name" = 'Lavado Premium' LIMIT 1), 
     (SELECT "serviceTypeVehicleId" FROM services_type_vehicle WHERE "serviceId" = (SELECT "serviceId" FROM services WHERE "name" = 'Pulido de faros' LIMIT 1) AND "typeVehicleId" = (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Sedán' LIMIT 1) LIMIT 1)),
    ((SELECT "comboId" FROM combos WHERE "name" = 'Super Detallado' LIMIT 1), 
     (SELECT "serviceTypeVehicleId" FROM services_type_vehicle WHERE "serviceId" = (SELECT "serviceId" FROM services WHERE "name" = 'Lavado completo' LIMIT 1) AND "typeVehicleId" = (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Sedán' LIMIT 1) LIMIT 1)),
    ((SELECT "comboId" FROM combos WHERE "name" = 'Super Detallado' LIMIT 1), 
     (SELECT "serviceTypeVehicleId" FROM services_type_vehicle WHERE "serviceId" = (SELECT "serviceId" FROM services WHERE "name" = 'Encerado' LIMIT 1) AND "typeVehicleId" = (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Sedán' LIMIT 1) LIMIT 1)),
    ((SELECT "comboId" FROM combos WHERE "name" = 'Super Detallado' LIMIT 1), 
     (SELECT "serviceTypeVehicleId" FROM services_type_vehicle WHERE "serviceId" = (SELECT "serviceId" FROM services WHERE "name" = 'Pulido de faros' LIMIT 1) AND "typeVehicleId" = (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Sedán' LIMIT 1) LIMIT 1))
ON CONFLICT DO NOTHING;

-- ============================================================
-- 14. VENTAS (SALES) - DATOS PARA REPORTES
-- ============================================================
-- Abril 2026
INSERT INTO sales ("clientId", "vehicleId", "paymentMethodId", "invoiceNumber", "statusSale", "statusWashing", "saleDate") VALUES 
    ((SELECT "clientId" FROM clients WHERE "ci" = 'V12345678' LIMIT 1), (SELECT "vehicleId" FROM vehicles WHERE "plate" = 'ABC123' LIMIT 1), (SELECT "paymentMethodId" FROM payments_methods WHERE "name" = 'Efectivo' LIMIT 1), 'INV-001', 'P', 'D', '2026-04-10 10:30:00'),
    ((SELECT "clientId" FROM clients WHERE "ci" = 'V23456789' LIMIT 1), (SELECT "vehicleId" FROM vehicles WHERE "plate" = 'GHI789' LIMIT 1), (SELECT "paymentMethodId" FROM payments_methods WHERE "name" = 'Tarjeta de débito' LIMIT 1), 'INV-002', 'P', 'D', '2026-04-15 11:45:00'),
    ((SELECT "clientId" FROM clients WHERE "ci" = 'V34567890' LIMIT 1), (SELECT "vehicleId" FROM vehicles WHERE "plate" = 'JKL012' LIMIT 1), (SELECT "paymentMethodId" FROM payments_methods WHERE "name" = 'Efectivo' LIMIT 1), 'INV-003', 'P', 'D', '2026-04-20 09:15:00'),
    ((SELECT "clientId" FROM clients WHERE "ci" = 'V45678901' LIMIT 1), (SELECT "vehicleId" FROM vehicles WHERE "plate" = 'MNO345' LIMIT 1), (SELECT "paymentMethodId" FROM payments_methods WHERE "name" = 'Transferencia bancaria' LIMIT 1), 'INV-004', 'P', 'D', '2026-04-25 14:20:00'),
    ((SELECT "clientId" FROM clients WHERE "ci" = 'V56789012' LIMIT 1), (SELECT "vehicleId" FROM vehicles WHERE "plate" = 'PQR678' LIMIT 1), (SELECT "paymentMethodId" FROM payments_methods WHERE "name" = 'Efectivo' LIMIT 1), 'INV-005', 'P', 'D', '2026-04-28 16:50:00'),
    -- Mayo 2026 (hoy)
    ((SELECT "clientId" FROM clients WHERE "ci" = 'V12345678' LIMIT 1), (SELECT "vehicleId" FROM vehicles WHERE "plate" = 'DEF456' LIMIT 1), (SELECT "paymentMethodId" FROM payments_methods WHERE "name" = 'Tarjeta de crédito' LIMIT 1), 'INV-006', 'P', 'D', NOW())
ON CONFLICT ("saleId") DO NOTHING;

-- ============================================================
-- 15. ITEMS DE VENTA (SALES_ITEMS)
-- ============================================================
-- Asumiendo que los saleId se generaron en orden 1..6
WITH sale_ids AS (
    SELECT "saleId", "invoiceNumber" FROM sales WHERE "invoiceNumber" IN ('INV-001','INV-002','INV-003','INV-004','INV-005','INV-006')
)
INSERT INTO sales_items ("saleId", "serviceTypeVehicleId", "salePrice", "discount") 
VALUES 
    ((SELECT "saleId" FROM sale_ids WHERE "invoiceNumber" = 'INV-001'), 
     (SELECT "serviceTypeVehicleId" FROM services_type_vehicle WHERE "serviceId" = (SELECT "serviceId" FROM services WHERE "name" = 'Lavado básico' LIMIT 1) AND "typeVehicleId" = (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Sedán' LIMIT 1) LIMIT 1),
     10.00, 0),
    ((SELECT "saleId" FROM sale_ids WHERE "invoiceNumber" = 'INV-002'), 
     (SELECT "serviceTypeVehicleId" FROM services_type_vehicle WHERE "serviceId" = (SELECT "serviceId" FROM services WHERE "name" = 'Lavado completo' LIMIT 1) AND "typeVehicleId" = (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Sedán' LIMIT 1) LIMIT 1),
     20.00, 0),
    ((SELECT "saleId" FROM sale_ids WHERE "invoiceNumber" = 'INV-003'), 
     (SELECT "serviceTypeVehicleId" FROM services_type_vehicle WHERE "serviceId" = (SELECT "serviceId" FROM services WHERE "name" = 'Lavado básico' LIMIT 1) AND "typeVehicleId" = (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Sedán' LIMIT 1) LIMIT 1),
     10.00, 0),
    ((SELECT "saleId" FROM sale_ids WHERE "invoiceNumber" = 'INV-003'), 
     (SELECT "serviceTypeVehicleId" FROM services_type_vehicle WHERE "serviceId" = (SELECT "serviceId" FROM services WHERE "name" = 'Encerado' LIMIT 1) AND "typeVehicleId" = (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Sedán' LIMIT 1) LIMIT 1),
     35.00, 0),
    ((SELECT "saleId" FROM sale_ids WHERE "invoiceNumber" = 'INV-004'), 
     (SELECT "serviceTypeVehicleId" FROM services_type_vehicle WHERE "serviceId" = (SELECT "serviceId" FROM services WHERE "name" = 'Pulido de faros' LIMIT 1) AND "typeVehicleId" = (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Sedán' LIMIT 1) LIMIT 1),
     25.00, 0),
    ((SELECT "saleId" FROM sale_ids WHERE "invoiceNumber" = 'INV-005'), 
     (SELECT "serviceTypeVehicleId" FROM services_type_vehicle WHERE "serviceId" = (SELECT "serviceId" FROM services WHERE "name" = 'Lavado básico' LIMIT 1) AND "typeVehicleId" = (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Sedán' LIMIT 1) LIMIT 1),
     10.00, 0),
    ((SELECT "saleId" FROM sale_ids WHERE "invoiceNumber" = 'INV-006'), 
     (SELECT "serviceTypeVehicleId" FROM services_type_vehicle WHERE "serviceId" = (SELECT "serviceId" FROM services WHERE "name" = 'Lavado completo' LIMIT 1) AND "typeVehicleId" = (SELECT "typeVehicleId" FROM types_vehicles WHERE "name" = 'Camioneta' LIMIT 1) LIMIT 1),
     28.00, 0)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 16. ASIGNACIÓN DE EMPLEADOS A CADA ITEM
-- ============================================================
INSERT INTO services_assignments ("saleItemId", "employeeId", "notes")
SELECT si."saleItemId", e."employeeId", 'Asignación automática desde seed'
FROM sales_items si
CROSS JOIN (SELECT "employeeId" FROM employees WHERE "employeeId" = 1 LIMIT 1) e
WHERE NOT EXISTS (SELECT 1 FROM services_assignments sa WHERE sa."saleItemId" = si."saleItemId")
ON CONFLICT ("saleItemId", "employeeId") DO NOTHING;

-- ============================================================
-- 17. COMISIONES (BASADAS EN EL PORCENTAJE DEL SERVICIO)
-- ============================================================
INSERT INTO commissions ("serviceAssigmentId", "conmissionTotal", "statusPaymentConmission", "paymentDate")
SELECT 
    sa."serviceAssigmentId",
    si."salePrice" * (s."comissionPercentage" / 100),
    'P',
    NOW()
FROM services_assignments sa
JOIN sales_items si ON sa."saleItemId" = si."saleItemId"
JOIN services_type_vehicle stv ON si."serviceTypeVehicleId" = stv."serviceTypeVehicleId"
JOIN services s ON stv."serviceId" = s."serviceId"
WHERE NOT EXISTS (SELECT 1 FROM commissions c WHERE c."serviceAssigmentId" = sa."serviceAssigmentId")
ON CONFLICT ("commissionId") DO NOTHING;

-- ============================================================
-- 18. USO DE PRODUCTOS (OPCIONAL, PARA REPORTES DE STOCK)
-- ============================================================
INSERT INTO product_usage ("productId", "quantityUsed", "unitType")
SELECT p."productId", 5.0, p."unitType"
FROM products p
WHERE p."name" IN ('Aceite 20W50', 'Limpiador de tapicería')
ON CONFLICT DO NOTHING;

COMMIT;