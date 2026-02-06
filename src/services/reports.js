import { apiService } from './api';

export const getDashboardStats = async () => {
    const response = await apiService.get('/api/stats/dashboard');
    if (response.success) {
        return response.data;
    }
    throw new Error(response.message || 'Error fetching stats');
};

export const downloadComplaintsExcel = async () => {
    // For downloads we need the blob response, but our apiService handles JSON
    // Let's use fetch directly with the token for this specific case
    const token = sessionStorage.getItem('token');
    const BASE = import.meta.env.VITE_API_URL ?? '';
    const response = await fetch(`${BASE}/api/stats/reports/excel`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) throw new Error('Excel download failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte_denuncias.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
};

export const downloadComplaintPDF = async (complaintId) => {
    const token = sessionStorage.getItem('token');
    const BASE = import.meta.env.VITE_API_URL ?? '';
    const response = await fetch(`${BASE}/api/stats/reports/pdf/${complaintId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) throw new Error('PDF download failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `denuncia_${complaintId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
};

export const downloadAssignmentPDF = async (assignmentId) => {
    const token = sessionStorage.getItem('token');
    const BASE = import.meta.env.VITE_API_URL ?? '';
    const response = await fetch(`${BASE}/api/stats/reports/assignment/${assignmentId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) throw new Error('Assignment PDF download failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asignacion_${assignmentId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
};
