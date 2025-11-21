import { apiService } from './api';

// Datos de demo para fallback
const demoUsers = {
  'admin': { 
    password: 'admin123', 
    user: { 
      id: 1, 
      name: 'Administrador',
      first_name: 'Admin',
      last_name: 'System',
      email: 'admin@sistema.com',
      role: 'administrador',
      document: 'V-12345678'
    } 
  },
  'user': { 
    password: 'user123', 
    user: { 
      id: 2, 
      name: 'Usuario Demo',
      first_name: 'Usuario',
      last_name: 'Demo', 
      email: 'user@demo.com',
      role: 'civil',
      document: 'V-99999999'
    } 
  }
};

export const login = async (username, password) => {
  try {
    console.log('🔐 Attempting login with Mock Server...');
    
    const response = await apiService.post('/api/auth/login', {
      username,
      password
    });
    
    if (response.success) {
      // Guardar en sessionStorage para persistir en Netlify
      sessionStorage.setItem('token', response.token);
      sessionStorage.setItem('user', JSON.stringify(response.user));
      sessionStorage.setItem('isAuthenticated', 'true');
      
      console.log('✅ Login successful:', response.user);
      return response;
    } else {
      throw new Error(response.message || 'Login failed');
    }
  } catch (error) {
    console.error('❌ Mock Server login failed, using fallback:', error);
    // Fallback a login local
    return localLogin(username, password);
  }
};

// Fallback local para cuando el Mock Server falle
function localLogin(username, password) {
  const user = demoUsers[username];
  
  if (user && user.password === password) {
    sessionStorage.setItem('user', JSON.stringify(user.user));
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('token', 'local-token-' + Date.now());
    
    return { 
      success: true, 
      user: user.user,
      token: 'local-token-' + Date.now()
    };
  }
  
  throw new Error('Credenciales incorrectas');
}

export const logout = async () => {
  try {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isAuthenticated');
    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

export const checkAuth = () => {
  return sessionStorage.getItem('isAuthenticated') === 'true';
}

export const getToken = () => {
  return sessionStorage.getItem('token');
}

export const getCurrentUser = () => {
  const user = sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}