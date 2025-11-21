// src/services/auth.js
export const logout = async () => {
  try {
    // Limpiar datos de autenticación
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return { success: true, message: "Logged out successfully" }
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
}

// Función para verificar autenticación
export const checkAuth = () => {
  return localStorage.getItem('token') !== null
}

// Función para obtener token
export const getToken = () => {
  return localStorage.getItem('token')
}