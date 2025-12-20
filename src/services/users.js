const KEY = 'mock_users_v1'
import { createOfficer, updateOfficer, getOfficerByDocument, deleteOfficerByDocument } from './officers'

const initialUsers = [
    {
        id: 1,
        dni: "V-12345678",
        first_name: "Admin",
        last_name: "System",
        password: "admin123",
        phone: "0414-1112233",
        email: "admin@sistema.com",
        role: "administrator",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 2,
        dni: "V-87654321",
        first_name: "Carlos",
        last_name: "Rodríguez",
        password: "oficial123",
        phone: "0414-4445566",
        email: "carlos.rodriguez@policia.gov",
        role: "officer",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 3,
        dni: "V-11223344",
        first_name: "María",
        last_name: "González",
        password: "civil123",
        phone: "0424-7778899",
        email: "maria.gonzalez@email.com",
        role: "civil",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 4,
        dni: "V-55667788",
        first_name: "Luis",
        last_name: "Pérez",
        password: "funcionario123",
        phone: "0412-3334455",
        email: "luis.perez@gobierno.gov",
        role: "functionary",
        status: "suspended",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
]

function load() {
    try {
        const raw = localStorage.getItem(KEY)
        if (!raw) {
            save(initialUsers)
            return initialUsers
        }
        const parsed = JSON.parse(raw)
        return parsed && parsed.length > 0 ? parsed : initialUsers
    } catch (e) {
        console.error('Error loading users:', e)
        return initialUsers
    }
}

function save(items) {
    try {
        localStorage.setItem(KEY, JSON.stringify(items))
    } catch (e) {
        console.warn('Error saving users:', e)
    }
}

function nextId(items) {
    const maxId = items.reduce((max, item) => Math.max(max, item.id || 0), 0)
    return maxId + 1
}

export async function listUsers() {
    const data = load()
    console.log('Loading users:', data)
    return Promise.resolve(data)
}

export async function getUser(id) {
    const items = load()
    return Promise.resolve(items.find(u => u.id === id) || null)
}

export async function createUser(payload) {
    const items = load()
    const id = nextId(items)

    const user = {
        id,
        dni: payload.dni || '',
        first_name: payload.first_name || '',
        last_name: payload.last_name || '',
        password: payload.password || '',
        phone: payload.phone || '',
        email: payload.email || '',
        role: payload.role || 'civil',
        status: payload.status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }

    items.push(user)
    save(items)

    if (user.role === 'officer' || user.role === 'oficial') {
        try {
            await createOfficer({
                name: user.first_name,
                lastName: user.last_name,
                idNumber: user.dni,
                email: user.email,
                phone: user.phone,
                unit: 'Pending Assignment',
                rank: 'Pending Assignment',
                status: user.status.toLowerCase()
            })
        } catch (e) {
            console.error('Error syncing officer creation:', e)
        }
    }

    return Promise.resolve(user)
}

export async function updateUser(id, payload) {
    const items = load()
    const idx = items.findIndex(u => u.id === id)
    if (idx === -1) return Promise.reject(new Error('User not found'))

    items[idx] = {
        ...items[idx],
        ...payload,
        updatedAt: new Date().toISOString()
    }
    save(items)

    const updatedUser = items[idx]

    try {
        const existingOfficer = await getOfficerByDocument(updatedUser.dni)
        const isOfficerRole = updatedUser.role.toLowerCase() === 'officer' || updatedUser.role.toLowerCase() === 'oficial'

        if (isOfficerRole) {
            const officerData = {
                name: updatedUser.first_name,
                lastName: updatedUser.last_name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                status: updatedUser.status.toLowerCase()
            }

            if (existingOfficer) {
                await updateOfficer(existingOfficer.id, officerData)
            } else {
                await createOfficer({
                    ...officerData,
                    idNumber: updatedUser.dni,
                    unit: 'Pending Assignment',
                    rank: 'Pending Assignment'
                })
            }
        } else {
            // Requirement: If role changes from officer, set officer status to inactive
            if (existingOfficer) {
                await updateOfficer(existingOfficer.id, {
                    status: 'inactive'
                })
            }
        }
    } catch (e) {
        console.error('Error syncing officer update:', e)
    }

    return Promise.resolve(updatedUser)
}

export async function deleteUser(id) {
    const items = load()
    const userToDelete = items.find(u => u.id === id)
    const filtered = items.filter(u => u.id !== id)
    save(filtered)

    if (userToDelete && (userToDelete.role === 'officer' || userToDelete.role === 'oficial' || userToDelete.dni)) {
        try {
            await deleteOfficerByDocument(userToDelete.dni)
        } catch (e) {
            console.error('Error deleting synced officer:', e)
        }
    }

    return Promise.resolve({ success: true })
}

export async function changeUserStatus(id, newStatus) {
    const items = load()
    const idx = items.findIndex(u => u.id === id)
    if (idx === -1) return Promise.reject(new Error('User not found'))

    items[idx] = {
        ...items[idx],
        status: newStatus.toLowerCase(),
        updatedAt: new Date().toISOString()
    }
    save(items)

    try {
        const officerKey = 'mock_officers_v1'
        const rawOfficers = localStorage.getItem(officerKey)
        if (rawOfficers) {
            const officers = JSON.parse(rawOfficers)
            const userDoc = items[idx].dni
            const oIdx = officers.findIndex(o => o.idNumber === userDoc)

            if (oIdx !== -1) {
                const mappedStatus = newStatus.toLowerCase()
                if (officers[oIdx].status !== mappedStatus) {
                    officers[oIdx].status = mappedStatus
                    officers[oIdx].active = mappedStatus === 'active'
                    localStorage.setItem(officerKey, JSON.stringify(officers))
                }
            }
        }
    } catch (e) {
        console.error('Error syncing user status to officer:', e)
    }

    return Promise.resolve(items[idx])
}

export async function changeUserRole(id, newRole) {
    const items = load()
    const idx = items.findIndex(u => u.id === id)
    if (idx === -1) return Promise.reject(new Error('User not found'))

    items[idx] = {
        ...items[idx],
        role: newRole.toLowerCase(),
        updatedAt: new Date().toISOString()
    }
    save(items)

    const updatedUser = items[idx]

    try {
        const existingOfficer = await getOfficerByDocument(updatedUser.dni)
        const isOfficerRole = newRole.toLowerCase() === 'officer' || newRole.toLowerCase() === 'oficial'

        if (isOfficerRole) {
            if (!existingOfficer) {
                await createOfficer({
                    name: updatedUser.first_name,
                    lastName: updatedUser.last_name,
                    idNumber: updatedUser.dni,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    unit: 'Pending Assignment',
                    rank: 'Pending Assignment',
                    status: updatedUser.status.toLowerCase()
                })
            } else {
                // If they are already an officer, just ensure they are active (or match status)
                await updateOfficer(existingOfficer.id, {
                    status: updatedUser.status.toLowerCase()
                })
            }
        } else {
            // Requirement: If role changes from officer, set officer status to inactive
            if (existingOfficer) {
                await updateOfficer(existingOfficer.id, {
                    status: 'inactive'
                })
            }
        }
    } catch (e) {
        console.error('Error syncing officer role change:', e)
    }

    return Promise.resolve(updatedUser)
}