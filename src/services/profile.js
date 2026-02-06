import { apiService } from './api';

function getSessionUser() {
    try {
        const user = sessionStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (e) {
        return null;
    }
}

export async function getProfile() {
    const user = getSessionUser();
    if (!user) return null;

    // Map backend user to profile structure
    return {
        id: user.id || user.Id_user,
        document: user.dni || "V-00000000",
        first_name: user.first_name || "Usuario",
        last_name: user.last_name || "Desconocido",
        gmail: user.email || "",
        role: user.role || "civil",
        number_phone: user.number_phone || user.phone || "No asignado",
        profile_picture: user.avatar || null,
        bio: user.bio || "",
        department: user.department || "N/A",
        location: user.location || "N/A",
        join_date: user.created_at || new Date().toISOString()
    };
}

export async function updateProfile(payload) {
    const user = getSessionUser();
    if (!user) throw new Error('No active session');

    try {
        const userId = user.id || user.Id_user;
        const response = await apiService.patch(`/api/users/${userId}`, payload);

        if (response) {
            const updatedUser = { ...user, ...response };
            sessionStorage.setItem('user', JSON.stringify(updatedUser));

            window.dispatchEvent(new CustomEvent('profileUpdated', {
                detail: {
                    first_name: updatedUser.first_name,
                    last_name: updatedUser.last_name,
                    gmail: updatedUser.email
                }
            }));
            return updatedUser;
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}

export async function updateProfilePicture(imageData) {
    const user = getSessionUser();
    if (!user) throw new Error('No active session');

    try {
        const userId = user.id || user.Id_user;
        // In a real app, we might upload to a specific avatar endpoint
        // For now, we update the user object's profile_picture
        const response = await apiService.patch(`/api/users/${userId}`, { profile_picture: imageData });

        const updatedUser = { ...user, avatar: imageData };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));

        window.dispatchEvent(new CustomEvent('profilePictureUpdated', {
            detail: { profilePicture: imageData }
        }));

        return updatedUser;
    } catch (error) {
        console.error('Error updating profile picture:', error);
        throw error;
    }
}

export async function changePassword(currentPassword, newPassword) {
    const response = await apiService.post('/api/auth/change-password', { currentPassword, newPassword });
    return response;
}
