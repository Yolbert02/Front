import { apiService } from './api';

export const login = async (email, password) => {
  console.log('Attempting login with Backend Server...');

  const response = await apiService.post('/api/auth/login', {
    email,
    password
  });

  if (response.success) {
    sessionStorage.setItem('token', response.token);
    sessionStorage.setItem('user', JSON.stringify(response.user));
    sessionStorage.setItem('isAuthenticated', 'true');

    console.log('Login successful:', response.user);
    return response;
  } else {
    throw new Error(response.message || 'Login failed');
  }
};

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

export const forgotPassword = async (email) => {
  const response = await apiService.post('/api/auth/forgot-password', { email });
  return response;
};

export const resetPassword = async (token, newPassword) => {
  const response = await apiService.post('/api/auth/reset-password', { token, newPassword });
  return response;
};