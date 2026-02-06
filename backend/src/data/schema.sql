-- ==========================================================
-- 1. CONFIGURACIÓN INICIAL Y EXTENSIONES
-- ==========================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================================
-- 2. CREACIÓN DE TIPOS ENUM (CON PROTECCIÓN SI YA EXISTEN)
-- ==========================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_enum') THEN
        CREATE TYPE gender_enum AS ENUM ('male', 'female');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_user_enum') THEN
        CREATE TYPE status_user_enum AS ENUM ('active', 'suspended', 'deleted');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum') THEN
        CREATE TYPE role_enum AS ENUM ('administrator', 'oficial', 'functionary', 'civil');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'judgment_state_enum') THEN
        CREATE TYPE judgment_state_enum AS ENUM ('process', 'closed', 'suspended');
    END IF;
END $$;

-- ==========================================================
-- 3. INFRAESTRUCTURA GEOGRÁFICA (CATÁLOGOS)
-- ==========================================================
CREATE TABLE IF NOT EXISTS "Country" (
  "Id_country" SERIAL PRIMARY KEY,
  "name_country" VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "State" (
  "Id_state" SERIAL PRIMARY KEY,
  "Id_country" INT NOT NULL REFERENCES "Country"("Id_country") ON DELETE CASCADE,
  "name_state" VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Municipality" (
  "Id_municipality" SERIAL PRIMARY KEY,
  "Id_state" INT NOT NULL REFERENCES "State"("Id_state") ON DELETE CASCADE,
  "name_municipality" VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Parish" (
  "Id_parish" SERIAL PRIMARY KEY,
  "Id_municipality" INT NOT NULL REFERENCES "Municipality"("Id_municipality") ON DELETE CASCADE,
  "name_parish" VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "City" (
  "Id_city" SERIAL PRIMARY KEY,
  "Id_parish" INT NOT NULL REFERENCES "Parish"("Id_parish") ON DELETE CASCADE,
  "name_city" VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Zone" (
  "Id_zone" SERIAL PRIMARY KEY,
  "Id_city" INT NOT NULL REFERENCES "City"("Id_city") ON DELETE CASCADE,
  "name_zone" VARCHAR(100) NOT NULL,
  "latitude" DECIMAL(10, 8),
  "longitude" DECIMAL(11, 8)
);

-- ==========================================================
-- 4. DIRECCIONES Y ENTIDADES LOCALES (UUID)
-- ==========================================================
CREATE TABLE IF NOT EXISTS "Address" (
  "Id_address" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "Id_zone" INT NOT NULL REFERENCES "Zone"("Id_zone"),
  "name_address" VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Office" (
  "Id_office" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "Id_address" UUID NOT NULL REFERENCES "Address"("Id_address"),
  "name_office" VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Court" (
  "Id_court" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "Id_address" UUID NOT NULL REFERENCES "Address"("Id_address"),
  "name_court" VARCHAR(100) NOT NULL,
  "jurisdiction_type" VARCHAR(50) NOT NULL
);

-- ==========================================================
-- 5. SEGURIDAD Y USUARIOS (BASE)
-- ==========================================================
CREATE TABLE IF NOT EXISTS "Roles" (
  "Id_rol" SERIAL PRIMARY KEY,
  "type_rol" role_enum UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "User" (
  "Id_user" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "dni" VARCHAR(20) UNIQUE NOT NULL,
  "dni_photo" VARCHAR(255),
  "first_name" VARCHAR(100) NOT NULL,
  "last_name" VARCHAR(100) NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "number_phone" VARCHAR(20),
  "email" VARCHAR(100) UNIQUE NOT NULL,
  "date_birth" DATE NOT NULL,
  "gender" gender_enum NOT NULL,
  "status_user" status_user_enum DEFAULT 'active',
  "Id_address" UUID REFERENCES "Address"("Id_address"),
  "Id_rol" INT NOT NULL REFERENCES "Roles"("Id_rol"),
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 6. ESPECIALIZACIÓN POLICIAL
-- ==========================================================
CREATE TABLE IF NOT EXISTS "Police_Unit" (
  "Id_unit" SERIAL PRIMARY KEY,
  "name_unit" VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "Police_Officer" (
  "Id_user" UUID PRIMARY KEY REFERENCES "User"("Id_user") ON DELETE CASCADE,
  "badge_number" VARCHAR(20) UNIQUE NOT NULL,
  "rank" VARCHAR(50) NOT NULL,
  "Id_unit" INT NOT NULL REFERENCES "Police_Unit"("Id_unit")
);

-- ==========================================================
-- 7. LÓGICA DE JUICIOS, EVIDENCIAS Y EXPEDIENTES
-- ==========================================================
CREATE TABLE IF NOT EXISTS "Judgment" (
  "Id_judgment" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "Id_court" UUID NOT NULL REFERENCES "Court"("Id_court"),
  "date_judgment" DATE DEFAULT CURRENT_DATE,
  "state" judgment_state_enum NOT NULL DEFAULT 'process',
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Resolution" (
  "Id_resolution" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "Id_judgment" UUID NOT NULL REFERENCES "Judgment"("Id_judgment") ON DELETE CASCADE,
  "resolution" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Expedient" (
  "Id_expedient" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "Id_resolution" UUID REFERENCES "Resolution"("Id_resolution"),
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Evidence" (
  "Id_evidence" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "Id_address" UUID NOT NULL REFERENCES "Address"("Id_address"),
  "police_report" TEXT NOT NULL,
  "multimedia_url" VARCHAR(255),
  "date_evidence" DATE NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 8. RELACIONES MUCHOS A MUCHOS (TABLAS PIVOTE)
-- ==========================================================
CREATE TABLE IF NOT EXISTS "office_expedient" (
  "Id_office" UUID NOT NULL REFERENCES "Office"("Id_office") ON DELETE CASCADE,
  "Id_expedient" UUID NOT NULL REFERENCES "Expedient"("Id_expedient") ON DELETE CASCADE,
  PRIMARY KEY ("Id_office", "Id_expedient")
);

CREATE TABLE IF NOT EXISTS "evidence_expedient" (
  "Id_evidence" UUID NOT NULL REFERENCES "Evidence"("Id_evidence") ON DELETE CASCADE,
  "Id_expedient" UUID NOT NULL REFERENCES "Expedient"("Id_expedient") ON DELETE CASCADE,
  PRIMARY KEY ("Id_evidence", "Id_expedient")
);

CREATE TABLE IF NOT EXISTS "judgment_user" (
  "Id_judgment" UUID NOT NULL REFERENCES "Judgment"("Id_judgment") ON DELETE CASCADE,
  "Id_user" UUID NOT NULL REFERENCES "User"("Id_user") ON DELETE CASCADE,
  PRIMARY KEY ("Id_judgment", "Id_user")
);

-- ==========================================================
-- 9. TRIGGERS AUTOMÁTICOS PARA UPDATED_AT
-- ==========================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE OR REPLACE FUNCTION tr_update_user_func() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$ LANGUAGE 'plpgsql';
DROP TRIGGER IF EXISTS tr_update_user ON "User";
CREATE TRIGGER tr_update_user BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION tr_update_user_func();

CREATE OR REPLACE FUNCTION tr_update_judgment_func() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$ LANGUAGE 'plpgsql';
DROP TRIGGER IF EXISTS tr_update_judgment ON "Judgment";
CREATE TRIGGER tr_update_judgment BEFORE UPDATE ON "Judgment" FOR EACH ROW EXECUTE FUNCTION tr_update_judgment_func();

CREATE OR REPLACE FUNCTION tr_update_expedient_func() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$ LANGUAGE 'plpgsql';
DROP TRIGGER IF EXISTS tr_update_expedient ON "Expedient";
CREATE TRIGGER tr_update_expedient BEFORE UPDATE ON "Expedient" FOR EACH ROW EXECUTE FUNCTION tr_update_expedient_func();

CREATE OR REPLACE FUNCTION tr_update_evidence_func() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$ LANGUAGE 'plpgsql';
DROP TRIGGER IF EXISTS tr_update_evidence ON "Evidence";
CREATE TRIGGER tr_update_evidence BEFORE UPDATE ON "Evidence" FOR EACH ROW EXECUTE FUNCTION tr_update_evidence_func();
