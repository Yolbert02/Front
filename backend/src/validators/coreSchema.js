const { z } = require('zod');

const addressSchema = z.object({
    Id_zone: z.number().int(),
    name_address: z.string().min(3).max(150)
});

const officeSchema = z.object({
    Id_address: z.string().uuid(),
    name_office: z.string().min(2).max(100)
});

const courtSchema = z.object({
    name_court: z.string().min(2).max(100),
    jurisdiction_type: z.string().min(2).max(50),
    Id_address: z.string().uuid()
});

module.exports = {
    addressSchema,
    officeSchema,
    courtSchema
};
