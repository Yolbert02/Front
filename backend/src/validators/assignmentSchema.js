const { z } = require('zod');

const assignmentSchema = z.object({
    case_number: z.string().max(50).optional().nullable().or(z.literal('')),
    case_title: z.string().min(3, "Title must be at least 3 characters long").max(200),
    case_description: z.string().min(5, "Description must be at least 5 characters long").max(2000),
    judge_id: z.string().uuid().nullable().optional(),
    judge_name: z.string().max(150).optional().nullable().or(z.literal('')),
    court: z.string().max(150).optional().nullable().or(z.literal('')),
    hearing_date: z.preprocess((arg) => {
        if (!arg || arg === '') return undefined;
        return new Date(arg);
    }, z.date().optional().nullable()),
    trial_date: z.preprocess((arg) => {
        if (!arg || arg === '') return undefined;
        return new Date(arg);
    }, z.date().optional().nullable()),
    hearing_time: z.string().max(20).optional().nullable().or(z.literal('')),
    trial_time: z.string().max(20).optional().nullable().or(z.literal('')),
    status: z.enum(['scheduled', 'in_progress', 'ongoing', 'completed', 'cancelled', 'postponed']).default('scheduled'),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    location: z.string().max(255).optional().nullable().or(z.literal('')),
    officials: z.array(z.string().uuid()).optional().default([]),
    funcionaries: z.array(z.string().uuid()).optional().default([]),
    witnesses: z.array(z.string().uuid()).optional().default([]),
    jury: z.array(z.string().uuid()).optional().default([]),
});

module.exports = {
    assignmentSchema
};
