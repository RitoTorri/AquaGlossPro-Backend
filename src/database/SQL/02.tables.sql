-- categories
CREATE TABLE
    IF NOT EXISTS categories (
        "categoryId" SERIAL PRIMARY KEY,
        "name" VARCHAR(100) NOT NULL,
        "type" type_categories NOT NULL DEFAULT 'P',
        "description" TEXT,
        "active" BOOLEAN DEFAULT TRUE,
        "createdAt" TIMESTAMP DEFAULT NOW (),
        "updatedAt" TIMESTAMP DEFAULT NULL,
        "deletedAt" TIMESTAMP DEFAULT NULL
    );

-- clients
CREATE TABLE
    IF NOT EXISTS clients (
        "clientId" SERIAL PRIMARY KEY,
        "names" VARCHAR(100) NOT NULL,
        "lastnames" VARCHAR(100) NOT NULL,
        "numberPhone" VARCHAR(20) UNIQUE NOT NULL,
        "ci" VARCHAR(20) UNIQUE NOT NULL,
        "email" VARCHAR(100) UNIQUE DEFAULT NULL,
        "active" BOOLEAN DEFAULT TRUE,
        "createdAt" TIMESTAMP DEFAULT NOW (),
        "updatedAt" TIMESTAMP DEFAULT NULL,
        "deletedAt" TIMESTAMP DEFAULT NULL
    );

-- suppliers
CREATE TABLE
    IF NOT EXISTS suppliers (
        "supplierId" SERIAL PRIMARY KEY,
        "companyName" VARCHAR(100) NOT NULL,
        "rif" VARCHAR(20) UNIQUE NOT NULL,
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "numberPhone" VARCHAR(20) UNIQUE NOT NULL,
        "active" BOOLEAN DEFAULT TRUE,
        "createdAt" TIMESTAMP DEFAULT NOW (),
        "updatedAt" TIMESTAMP DEFAULT NULL,
        "deletedAt" TIMESTAMP DEFAULT NULL
    );

-- jobs
CREATE TABLE
    IF NOT EXISTS jobs (
        "jobId" SERIAL PRIMARY KEY,
        "name" VARCHAR(100) NOT NULL,
        "baseSalary" DECIMAL(10, 2) NOT NULL,
        "active" BOOLEAN DEFAULT TRUE,
        "createdAt" TIMESTAMP DEFAULT NOW (),
        "updatedAt" TIMESTAMP DEFAULT NULL,
        "deletedAt" TIMESTAMP DEFAULT NULL
    );

-- products
CREATE TABLE
    IF NOT EXISTS products (
        "productId" SERIAL PRIMARY KEY,
        "categoryId" INTEGER NOT NULL REFERENCES categories ("categoryId"),
        "name" VARCHAR(100) NOT NULL UNIQUE,
        "unitType" type_unit NOT NULL DEFAULT 'L',
        "unitCostLiter" DECIMAL(10, 2) NOT NULL DEFAULT 0,
        "currentStock" DECIMAL(10, 2) NOT NULL DEFAULT 0,
        "minStock" DECIMAL(10, 2) NOT NULL DEFAULT 0,
        "active" BOOLEAN DEFAULT TRUE,
        "createdAt" TIMESTAMP DEFAULT NOW (),
        "updatedAt" TIMESTAMP DEFAULT NULL,
        "deletedAt" TIMESTAMP DEFAULT NULL
    );

-- services
CREATE TABLE
    IF NOT EXISTS services (
        "serviceId" SERIAL PRIMARY KEY,
        "categoryId" INTEGER NOT NULL REFERENCES categories ("categoryId"),
        "name" VARCHAR(40) NOT NULL,
        "comissionPercentage" DECIMAL(5, 2) NOT NULL,
        "active" BOOLEAN DEFAULT TRUE,
        "createdAt" TIMESTAMP DEFAULT NOW (),
        "updatedAt" TIMESTAMP DEFAULT NULL,
        "deletedAt" TIMESTAMP DEFAULT NULL
    );

-- typeVehicle
CREATE TABLE
    IF NOT EXISTS types_vehicles (
        "typeVehicleId" SERIAL PRIMARY KEY,
        "name" VARCHAR(50) NOT NULL,
        "active" BOOLEAN DEFAULT TRUE,
        "createdAt" TIMESTAMP DEFAULT NOW (),
        "updatedAt" TIMESTAMP DEFAULT NULL,
        "deletedAt" TIMESTAMP DEFAULT NULL
    );

-- modules
CREATE TABLE
    IF NOT EXISTS modules (
        "moduleId" SERIAL PRIMARY KEY,
        "name" VARCHAR(50) NOT NULL,
        "active" BOOLEAN DEFAULT TRUE,
        "createdAt" TIMESTAMP DEFAULT NOW (),
        "updatedAt" TIMESTAMP DEFAULT NULL,
        "deletedAt" TIMESTAMP DEFAULT NULL
    );

-- roles
CREATE TABLE
    IF NOT EXISTS roles (
        "roleId" SERIAL PRIMARY KEY,
        "name" VARCHAR(40) NOT NULL,
        "active" BOOLEAN DEFAULT TRUE,
        "createdAt" TIMESTAMP DEFAULT NOW (),
        "updatedAt" TIMESTAMP DEFAULT NULL,
        "deletedAt" TIMESTAMP DEFAULT NULL
    );

-- payments_methods
CREATE TABLE
    IF NOT EXISTS payments_methods (
        "paymentMethodId" SERIAL PRIMARY KEY,
        "name" VARCHAR(50) NOT NULL UNIQUE,
        "active" BOOLEAN DEFAULT TRUE,
        "createdAt" TIMESTAMP DEFAULT NOW (),
        "updatedAt" TIMESTAMP DEFAULT NULL,
        "deletedAt" TIMESTAMP DEFAULT NULL
    );

-- =====================================================
-- TABLAS CON DEPENDENCIAS (FOREIGN KEYS)
-- =====================================================
-- permissions
CREATE TABLE
    IF NOT EXISTS permissions (
        "permissionId" SERIAL PRIMARY KEY,
        "moduleId" INTEGER NOT NULL REFERENCES modules ("moduleId"),
        "typePermission" actions_permissions NOT NULL,
        "active" BOOLEAN DEFAULT TRUE,
        "createdAt" TIMESTAMP DEFAULT NOW ()
    );

-- roles_permissions
CREATE TABLE
    IF NOT EXISTS roles_permissions (
        "rolePermissionId" SERIAL PRIMARY KEY,
        "roleId" INTEGER NOT NULL REFERENCES roles ("roleId"),
        "permissionId" INTEGER NOT NULL REFERENCES permissions ("permissionId"),
        "active" BOOLEAN DEFAULT TRUE,
        "createdAt" TIMESTAMP DEFAULT NOW (),
        "updatedAt" TIMESTAMP DEFAULT NULL,
        "deletedAt" TIMESTAMP DEFAULT NULL,
        UNIQUE ("roleId", "permissionId")
    );

-- users
CREATE TABLE
    IF NOT EXISTS users (
        "userId" SERIAL PRIMARY KEY,
        "roleId" INTEGER NOT NULL REFERENCES roles ("roleId"),
        "name" VARCHAR(100) NOT NULL,
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "password" VARCHAR(255) NOT NULL,
        "active" BOOLEAN DEFAULT TRUE,
        "createdAt" TIMESTAMP DEFAULT NOW (),
        "updatedAt" TIMESTAMP DEFAULT NULL,
        "deletedAt" TIMESTAMP DEFAULT NULL
    );

-- employees
CREATE TABLE
    IF NOT EXISTS employees (
        "employeeId" SERIAL PRIMARY KEY,
        "jobId" INTEGER NOT NULL REFERENCES jobs ("jobId"),
        "names" VARCHAR(100) NOT NULL,
        "lastnames" VARCHAR(100) NOT NULL,
        "ci" VARCHAR(20) UNIQUE NOT NULL,
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "numberPhone" VARCHAR(20) UNIQUE NOT NULL,
        "active" BOOLEAN DEFAULT TRUE,
        "createdAt" TIMESTAMP DEFAULT NOW (),
        "updatedAt" TIMESTAMP DEFAULT NULL,
        "deletedAt" TIMESTAMP DEFAULT NULL
    );

-- vehicles
CREATE TABLE
    IF NOT EXISTS vehicles (
        "vehicleId" SERIAL PRIMARY KEY,
        "typeVehicleId" INTEGER NOT NULL REFERENCES types_vehicles ("typeVehicleId"),
        "ownerId" INTEGER NOT NULL REFERENCES clients ("clientId"),
        "plate" VARCHAR(20) UNIQUE NOT NULL,
        "active" BOOLEAN DEFAULT TRUE,
        "createdAt" TIMESTAMP DEFAULT NOW (),
        "updatedAt" TIMESTAMP DEFAULT NULL,
        "deletedAt" TIMESTAMP DEFAULT NULL
    );

-- services_type_vehicle
CREATE TABLE
    IF NOT EXISTS services_type_vehicle (
        "serviceTypeVehicleId" SERIAL PRIMARY KEY,
        "serviceId" INTEGER NOT NULL REFERENCES services ("serviceId"),
        "typeVehicleId" INTEGER NOT NULL REFERENCES types_vehicles ("typeVehicleId"),
        "price" DECIMAL(10, 2) NOT NULL,
        "active" BOOLEAN DEFAULT TRUE,
        "createdAt" TIMESTAMP DEFAULT NOW (),
        "updatedAt" TIMESTAMP DEFAULT NULL,
        "deletedAt" TIMESTAMP DEFAULT NULL,
        UNIQUE ("serviceId", "typeVehicleId")
    );

-- combos
CREATE TABLE
    IF NOT EXISTS combos (
        "comboId" SERIAL PRIMARY KEY,
        "name" VARCHAR(40) NOT NULL,
        "discountPercentage" DECIMAL(5, 2) NOT NULL DEFAULT 0,
        "isPromotion" BOOLEAN NOT NULL DEFAULT FALSE,
        "expirationDate" TIMESTAMP DEFAULT NULL,
        "active" BOOLEAN DEFAULT TRUE,
        "createdAt" TIMESTAMP DEFAULT NOW (),
        "updatedAt" TIMESTAMP DEFAULT NULL,
        "deletedAt" TIMESTAMP DEFAULT NULL
    );

-- combos_services
CREATE TABLE
    IF NOT EXISTS combos_services (
        "comboServiceId" SERIAL PRIMARY KEY,
        "comboId" INTEGER NOT NULL REFERENCES combos ("comboId"),
        "serviceId" INTEGER NOT NULL REFERENCES services ("serviceId"),
        "active" BOOLEAN DEFAULT TRUE,
        "createdAt" TIMESTAMP DEFAULT NOW (),
        "updatedAt" TIMESTAMP DEFAULT NULL,
        "deletedAt" TIMESTAMP DEFAULT NULL,
        UNIQUE ("comboId", "serviceId")
    );

-- purchases
CREATE TABLE
    IF NOT EXISTS purchases (
        "purchaseId" SERIAL PRIMARY KEY,
        "supplierId" INTEGER NOT NULL REFERENCES suppliers ("supplierId"),
        "paymentMethodId" INTEGER NOT NULL REFERENCES payments_methods ("paymentMethodId"),
        "invoiceNumber" VARCHAR(30) UNIQUE NOT NULL,
        "totalAmount" DECIMAL(10, 2) NOT NULL,
        "purchaseStatus" status_payments NOT NULL DEFAULT 'W',
        "purchaseDate" TIMESTAMP NOT NULL DEFAULT NOW (),
        "createdAt" TIMESTAMP DEFAULT NOW (),
        "updatedAt" TIMESTAMP DEFAULT NULL,
        "deletedAt" TIMESTAMP DEFAULT NULL
    );

-- purchases_items
CREATE TABLE
    IF NOT EXISTS purchases_items (
        "purchaseItemId" SERIAL PRIMARY KEY,
        "purchaseId" INTEGER NOT NULL REFERENCES purchases ("purchaseId"),
        "productId" INTEGER NOT NULL REFERENCES products ("productId"),
        "quantity" DECIMAL(10, 2) NOT NULL,
        "unitPrice" DECIMAL(10, 2) NOT NULL,
        "subtotal" DECIMAL(10, 2) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW ()
    );

-- sales
CREATE TABLE
    IF NOT EXISTS sales (
        "saleId" SERIAL PRIMARY KEY,
        "clientId" INTEGER NOT NULL REFERENCES clients ("clientId"),
        "vehicleId" INTEGER NOT NULL REFERENCES vehicles ("vehicleId"),
        "paymentMethodId" INTEGER NOT NULL REFERENCES payments_methods ("paymentMethodId"),
        "invoiceNumber" VARCHAR(30) UNIQUE NOT NULL,
        "statusSale" status_payments NOT NULL DEFAULT 'W',
        "statusWashing" washing_status NOT NULL DEFAULT 'W',
        "saleDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "initialState" TEXT DEFAULT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW (),
        "updatedAt" TIMESTAMP DEFAULT NULL
    );

-- sales_items
CREATE TABLE
    IF NOT EXISTS sales_items (
        "saleItemId" SERIAL PRIMARY KEY,
        "saleId" INTEGER NOT NULL REFERENCES sales ("saleId"),
        "serviceTypeVehicleId" INTEGER NOT NULL REFERENCES services_type_vehicle ("serviceTypeVehicleId"),
        "comboOriginId" INTEGER REFERENCES combos ("comboId"),
        "salePrice" DECIMAL(10, 2) NOT NULL,
        "discount" DECIMAL(10, 2) DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT NOW (),
        UNIQUE ("saleId", "serviceTypeVehicleId", "comboOriginId")
    );

-- services_assignments
CREATE TABLE
    IF NOT EXISTS services_assignments (
        "serviceAssigmentId" SERIAL PRIMARY KEY,
        "saleItemId" INTEGER NOT NULL REFERENCES sales_items ("saleItemId"),
        "employeeId" INTEGER NOT NULL REFERENCES employees ("employeeId"),
        "notes" TEXT DEFAULT NULL,
        "active" BOOLEAN DEFAULT TRUE,
        "assignmentDate" TIMESTAMP NOT NULL DEFAULT NOW (),
        "createdAt" TIMESTAMP DEFAULT NOW (),
        "updatedAt" TIMESTAMP DEFAULT NULL,
        UNIQUE ("saleItemId", "employeeId")
    );

-- commissions
CREATE TABLE
    IF NOT EXISTS commissions (
        "commissionId" SERIAL PRIMARY KEY,
        "serviceAssigmentId" INTEGER NOT NULL UNIQUE REFERENCES services_assignments ("serviceAssigmentId"),
        "conmissionTotal" DECIMAL(10, 2) NOT NULL,
        "statusPaymentConmission" status_payments NOT NULL DEFAULT 'W',
        "paymentDate" TIMESTAMP DEFAULT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW (),
        "updatedAt" TIMESTAMP DEFAULT NULL
    );

--  Product Usage
CREATE TABLE product_usage (
    "productUsageId" SERIAL PRIMARY KEY,
    "productId" INTEGER NOT NULL REFERENCES products("productId") ON DELETE CASCADE,
    "quantityUsed" NUMERIC(10, 2) NOT NULL,
    "unitType" type_unit NOT NULL DEFAULT 'L',
    "createdAt" TIMESTAMP DEFAULT NOW ()
);