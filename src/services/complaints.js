import { apiService } from './api';

export async function listComplaints() {
    try {
        const response = await apiService.get('/api/complaints');
        return response.map(c => ({
            ...c,
            id: c.Id_complaint,
            complainant_name: c.user ? `${c.user.first_name} ${c.user.last_name}` : 'Unknown',
            complainant_email: c.user?.email || '',
            zone: c.zone?.name_zone || 'Unknown',
            zoneId: c.Id_zone,
            location: c.address_detail || 'No address',
            latitude: c.latitude ? Number(c.latitude) : null,
            longitude: c.longitude ? Number(c.longitude) : null,
            assignedOfficerId: c.assigned_officer_id,
            assignedOfficerName: c.assigned_officer ? `${c.assigned_officer.user?.first_name} ${c.assigned_officer.user?.last_name}` : 'Unassigned',
            incidentDate: c.incident_date,
            country: c.zone?.city?.parish?.municipality?.state?.country?.name_country || 'Not specified',
            state: c.zone?.city?.parish?.municipality?.state?.name_state || 'Not specified',
            municipality: c.zone?.city?.parish?.municipality?.name_municipality || 'Not specified',
            parish: c.zone?.city?.parish?.name_parish || 'Not specified',
            city: c.zone?.city?.name_city || 'Not specified',
            complainant_phone: c.complainant_phone,
            complainant_email: c.complainant_email,
            complainant_name: c.complainant_name || (c.user ? `${c.user.first_name} ${c.user.last_name}` : 'Unknown'),
            createdAt: c.created_at
        }));
    } catch (error) {
        console.error('Error listing complaints:', error);
        return [];
    }
}

export async function getComplaint(id) {
    try {
        const c = await apiService.get(`/api/complaints/${id}`);
        return {
            ...c,
            id: c.Id_complaint,
            complainant_name: c.user ? `${c.user.first_name} ${c.user.last_name}` : 'Unknown',
            zone: c.zone?.name_zone || 'Unknown',
            location: c.address_detail || 'No address',
            latitude: c.latitude ? Number(c.latitude) : null,
            longitude: c.longitude ? Number(c.longitude) : null,
            assignedOfficerId: c.assigned_officer_id,
            incidentDate: c.incident_date,
            country: c.zone?.city?.parish?.municipality?.state?.country?.name_country || 'Not specified',
            state: c.zone?.city?.parish?.municipality?.state?.name_state || 'Not specified',
            municipality: c.zone?.city?.parish?.municipality?.name_municipality || 'Not specified',
            parish: c.zone?.city?.parish?.name_parish || 'Not specified',
            city: c.zone?.city?.name_city || 'Not specified',
            complainant_phone: c.complainant_phone,
            complainant_email: c.complainant_email,
            complainant_name: c.complainant_name || (c.user ? `${c.user.first_name} ${c.user.last_name}` : 'Unknown'),
            createdAt: c.created_at
        };
    } catch (error) {
        console.error('Error getting complaint:', error);
        return null;
    }
}

export async function createComplaint(payload) {
    try {
        const response = await apiService.post('/api/complaints', {
            title: payload.title,
            description: payload.description,
            Id_zone: payload.Id_zone || payload.zone_id,
            latitude: payload.latitude,
            longitude: payload.longitude,
            address_detail: payload.location || payload.address_detail,
            incident_date: payload.incidentDate,
            complainant_phone: payload.complainant_phone,
            complainant_email: payload.complainant_email,
            complainant_name: payload.complainant_name
        });
        return {
            ...response,
            id: response.Id_complaint
        };
    } catch (error) {
        console.error('Error creating complaint:', error);
        throw error;
    }
}

export async function updateComplaint(id, payload) {
    try {
        const sanitizedPayload = {
            title: payload.title,
            description: payload.description,
            status: payload.status,
            priority: payload.priority,
            Id_zone: payload.Id_zone || payload.zoneId || payload.zone_id,
            latitude: payload.latitude,
            longitude: payload.longitude,
            address_detail: payload.location || payload.address_detail,
            incident_date: payload.incidentDate,
            complainant_phone: payload.complainant_phone,
            complainant_email: payload.complainant_email,
            complainant_name: payload.complainant_name
        };

        // Remove undefined fields
        Object.keys(sanitizedPayload).forEach(key => {
            if (sanitizedPayload[key] === undefined) delete sanitizedPayload[key];
        });

        const response = await apiService.put(`/api/complaints/${id}`, sanitizedPayload);
        return {
            ...response,
            id: response.Id_complaint
        };
    } catch (error) {
        console.error('Error updating complaint:', error);
        throw error;
    }
}

export async function changeComplaintStatus(id, newStatus) {
    return updateComplaint(id, { status: newStatus.toLowerCase() });
}

export async function assignOfficer(complaintId, officerId) {
    try {
        const response = await apiService.post(`/api/complaints/${complaintId}/assign`, {
            officerId
        });
        return response;
    } catch (error) {
        console.error('Error assigning officer:', error);
        throw error;
    }
}

export async function deleteComplaint(id) {
    try {
        await apiService.delete(`/api/complaints/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting complaint:', error);
        throw error;
    }
}
