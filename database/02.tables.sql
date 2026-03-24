-- clients
CREATE TABLE clients (
    clientId SERIAL PRIMARY KEY,
    names VARCHAR(100) NOT NULL,
    lastnames VARCHAR(100) NOT NULL,
    numberPhone VARCHAR(20),
    ci VARCHAR(20) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    deletedAt TIMESTAMP
);

-- supplier
CREATE TABLE supplier (
    supplierId SERIAL PRIMARY KEY,
    names VARCHAR(100) NOT NULL,
    lastnames VARCHAR(100) NOT NULL,
    ci VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    numberPhone VARCHAR(20),
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    deletedAt TIMESTAMP
);

-- jobs
CREATE TABLE jobs (
    jobId SERIAL PRIMARY KEY,
    names VARCHAR(100) NOT NULL,
    baseSalary DECIMAL(10,2) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    deletedAt TIMESTAMP
);

-- products
CREATE TABLE products (
    productId SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    unitCostLiter DECIMAL(10,2) NOT NULL,
    currentStock DECIMAL(10,2) NOT NULL DEFAULT 0,
    minStock DECIMAL(10,2) NOT NULL DEFAULT 0,
    maxStock DECIMAL(10,2),
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    deletedAt TIMESTAMP
);

-- services
CREATE TABLE services (
    serviceId SERIAL PRIMARY KEY,
    name VARCHAR(40) NOT NULL,
    comissionPercentage DECIMAL(5,2) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    deletedAt TIMESTAMP
);

-- typeVehicle
CREATE TABLE typeVehicle (
    typeVehicleId SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    deletedAt TIMESTAMP
);

-- modules
CREATE TABLE modules (
    moduleId SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    deletedAt TIMESTAMP
);

-- roles
CREATE TABLE roles (
    roleId SERIAL PRIMARY KEY,
    name VARCHAR(40) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    deletedAt TIMESTAMP
);

-- payment_methods
CREATE TABLE payment_methods (
    paymentMethodId SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    deletedAt TIMESTAMP
);

-- categories (nueva tabla)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    typeCategorie type_category NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- =====================================================
-- TABLAS CON DEPENDENCIAS (FOREIGN KEYS)
-- =====================================================

-- permissions (depende de modules)
CREATE TABLE permissions (
    permissionId SERIAL PRIMARY KEY,
    moduleId INTEGER NOT NULL REFERENCES modules(moduleId),
    typePermission actions_permissions NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    deletedAt TIMESTAMP
);

-- roles_permissions (depende de roles y permissions)
CREATE TABLE roles_permissions (
    rolePermissionId SERIAL PRIMARY KEY,
    roleId INTEGER NOT NULL REFERENCES roles(roleId),
    permissionId INTEGER NOT NULL REFERENCES permissions(permissionId),
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    deletedAt TIMESTAMP,
    UNIQUE(roleId, permissionId)
);

-- users (depende de roles)
CREATE TABLE users (
    userId SERIAL PRIMARY KEY,
    roleId INTEGER NOT NULL REFERENCES roles(roleId),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    deletedAt TIMESTAMP
);

-- employees (depende de jobs)
CREATE TABLE employees (
    employeeId SERIAL PRIMARY KEY,
    jobId INTEGER NOT NULL REFERENCES jobs(jobId),
    names VARCHAR(100) NOT NULL,
    lastnames VARCHAR(100) NOT NULL,
    ci VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    numberPhone VARCHAR(20),
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    deletedAt TIMESTAMP
);

-- vehicles (depende de typeVehicle y clients)
CREATE TABLE vehicles (
    vehicleId SERIAL PRIMARY KEY,
    typeVehicleId INTEGER NOT NULL REFERENCES typeVehicle(typeVehicleId),
    ownerId INTEGER NOT NULL REFERENCES clients(clientId),
    plate VARCHAR(20) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    deletedAt TIMESTAMP
);

-- services_type_vehicle (depende de services y typeVehicle)
CREATE TABLE services_type_vehicle (
    serviceTypeVehicleId SERIAL PRIMARY KEY,
    serviceId INTEGER NOT NULL REFERENCES services(serviceId),
    typeVehicleId INTEGER NOT NULL REFERENCES typeVehicle(typeVehicleId),
    price DECIMAL(10,2) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    deletedAt TIMESTAMP,
    UNIQUE(serviceId, typeVehicleId)
);

-- combos
CREATE TABLE combos (
    comboId SERIAL PRIMARY KEY,
    name VARCHAR(40) NOT NULL,
    discountPercentage DECIMAL(5,2) NOT NULL,
    isPromotion BOOLEAN DEFAULT FALSE,
    expirationDate TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    deletedAt TIMESTAMP
);

-- combos_services (depende de combos y services_type_vehicle)
CREATE TABLE combos_services (
    comboServiceId SERIAL PRIMARY KEY,
    comboId INTEGER NOT NULL REFERENCES combos(comboId),
    servicesTypeVehicleId INTEGER NOT NULL REFERENCES services_type_vehicle(serviceTypeVehicleId),
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    deletedAt TIMESTAMP,
    UNIQUE(comboId, servicesTypeVehicleId)
);

-- purchases (depende de supplier y payment_methods)
CREATE TABLE purchases (
    purchaseId SERIAL PRIMARY KEY,
    supplierId INTEGER NOT NULL REFERENCES supplier(supplierId),
    purchaseDate TIMESTAMP NOT NULL DEFAULT NOW(),
    paymentMethodId INTEGER NOT NULL REFERENCES payment_methods(paymentMethodId),
    statusPurchase status_payments NOT NULL DEFAULT 'Pendiente',
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    deletedAt TIMESTAMP
);

-- purchase_details (depende de purchases y products)
CREATE TABLE purchase_details (
    purchaseDetailId SERIAL PRIMARY KEY,
    purchaseId INTEGER NOT NULL REFERENCES purchases(purchaseId),
    productId INTEGER NOT NULL REFERENCES products(productId),
    liters DECIMAL(10,2) NOT NULL,
    pucharsePriceByLiters DECIMAL(10,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- sales (depende de clients, vehicles, payment_methods)
CREATE TABLE sales (
    saleId SERIAL PRIMARY KEY,
    clientId INTEGER NOT NULL REFERENCES clients(clientId),
    vehicleId INTEGER NOT NULL REFERENCES vehicles(vehicleId),
    paymentMethodId INTEGER NOT NULL REFERENCES payment_methods(paymentMethodId),
    statusSale status_payments NOT NULL DEFAULT 'Pendiente',
    stateusWashing washing_status NOT NULL DEFAULT 'En espera',
    saleDate TIMESTAMP NOT NULL DEFAULT NOW(),
    initial_state TEXT,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    deletedAt TIMESTAMP
);

-- sales_details (depende de sales, services_type_vehicle, combos)
CREATE TABLE sales_details (
    saleDetailId SERIAL PRIMARY KEY,
    saleId INTEGER NOT NULL REFERENCES sales(saleId),
    serviceTypeVehicleId INTEGER NOT NULL REFERENCES services_type_vehicle(serviceTypeVehicleId),
    comboOriginId INTEGER REFERENCES combos(comboId),
    salePrice DECIMAL(10,2) NOT NULL,
    note TEXT,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

-- services_assignments (NUEVA TABLA - depende de sales_details y employees)
CREATE TABLE services_assignments (
    assignmentId SERIAL PRIMARY KEY,
    saleDetailId INTEGER NOT NULL REFERENCES sales_details(saleDetailId),
    employeeId INTEGER NOT NULL REFERENCES employees(employeeId),
    assignmentDate TIMESTAMP NOT NULL DEFAULT NOW(),
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT NOW(),
    UNIQUE(saleDetailId, employeeId) -- Evita asignaciones duplicadas
);

-- commissions (AHORA depende de services_assignments)
CREATE TABLE commissions (
    commissionId SERIAL PRIMARY KEY,
    assignmentId INTEGER NOT NULL UNIQUE REFERENCES services_assignments(assignmentId),
    comissionTotal DECIMAL(10,2) NOT NULL,
    statusPaymentComission status_payments NOT NULL DEFAULT 'Pendiente',
    paymentDate DATE,
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT NOW()
);