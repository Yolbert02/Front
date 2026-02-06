import { apiService } from './api';

export async function listAssignments() {
    try {
        const data = await apiService.get('/api/assignments');
        return data.map(assignment => ({
            ...assignment,
            id: assignment.Id_assignment || assignment.id
        }));
    } catch (error) {
        console.error('Error fetching assignments:', error);
        return [];
    }
}

export async function getAssignment(id) {
    try {
        const data = await apiService.get(`/api/assignments/${id}`);
        return {
            ...data,
            id: data.Id_assignment || data.id
        };
    } catch (error) {
        console.error('Error getting assignment:', error);
        return null;
    }
}

export async function createAssignment(payload) {
    try {
        return await apiService.post('/api/assignments', payload);
    } catch (error) {
        console.error('Error creating assignment:', error);
        throw error;
    }
}

export async function updateAssignment(id, payload) {
    try {
        return await apiService.put(`/api/assignments/${id}`, payload);
    } catch (error) {
        console.error('Error updating assignment:', error);
        throw error;
    }
}

export async function changeAssignmentStatus(id, newStatus) {
    return updateAssignment(id, { status: newStatus });
}

export async function deleteAssignment(id) {
    try {
        await apiService.delete(`/api/assignments/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting assignment:', error);
        throw error;
    }
}

export async function getFuncionaries() {
    try {
        const usersModule = await import('./users.js');
        const users = await usersModule.listUsers();
        return users.filter(user =>
            (user.role?.toLowerCase() === 'officer' || user.role?.toLowerCase() === 'oficial' || user.role?.toLowerCase() === 'functionary' || user.role?.toLowerCase() === 'funcionario') &&
            user.status?.toLowerCase() === 'active'
        );
    } catch (error) {
        console.error('Error loading funcionaries:', error);
        return [];
    }
}

export async function getCitizens() {
    try {
        const usersModule = await import('./users.js');
        const users = await usersModule.listUsers();
        return users.filter(user => user.role?.toLowerCase() === 'civil' && user.status?.toLowerCase() === 'active');
    } catch (error) {
        console.error('Error loading citizens:', error);
        return [];
    }
}

export async function getActiveUsers() {
    try {
        const usersModule = await import('./users.js');
        const users = await usersModule.listUsers();
        return users.filter(user => user.status?.toLowerCase() === 'active');
    } catch (error) {
        console.error('Error loading active users:', error);
        return [];
    }
}
