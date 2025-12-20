const KEY = 'mock_zones_v1'

const initialZones = [
    {
        id: 1,
        name: 'Pueblo Nuevo',
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
    {
        id: 2,
        name: 'Barrio Obrero',
        color: '#2196f3',
        coordinates: [
            [7.775, -72.225],
            [7.775, -72.200],
            [7.760, -72.200],
            [7.760, -72.225],
        ],
    },
    {
        id: 3,
        name: 'Centro',
        color: '#f44336',
        coordinates: [
            [7.775, -72.235],
            [7.775, -72.225],
            [7.760, -72.225],
            [7.760, -72.235],
        ],
    },
    {
        id: 4,
        name: 'Santa Teresa',
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
    {
        id: 5,
        name: 'La Concordia',
        color: '#ff9800',
        coordinates: [
            [7.760, -72.235],
            [7.760, -72.200],
            [7.720, -72.210],
            [7.730, -72.250],
        ],
    },
]

function load() {
    try {
        const raw = localStorage.getItem(KEY)
        if (!raw) {
            save(initialZones)
            return initialZones
        }
        const parsed = JSON.parse(raw)
        return parsed && parsed.length > 0 ? parsed : initialZones
    } catch (e) {
        console.error('Error loading zones:', e)
        return initialZones
    }
}

function save(items) {
    try {
        localStorage.setItem(KEY, JSON.stringify(items))
    } catch (e) {
        console.warn('Error saving zones:', e)
    }
}

function nextId(items) {
    const maxId = items.reduce((max, item) => Math.max(max, item.id || 0), 0)
    return maxId + 1
}

export async function listZones() {
    const data = load()
    return Promise.resolve(data)
}

export async function getZone(id) {
    const items = load()
    return Promise.resolve(items.find(z => z.id === id) || null)
}

export async function createZone(payload) {
    const items = load()
    const id = nextId(items)

    const zone = {
        id,
        name: payload.name || 'New Zone',
        color: payload.color || '#333333',
        coordinates: payload.coordinates || [],
        description: payload.description || '',
        createdAt: new Date().toISOString()
    }

    items.push(zone)
    save(items)
    return Promise.resolve(zone)
}

export async function updateZone(id, payload) {
    const items = load()
    const idx = items.findIndex(z => z.id === id)
    if (idx === -1) return Promise.reject(new Error('Zone not found'))

    items[idx] = {
        ...items[idx],
        ...payload
    }
    save(items)
    return Promise.resolve(items[idx])
}

export async function deleteZone(id) {
    const items = load()
    const filtered = items.filter(z => z.id !== id)
    save(filtered)
    return Promise.resolve({ success: true })
}
