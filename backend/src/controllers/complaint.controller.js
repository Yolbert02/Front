const { complaints, officers, saveData } = require('../data/storage');

const getAllComplaints = (req, res) => {
    res.json(complaints);
};

const getComplaintById = (req, res) => {
    const id = parseInt(req.params.id);
    const complaint = complaints.find(c => c.id === id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
};

const createComplaint = (req, res) => {
    const { title, description, complainant_name, complainant_phone, zone, address, latitude, longitude } = req.body;

    const newComplaint = {
        id: complaints.length > 0 ? Math.max(...complaints.map(c => c.id)) + 1 : 1,
        title,
        description,
        complainant_name,
        complainant_phone,
        zone,
        address,
        latitude: latitude || 0,
        longitude: longitude || 0,
        status: 'received',
        priority: 'medium',
        assignedOfficerId: null,
        evidence: [],
        createdAt: new Date().toISOString()
    };

    complaints.push(newComplaint);
    saveData();
    res.status(201).json(newComplaint);
};

const updateComplaint = (req, res) => {
    const id = parseInt(req.params.id);
    const index = complaints.findIndex(c => c.id === id);

    if (index === -1) return res.status(404).json({ message: 'Complaint not found' });

    complaints[index] = {
        ...complaints[index],
        ...req.body
    };

    saveData();
    res.json(complaints[index]);
};

const deleteComplaint = (req, res) => {
    const id = parseInt(req.params.id);
    const index = complaints.findIndex(c => c.id === id);

    if (index === -1) return res.status(404).json({ message: 'Complaint not found' });

    complaints.splice(index, 1);
    saveData();
    res.json({ message: 'Complaint deleted', id });
};


const assignOfficer = (req, res) => {
    const { id } = req.params;
    const { officerId } = req.body;

    const complaint = complaints.find(c => c.id === parseInt(id));
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const officer = officers.find(o => o.id === parseInt(officerId));
    if (!officer) return res.status(404).json({ message: 'Officer not found' });

    complaint.assignedOfficerId = officer.id;
    complaint.assignedOfficerName = `${officer.name} ${officer.lastName}`;
    complaint.status = 'under_investigation';

    saveData();
    res.json({ message: 'Officer assigned successfully', complaint });
};

const updatePriority = (req, res) => {
    const { id } = req.params;
    const { priority } = req.body;

    const complaint = complaints.find(c => c.id === parseInt(id));
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.priority = priority;
    saveData();
    res.json({ message: 'Priority updated', complaint });
};

const addEvidence = (req, res) => {
    const { id } = req.params;
    const { fileName, fileType, url } = req.body;

    const complaint = complaints.find(c => c.id === parseInt(id));
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const newEvidence = {
        id: complaint.evidence.length + 1,
        fileName,
        fileType,
        url,
        uploadedAt: new Date().toISOString()
    };

    complaint.evidence.push(newEvidence);
    saveData();
    res.json({ message: 'Evidence added', evidence: newEvidence });
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
