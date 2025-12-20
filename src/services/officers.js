const KEY = 'mock_officers_v1'
import { getUser, listUsers, updateUser } from './users' // Import user services for sync

const initialOfficers = [
    {
        id: 1,
        name: 'Carlos',
        lastName: 'Rodríguez',
        idNumber: 'V-12345678',
        unit: 'CICPC - Homicidios',
        email: 'carlos.rodriguez@policia.gov',
        phone: '0414-1112233',
        rank: 'Detective',
        status: 'active',
        active: true
    },
    {
        id: 2,
        name: 'Ana',
        lastName: 'Martínez',
        idNumber: 'V-27654321',
        unit: 'Policía Municipal',
        email: 'ana.martinez@mp.gov',
        phone: '0424-4445566',
        rank: 'Sergeant',
        status: 'active',
        active: true
    },
    {
        id: 3,
        name: 'Luis',
        lastName: 'González',
        idNumber: 'V-11223344',
        unit: 'PATRI - Antiextorsión',
        email: 'luis.gonzalez@polincia.gov',
        phone: '0412-7788990',
        rank: 'Officer',
        status: 'training',
        active: false
    }
]

function load() {
    try {
        const raw = localStorage.getItem(KEY)
        if (!raw) {
            console.log('No data in localStorage, using initial officers')
            return initialOfficers
        }
        const parsed = JSON.parse(raw)
        return parsed && parsed.length > 0 ? parsed : initialOfficers
    } catch (e) {
        console.error('Error loading officers, using initial data:', e)
        return initialOfficers
    }
}

function save(items) {
    try {
        localStorage.setItem(KEY, JSON.stringify(items))
    } catch (e) {
        console.warn('Error saving officers:', e)
    }
}

function nextId(items) {
    const maxId = items.reduce((max, item) => Math.max(max, item.id || 0), 0)
    return maxId + 1
}

export async function listOfficers() {
    const data = load()
    console.log('Loading officers:', data)
    return Promise.resolve(data)
}

export async function getOfficer(id) {
    const items = load()
    return Promise.resolve(items.find(o => o.id === id) || null)
}

export async function getOfficerByDocument(doc) {
    const items = load()
    return Promise.resolve(items.find(o => o.idNumber === doc) || null)
}

export async function deleteOfficerByDocument(doc) {
    const items = load()
    const filtered = items.filter(o => o.idNumber !== doc)
    save(filtered)
    return Promise.resolve({ success: true })
}

export async function createOfficer(payload) {
    const items = load()
    const id = nextId(items)
    const officerStatus = (payload.status || 'active').toLowerCase()
    const officer = {
        id,
        name: payload.name || '',
        lastName: payload.lastName || '',
        idNumber: payload.idNumber || '',
        unit: payload.unit || '',
        email: payload.email || '',
        phone: payload.phone || '',
        rank: payload.rank || '',
        status: officerStatus,
        active: officerStatus === 'active'
    }
    items.push(officer)
    save(items)
    return Promise.resolve(officer)
}

export async function updateOfficer(id, payload) {
    const items = load()
    const idx = items.findIndex(o => o.id === id)
    if (idx === -1) return Promise.reject(new Error('Officer not found'))

    const updatedStatus = payload.status ? payload.status.toLowerCase() : items[idx].status

    items[idx] = {
        ...items[idx],
        ...payload,
        status: updatedStatus,
        active: updatedStatus === 'active'
    }
    save(items)

    // Sync status back to user if linked
    if (payload.status) {
        try {
            const allUsers = await listUsers()
            // Important: Use 'dni' instead of 'document'
            const linkedUser = allUsers.find(u => u.dni === items[idx].idNumber)
            if (linkedUser) {
                const newStatus = updatedStatus
                // Only update if different
                if (linkedUser.status !== newStatus) {
                    const userKey = 'mock_users_v1'
                    const rawUsers = localStorage.getItem(userKey)
                    if (rawUsers) {
                        const users = JSON.parse(rawUsers)
                        const uIdx = users.findIndex(u => u.dni === items[idx].idNumber)
                        if (uIdx !== -1) {
                            users[uIdx].status = newStatus
                            users[uIdx].updatedAt = new Date().toISOString()
                            localStorage.setItem(userKey, JSON.stringify(users))
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Error syncing officer status to user:', e)
        }
    }

    return Promise.resolve(items[idx])
}

export async function changeOfficerStatus(id, newStatus) {
    return updateOfficer(id, { status: newStatus })
}

export async function deleteOfficer(id) {
    const items = load()
    const filtered = items.filter(o => o.id !== id)
    save(filtered)
    return Promise.resolve({ success: true })
}

export async function resetToInitial() {
    save(initialOfficers)
    return Promise.resolve(initialOfficers)
}