// src/services/profile.js
const PROFILE_KEY = 'user_profile_data'
const initialProfile = {
    id: 1,
    document: "V-12345678",
    first_name: "Admin",
    last_name: "System",
    gmail: "admin@sistema.com",
    number_phone: "0414-1112233",
    role: "administrador",
    profile_picture: null,
    bio: "Soy el administrador del sistema",
    department: "Sistemas",
    location: "Caracas, Venezuela",
    join_date: "2024-01-01",
    notifications: true,
    email_notifications: true,
    two_factor_auth: false,
    updatedAt: new Date().toISOString()
}

function loadProfile() {
    try {
        const raw = localStorage.getItem(PROFILE_KEY)
        if (!raw) {
            saveProfile(initialProfile)
            return initialProfile
        }
        return JSON.parse(raw)
    } catch (e) { 
        console.error('Error loading profile:', e)
        return initialProfile 
    }
}

function saveProfile(profile) {
    try { 
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)) 
    } catch(e){ 
        console.warn('Error saving profile:', e) 
    } 
}

export async function getProfile() {
    const data = loadProfile()
    return Promise.resolve(data)
}

export async function updateProfile(payload) {
    const currentProfile = loadProfile()
    const updatedProfile = {
        ...currentProfile,
        ...payload,
        updatedAt: new Date().toISOString()
    }
    saveProfile(updatedProfile)
    
    // Disparar evento para notificar cambios
    window.dispatchEvent(new CustomEvent('profileUpdated', {
        detail: { 
            first_name: updatedProfile.first_name,
            last_name: updatedProfile.last_name,
            gmail: updatedProfile.gmail
        }
    }))
    
    return Promise.resolve(updatedProfile)
}

export async function updateProfilePicture(imageData) {
    const currentProfile = loadProfile()
    const updatedProfile = {
        ...currentProfile,
        profile_picture: imageData,
        updatedAt: new Date().toISOString()
    }
    saveProfile(updatedProfile)
    
    // Disparar evento para notificar cambios en la foto
    window.dispatchEvent(new CustomEvent('profilePictureUpdated', {
        detail: { profilePicture: updatedProfile.profile_picture }
    }))
    
    return Promise.resolve(updatedProfile)
}

export async function changePassword(currentPassword, newPassword) {
    return Promise.resolve({ success: true, message: "Password updated successfully" })
}