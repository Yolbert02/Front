const { z } = require('zod');

const complaintSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long").max(200),
    description: z.string().min(10, "Description must be more detailed").max(1000),
    status: z.enum(['received', 'under_investigation', 'resolved', 'closed', 'rejected']).default('received'),
    priority: z.enum(['low', 'medium', 'high', 'urgent', 'critical']).default('medium'),
    Id_zone: z.preprocess((val) => Number(val), z.number().int().positive("Zone is required")),
    latitude: z.preprocess((val) => val === '' || val === null ? null : Number(val), z.number().nullable().optional()),
    longitude: z.preprocess((val) => val === '' || val === null ? null : Number(val), z.number().nullable().optional()),
    address_detail: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    municipality: z.string().optional().nullable(),
    parish: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    complainant_phone: z.string().optional().nullable().or(z.literal('')),
    complainant_email: z.string().email().optional().nullable().or(z.literal('')),
    complainant_name: z.string().optional().nullable(),
    incident_date: z.preprocess((arg) => {
        if (!arg) return null;
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date().nullable()).optional(),
    evidence: z.array(z.any()).optional(),
}).refine(data => {
    const hasPhone = data.complainant_phone && data.complainant_phone.trim().length > 0;
    const hasEmail = data.complainant_email && data.complainant_email.trim().length > 0;
    return hasPhone || hasEmail;
}, {
    message: "At least one phone number or email address must be provided",
    path: ["complainant_phone"]
});

const evidenceSchema = z.object({
    police_report: z.string().min(10).max(1000).optional(),
    multimedia_url: z.string().url().max(255).optional(),
    date_evidence: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()),
    Id_address: z.string().uuid().optional(),
});

module.exports = {
    complaintSchema,
    evidenceSchema
};
