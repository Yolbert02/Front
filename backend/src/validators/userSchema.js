const { z } = require('zod');

// Enums matching the database
// Enums matching the database plus frontend variants
const GenderEnum = z.enum(['male', 'female', 'other']);
const StatusUserEnum = z.enum(['active', 'suspended', 'deleted', 'inactive']);
const RoleEnum = z.enum(['administrator', 'oficial', 'functionary', 'civil', 'officer']);

const baseUserSchema = z.object({
  dni: z.string().min(5, "DNI must be at least 5 characters long").max(20),
  first_name: z.string().min(2, "Name is too short").max(100),
  second_name: z.string().max(100).optional().nullable(),
  last_name: z.string().min(2, "Last name is too short").max(100),
  second_last_name: z.string().max(100).optional().nullable(),
  email: z.string().email("Invalid email").max(100),
  password: z.string().min(6, "Password must be at least 6 characters long").max(255),
  number_phone: z.string().max(20).optional().nullable(),
  phone: z.string().max(20).optional().nullable(), // Added for frontend compatibility
  date_birth: z.preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    return undefined;
  }, z.date().optional()),
  gender: GenderEnum.optional().default('male'),
  status_user: StatusUserEnum.default('active'),
  status: StatusUserEnum.optional(), // Added for frontend compatibility
  Id_address: z.string().uuid().optional().nullable(),
});

// For POST /api/users
const createUserSchema = baseUserSchema.extend({
  role_type: RoleEnum.optional().default('civil'),
  role: RoleEnum.optional(), // Added for frontend compatibility
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
