const prisma = require('../config/prisma');

const locationInclude = {
    zone: {
        include: {
            city: {
                include: {
                    parish: {
                        include: {
                            municipality: {
                                include: {
                                    state: {
                                        include: {
                                            country: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

const getAllComplaints = async (req, res) => {
    try {
        const { id, role } = req.user;
        let where = {};

        // RBAC: Logic for viewing complaints
        if (role === 'civil') {
            // Civils only see their own complaints
            where = { Id_user: id };
        } else if (role === 'oficial') {
            // Officers see cases assigned to them OR unassigned cases
            where = {
                OR: [
                    { assigned_officer_id: id },
                    { assigned_officer_id: null }
                ]
            };
        }
        // Administrator and Functionaries see all by default (unless specified otherwise)

        const complaints = await prisma.complaint.findMany({
            where,
            include: {
                ...locationInclude,
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true
                    }
                },
                assigned_officer: {
                    include: {
                        user: {
                            select: {
                                first_name: true,
                                last_name: true
                            }
                        }
                    }
                },
                expedients: {
                    include: {
                        evidences: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching complaints', error: error.message });
    }
};

const getComplaintById = async (req, res) => {
    try {
        const { id: complaintId } = req.params;
        const { id: userId, role } = req.user;

        const complaint = await prisma.complaint.findUnique({
            where: { Id_complaint: complaintId },
            include: {
                ...locationInclude,
                user: true,
                expedients: {
                    include: {
                        evidences: true
                    }
                },
                assigned_officer: true
            }
        });

        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        // RBAC Check
        if (role === 'civil' && complaint.Id_user !== userId) {
            return res.status(403).json({ success: false, message: 'You do not have permission to view this complaint' });
        }

        if (role === 'oficial' && complaint.assigned_officer_id !== userId && complaint.assigned_officer_id !== null) {
            return res.status(403).json({ success: false, message: 'This complaint is assigned to another officer' });
        }

        res.json(complaint);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching the complaint', error: error.message });
    }
};

const createComplaint = async (req, res) => {
    try {
        const {
            title, description, Id_zone, latitude, longitude, address_detail, incident_date,
            complainant_phone, complainant_email, complainant_name, evidence
        } = req.body;
        const { id: userId } = req.user;

        if (!Id_zone) {
            return res.status(400).json({ success: false, message: 'Zone ID is required' });
        }

        const data = {
            title,
            description,
            Id_zone: Number(Id_zone),
            Id_user: userId,
            latitude: latitude ? Number(latitude) : null,
            longitude: longitude ? Number(longitude) : null,
            address_detail,
            complainant_phone,
            complainant_email,
            complainant_name,
            incident_date: incident_date ? new Date(incident_date) : null,
            status: 'received',
            priority: req.body.priority || 'medium'
        };

        const newComplaint = await prisma.complaint.create({
            data,
            include: locationInclude
        });

        // Handle evidence if provided
        if (evidence && Array.isArray(evidence) && evidence.length > 0) {
            try {
                // 1. Create a placeholder address for the evidence
                const addr = await prisma.address.create({
                    data: {
                        Id_zone: Number(Id_zone),
                        name_address: address_detail || 'Incident Location'
                    }
                });

                // 2. Create Expedient linked to Complaint
                const exp = await prisma.expedient.create({
                    data: {
                        Id_complaint: newComplaint.Id_complaint
                    }
                });

                // 3. Create Evidence records
                for (const item of evidence) {
                    await prisma.evidence.create({
                        data: {
                            police_report: item.name || 'User Upload',
                            multimedia_url: item.url, // Base64 data
                            date_evidence: new Date(),
                            Id_address: addr.Id_address,
                            expedients: {
                                connect: { Id_expedient: exp.Id_expedient }
                            }
                        }
                    });
                }
            } catch (evError) {
                console.error('[ComplaintController] Evidence Save Error:', evError);
                // We don't fail the whole request if evidence fails, but we log it
            }
        }

        res.status(201).json(newComplaint);
    } catch (error) {
        console.error('[ComplaintController] Create Error:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating the complaint: ' + error.message,
            details: error.code === 'P2003' ? 'Foreign key constraint failed (check if zone exists)' : error.message,
            error: error.message
        });
    }
};

const updateComplaint = async (req, res) => {
    try {
        const { id: complaintId } = req.params;
        const { id: userId, role } = req.user;

        // Check ownership/permissions first
        const complaint = await prisma.complaint.findUnique({
            where: { Id_complaint: complaintId }
        });

        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        // Civils can only update their own
        if (role === 'civil' && complaint.Id_user !== userId) {
            return res.status(403).json({ message: 'You do not have permission to modify this complaint' });
        }

        // Sanitize data to only include valid Complaint fields for Prisma
        const allowedFields = [
            'title', 'description', 'status', 'priority', 'latitude', 'longitude',
            'address_detail', 'complainant_phone', 'complainant_email', 'complainant_name',
            'incident_date', 'assigned_officer_id', 'Id_zone'
        ];

        const dataToUpdate = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                dataToUpdate[field] = req.body[field];
            }
        });

        // Special handling for calculated/formatted fields
        if (dataToUpdate.incident_date) {
            dataToUpdate.incident_date = new Date(dataToUpdate.incident_date);
        }
        if (dataToUpdate.Id_zone) {
            dataToUpdate.Id_zone = Number(dataToUpdate.Id_zone);
        }

        const updated = await prisma.complaint.update({
            where: { Id_complaint: complaintId },
            data: dataToUpdate,
            include: {
                ...locationInclude,
                user: true,
                assigned_officer: {
                    include: { user: true }
                }
            }
        });

        res.json(updated);
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error updating complaint', error: error.message });
    }
};

const deleteComplaint = async (req, res) => {
    try {
        const { id: complaintId } = req.params;
        const { id: userId, role } = req.user;

        const complaint = await prisma.complaint.findUnique({
            where: { Id_complaint: complaintId }
        });

        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        // RBAC: Only admin or the creator can delete
        if (role !== 'administrator' && complaint.Id_user !== userId) {
            return res.status(403).json({ message: 'You do not have permission to delete this complaint' });
        }

        await prisma.complaint.delete({
            where: { Id_complaint: complaintId }
        });

        res.json({ success: true, message: 'Complaint deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting complaint', error: error.message });
    }
};

const assignOfficer = async (req, res) => {
    try {
        const { id } = req.params;
        const { officerId } = req.body;

        const updated = await prisma.complaint.update({
            where: { Id_complaint: id },
            data: {
                status: 'under_investigation',
                assigned_officer_id: officerId
            }
        });

        res.json({ success: true, message: 'Officer assigned successfully', complaint: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error assigning officer', error: error.message });
    }
};

const updatePriority = async (req, res) => {
    try {
        const { id } = req.params;
        const { priority } = req.body;

        const updated = await prisma.complaint.update({
            where: { Id_complaint: id },
            data: { priority }
        });

        res.json({ success: true, message: 'Priority updated', complaint: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error updating priority', error: error.message });
    }
};

const addEvidence = async (req, res) => {
    try {
        const { id } = req.params;
        const { police_report, multimedia_url, date_evidence, Id_address } = req.body;

        // Evidence needs an address according to our schema
        const evidence = await prisma.evidence.create({
            data: {
                police_report,
                multimedia_url,
                date_evidence: new Date(date_evidence),
                Id_address,
                expedients: {
                    create: {
                        complaint: {
                            connect: { Id_complaint: id }
                        }
                    }
                }
            }
        });

        res.json({ success: true, message: 'Evidence added', evidence });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error adding evidence', error: error.message });
    }
};

module.exports = {
    getAllComplaints,
    getComplaintById,
    createComplaint,
    updateComplaint,
    deleteComplaint,
    assignOfficer,
    updatePriority,
    addEvidence
};
