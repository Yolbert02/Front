import { apiService } from './api';

// Polygon coordinates for each zone (local metadata, keyed by zone name)
const ZONE_POLYGONS = {
    'Pueblo Nuevo': {
        color: '#4caf50',
        coordinates: [
            [7.795, -72.240],
            [7.820, -72.230],
            [7.820, -72.200],
            [7.775, -72.200],
            [7.775, -72.225],
            [7.785, -72.240],
        ],
    },
    'Barrio Obrero': {
        color: '#2196f3',
        coordinates: [
            [7.775, -72.225],
            [7.775, -72.200],
            [7.760, -72.200],
            [7.760, -72.225],
        ],
    },
    'Centro': {
        color: '#f44336',
        coordinates: [
            [7.775, -72.235],
            [7.775, -72.225],
            [7.760, -72.225],
            [7.760, -72.235],
        ],
    },
    'Santa Teresa': {
        color: '#9c27b0',
        coordinates: [
            [7.785, -72.240],
            [7.775, -72.225],
            [7.775, -72.235],
            [7.760, -72.235],
            [7.750, -72.255],
            [7.780, -72.255],
        ],
    },
    'La Concordia': {
        color: '#ff9800',
        coordinates: [
            [7.760, -72.235],
            [7.760, -72.200],
            [7.720, -72.210],
            [7.730, -72.250],
        ],
    },
};

function mergeZoneData(backendZone) {
    const polygonData = ZONE_POLYGONS[backendZone.name_zone] || {};
    return {
        id: backendZone.Id_zone,
        name: backendZone.name_zone,
        color: polygonData.color || '#333333',
        coordinates: polygonData.coordinates || [],
        latitude: backendZone.latitude ? Number(backendZone.latitude) : null,
        longitude: backendZone.longitude ? Number(backendZone.longitude) : null,
    };
}

export async function listZones() {
    try {
        const response = await apiService.get('/api/zones');
        const mapped = response.map(mergeZoneData);
        const seen = new Set();
        const unique = [];
        for (const zone of mapped) {
            if (zone && zone.name) {
                const normalized = zone.name.trim().toLowerCase();
                if (!seen.has(normalized)) {
                    seen.add(normalized);
                    unique.push(zone);
                }
            }
        }
        return unique;
    } catch (error) {
        console.error('Error listing zones:', error);
        return [];
    }
}

export async function getZone(id) {
    try {
        const response = await apiService.get(`/api/zones/${id}`);
        return mergeZoneData(response);
    } catch (error) {
        console.error('Error getting zone:', error);
        return null;
    }
}

export async function createZone(payload) {
    try {
        const response = await apiService.post('/api/zones', {
            name_zone: payload.name || payload.name_zone,
            Id_city: payload.Id_city || 1,
            latitude: payload.latitude,
            longitude: payload.longitude,
        });
        return mergeZoneData(response);
    } catch (error) {
        console.error('Error creating zone:', error);
        throw error;
    }
}

export async function updateZone(id, payload) {
    try {
        const response = await apiService.put(`/api/zones/${id}`, {
            name_zone: payload.name || payload.name_zone,
            latitude: payload.latitude,
            longitude: payload.longitude,
        });
        return mergeZoneData(response);
    } catch (error) {
        console.error('Error updating zone:', error);
        throw error;
    }
}

export async function deleteZone(id) {
    try {
        await apiService.delete(`/api/zones/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting zone:', error);
        throw error;
    }
}
