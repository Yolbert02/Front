const { z } = require('zod');

const complaintSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long").max(200),
    description: z.string().min(10, "Description must be more detailed").max(1000),
    status: z.enum(['received', 'under_investigation', 'resolved', 'closed', 'rejected']).default('received'),
    priority: z.enum(['low', 'medium', 'high', 'urgent', 'critical']).default('medium'),
    Id_zone: z.number().int().positive("Zone is required"),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    address_detail: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    municipality: z.string().optional().nullable(),
    parish: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    complainant_phone: z.string().optional().nullable(),
    complainant_email: z.string().email().optional().nullable().or(z.literal('')),
    complainant_name: z.string().optional().nullable(),
    incident_date: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()).optional().nullable(),
}).refine(data => data.complainant_phone || data.complainant_email, {
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
