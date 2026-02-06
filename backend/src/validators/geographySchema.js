const { z } = require('zod');

const countrySchema = z.object({
    name_country: z.string().min(2).max(100)
});

const stateSchema = z.object({
    Id_country: z.number().int(),
    name_state: z.string().min(2).max(100)
});

const municipalitySchema = z.object({
    Id_state: z.number().int(),
    name_municipality: z.string().min(2).max(100)
});

const parishSchema = z.object({
    Id_municipality: z.number().int(),
    name_parish: z.string().min(2).max(100)
});

const citySchema = z.object({
    Id_parish: z.number().int(),
    name_city: z.string().min(2).max(100)
});

const zoneSchema = z.object({
    Id_city: z.number().int(),
    name_zone: z.string().min(2).max(100),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable()
});

module.exports = {
    countrySchema,
    stateSchema,
    municipalitySchema,
    parishSchema,
    citySchema,
    zoneSchema
};
