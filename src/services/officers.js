import { apiService } from './api';

export async function listOfficers() {
    try {
        const response = await apiService.get('/api/officers');
        return response.map(o => ({
            ...o,
            id: o.Id_user,
            name: o.user?.first_name || '',
            lastName: o.user?.last_name || '',
            idNumber: o.user?.dni || '',
            email: o.user?.email || '',
            phone: o.user?.number_phone || '',
            unit: o.unit?.name_unit || 'Unassigned',
            rank: o.rank || 'Officer',
            status: o.user?.status_user || 'active',
            active: o.user?.status_user === 'active'
        }));
    } catch (error) {
        console.error('Error listing officers:', error);
        return [];
    }
}

export async function getOfficer(id) {
    try {
        const o = await apiService.get(`/api/officers/${id}`);
        return {
            ...o,
            id: o.Id_user,
            name: o.user?.first_name || '',
            lastName: o.user?.last_name || '',
            idNumber: o.user?.dni || '',
            email: o.user?.email || '',
            phone: o.user?.number_phone || '',
            unit: o.unit?.name_unit || 'Unassigned',
            rank: o.rank || 'Officer',
            status: o.user?.status_user || 'active',
            active: o.user?.status_user === 'active'
        };
    } catch (error) {
        console.error('Error getting officer:', error);
        return null;
    }
}

export async function createOfficer(payload) {
    try {
        // Backend handles creating officer and linking to user
        const response = await apiService.post('/api/officers', payload);
        return response;
    } catch (error) {
        console.error('Error creating officer:', error);
        throw error;
    }
}

export async function updateOfficer(id, payload) {
    try {
        const response = await apiService.put(`/api/officers/${id}`, payload);
        return response;
    } catch (error) {
        console.error('Error updating officer:', error);
        throw error;
    }
}

export async function changeOfficerStatus(id, newStatus) {
    return updateOfficer(id, { status: newStatus });
}

export async function deleteOfficer(id) {
    try {
        await apiService.delete(`/api/officers/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting officer:', error);
        throw error;
    }
}
