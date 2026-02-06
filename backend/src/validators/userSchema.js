const { z } = require('zod');

// Enums matching the database
const GenderEnum = z.enum(['male', 'female']);
const StatusUserEnum = z.enum(['active', 'suspended', 'deleted']);
const RoleEnum = z.enum(['administrator', 'oficial', 'functionary', 'civil']);

const baseUserSchema = z.object({
  dni: z.string().min(5, "DNI must be at least 5 characters long").max(20),
  first_name: z.string().min(2, "Name is too short").max(100),
  last_name: z.string().min(2, "Last name is too short").max(100),
  email: z.string().email("Invalid email").max(100),
  password: z.string().min(6, "Password must be at least 6 characters long").max(255),
  number_phone: z.string().max(20).optional().nullable(),
  date_birth: z.preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
  }, z.date()),
  gender: GenderEnum,
  status_user: StatusUserEnum.default('active'),
  Id_address: z.string().uuid().optional().nullable(),
});

// For POST /api/users
const createUserSchema = baseUserSchema.extend({
  role_type: RoleEnum.optional().default('civil'),
  Id_rol: z.number().int().optional(), // In case it's sent directly
});

// 1. Administrator Schema
const administratorSchema = baseUserSchema.extend({
  // Admins might not have extra fields in the current schema
});

// 2. Oficial (Police Officer) Schema
const oficialSchema = baseUserSchema.extend({
  badge_number: z.string().min(1).max(20),
  rank: z.string().min(1).max(50),
  Id_unit: z.number().int()
});

// 3. Functionary Schema
const functionarySchema = baseUserSchema.extend({
  // Specific fields for functionary if any
});

// 4. Civil Schema
const civilSchema = baseUserSchema.extend({
  // Specific fields for civil if any
});

module.exports = {
  baseUserSchema,
  createUserSchema,
  administratorSchema,
  oficialSchema,
  functionarySchema,
  civilSchema,
  RoleEnum,
  StatusUserEnum,
  GenderEnum
};
