import { apiService } from './api';

export async function listUsers() {
    try {
        console.log('listUsers: Fetching from /api/users');
        const response = await apiService.get('/api/users');
        console.log('listUsers: Response received:', response);

        // Ensure response is an array
        const usersArray = Array.isArray(response) ? response : (response?.users || []);

        return usersArray.map(user => ({
            ...user,
            id: user.Id_user,
            role: user.role?.type_rol || (typeof user.role === 'string' ? user.role : ''),
            status: user.status_user || user.status || 'active',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            phone: user.number_phone || user.phone || ''
        }));
    } catch (error) {
        console.error('Error listing users:', error);
        return [];
    }
}

export async function getUser(id) {
    try {
        const user = await apiService.get(`/api/users/${id}`);
        return {
            ...user,
            id: user.Id_user,
            role: user.role?.type_rol || user.role,
            status: user.status_user || user.status || 'active'
        };
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

export async function createUser(payload) {
    try {
        // Map frontend fields to backend requirements
        const backendPayload = {
            dni: payload.dni,
            first_name: payload.first_name,
            last_name: payload.last_name,
            email: payload.email,
            password: payload.password,
            role_type: payload.role || 'civil',
            date_birth: payload.date_birth || "1990-01-01", // Default if missing
            gender: payload.gender || "male", // Default if missing
            number_phone: payload.phone
        };

        const response = await apiService.post('/api/users', backendPayload);
        return {
            ...response,
            id: response.Id_user,
            role: response.role?.type_rol || response.role,
            status: response.status_user
        };
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

export async function updateUser(id, payload) {
    try {
        const response = await apiService.put(`/api/users/${id}`, payload);
        return {
            ...response,
            id: response.Id_user,
            role: response.role?.type_rol || response.role,
            status: response.status_user
        };
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export async function deleteUser(id) {
    try {
        await apiService.delete(`/api/users/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

export async function changeUserStatus(id, newStatus) {
    return updateUser(id, { status_user: newStatus });
}

export async function changeUserRole(id, newRole) {
    return updateUser(id, { role_type: newRole });
}
