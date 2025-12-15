const KEY = 'mock_complaints_v1'

const initialComplaints = [
    {
        id: 1,
        title: "Street robbery",
        description: "Cell phone theft near the main square of Pueblo Nuevo",
        complainantName: "Maria Gonzalez",
        complainantPhone: "0414-1112233",
        complainantEmail: "maria.gonzalez@email.com",
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
        status: "Under Investigation",
        priority: "High",
        lat: 7.785,
        lng: -72.220,
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
        complainantName: "Jose Lopez",
        complainantPhone: "0424-5556677",
        complainantEmail: "jose.lopez@email.com",
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
        status: "Received",
        priority: "Medium",
        lat: 7.768,
        lng: -72.215,
        evidence: [],
        incidentDate: "2024-01-14",
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        title: "Traffic accident",
        description: "Collision at intersection in La Concordia",
        complainantName: "Pedro Perez",
        complainantPhone: "0412-9998877",
        complainantEmail: "pedro.perez@email.com",
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
        status: "Resolved",
        priority: "Low",
        lat: 7.740,
        lng: -72.225,
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
        complainantName: payload.complainantName || '',
        complainantPhone: payload.complainantPhone || '',
        complainantEmail: payload.complainantEmail || '',
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
        status: payload.status || 'Received',
        priority: payload.priority || 'Medium',
        evidence: payload.evidence || [],
        incidentDate: payload.incidentDate || new Date().toISOString().split('T')[0],
        lat: payload.lat || null,
        lng: payload.lng || null,
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

    items[idx] = {
        ...items[idx],
        ...payload
    }
    save(items)
    return Promise.resolve(items[idx])
}

export async function changeComplaintStatus(id, newStatus) {
    return updateComplaint(id, { status: newStatus })
}

export async function deleteComplaint(id) {
    const items = load()
    const filtered = items.filter(c => c.id !== id)
    save(filtered)
    return Promise.resolve({ success: true })
}