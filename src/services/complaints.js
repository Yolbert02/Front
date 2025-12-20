const KEY = 'mock_complaints_v1'

const initialComplaints = [
    {
        id: 1,
        title: "Street robbery",
        description: "Cell phone theft near the main square of Pueblo Nuevo",
        complainant_name: "Maria Gonzalez",
        complainant_phone: "0414-1112233",
        complainant_email: "maria.gonzalez@email.com",
        country: "Venezuela",
        state: "Táchira",
        parish: "San Juan Bautista",
        municipality: "San Cristóbal",
        city: "San Cristóbal",
        zone: "Pueblo Nuevo",
        address: "Plaza Bolivar, cerca del mercado municipal",
        location: "Plaza Bolivar, cerca del mercado municipal, Pueblo Nuevo, San Cristóbal, San Cristóbal, San Juan Bautista, Táchira, Venezuela",
        assignedOfficerId: 1,
        assignedOfficerName: "Carlos Rodríguez",
        status: "under_investigation",
        priority: "high",
        latitude: 7.785,
        longitude: -72.220,
        evidence: [
            {
                id: 1,
                name: "security_camera.jpg",
                type: "image/jpeg",
                size: 2048576,
                url: "https://example.com/evidence1.jpg",
                uploadedAt: new Date().toISOString()
            }
        ],
        incidentDate: "2024-01-15",
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        title: "Public property vandalism",
        description: "Damage to benches in Barrio Obrero",
        complainant_name: "Jose Lopez",
        complainant_phone: "0424-5556677",
        complainant_email: "jose.lopez@email.com",
        country: "Venezuela",
        state: "Táchira",
        parish: "Pedro María Morantes",
        municipality: "San Cristóbal",
        city: "San Cristóbal",
        zone: "Barrio Obrero",
        address: "Carrera 20, entre calles 7 y 8",
        location: "Carrera 20, entre calles 7 y 8, Barrio Obrero, San Cristóbal, San Cristóbal, Pedro María Morantes, Táchira, Venezuela",
        assignedOfficerId: 2,
        assignedOfficerName: "Ana Martínez",
        status: "received",
        priority: "medium",
        latitude: 7.768,
        longitude: -72.215,
        evidence: [],
        incidentDate: "2024-01-14",
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        title: "Traffic accident",
        description: "Collision at intersection in La Concordia",
        complainant_name: "Pedro Perez",
        complainant_phone: "0412-9998877",
        complainant_email: "pedro.perez@email.com",
        country: "Venezuela",
        state: "Táchira",
        parish: "La Concordia",
        municipality: "San Cristóbal",
        city: "San Cristóbal",
        zone: "La Concordia",
        address: "Avenida 19 de Abril con Calle 8",
        location: "Avenida 19 de Abril con Calle 8, La Concordia, San Cristóbal, San Cristóbal, La Concordia, Táchira, Venezuela",
        assignedOfficerId: null,
        assignedOfficerName: "",
        status: "resolved",
        priority: "low",
        latitude: 7.740,
        longitude: -72.225,
        evidence: [],
        incidentDate: "2024-01-20",
        createdAt: new Date().toISOString()
    }
]

function load() {
    try {
        const raw = localStorage.getItem(KEY)
        if (!raw) {
            save(initialComplaints)
            return initialComplaints
        }
        const parsed = JSON.parse(raw)
        return parsed && parsed.length > 0 ? parsed : initialComplaints
    } catch (e) {
        console.error('Error loading complaints:', e)
        return initialComplaints
    }
}

function save(items) {
    try {
        localStorage.setItem(KEY, JSON.stringify(items))
    } catch (e) {
        console.warn('Error saving complaints:', e)
    }
}

function nextId(items) {
    const maxId = items.reduce((max, item) => Math.max(max, item.id || 0), 0)
    return maxId + 1
}

export async function listComplaints() {
    const data = load()
    return Promise.resolve(data)
}

export async function getComplaint(id) {
    const items = load()
    return Promise.resolve(items.find(c => c.id === id) || null)
}

export async function createComplaint(payload) {
    const items = load()
    const id = nextId(items)

    const complaint = {
        id,
        title: payload.title || '',
        description: payload.description || '',
        complainant_name: payload.complainant_name || '',
        complainant_phone: payload.complainant_phone || '',
        complainant_email: payload.complainant_email || '',
        country: payload.country || 'Venezuela',
        state: payload.state || 'Táchira',
        municipality: payload.municipality || 'San Cristóbal',
        parish: payload.parish || '',
        city: payload.city || '',
        zone: payload.zone || '',
        address: payload.address || '',
        location: payload.location || '', // Dirección completa
        assignedOfficerId: payload.assignedOfficerId || null,
        assignedOfficerName: payload.assignedOfficerName || '',
        status: (payload.status || 'received').toLowerCase(),
        priority: (payload.priority || 'medium').toLowerCase(),
        evidence: payload.evidence || [],
        incidentDate: payload.incidentDate || new Date().toISOString().split('T')[0],
        latitude: payload.latitude || null,
        longitude: payload.longitude || null,
        createdAt: new Date().toISOString()
    }

    items.push(complaint)
    save(items)
    return Promise.resolve(complaint)
}

export async function updateComplaint(id, payload) {
    const items = load()
    const idx = items.findIndex(c => c.id === id)
    if (idx === -1) return Promise.reject(new Error('Complaint not found'))

    const updatedPayload = { ...payload }
    if (payload.status) updatedPayload.status = payload.status.toLowerCase()
    if (payload.priority) updatedPayload.priority = payload.priority.toLowerCase()

    items[idx] = {
        ...items[idx],
        ...updatedPayload
    }
    save(items)
    return Promise.resolve(items[idx])
}

export async function changeComplaintStatus(id, newStatus) {
    return updateComplaint(id, { status: newStatus.toLowerCase() })
}

export async function deleteComplaint(id) {
    const items = load()
    const filtered = items.filter(c => c.id !== id)
    save(filtered)
    return Promise.resolve({ success: true })
}