const KEY = 'mock_users_v1'
import { createOfficer, updateOfficer, getOfficerByDocument, deleteOfficerByDocument } from './officers'

const initialUsers = [
    {
        id: 1,
        document: "V-12345678",
        first_name: "Admin",
        last_name: "System",
        password: "admin123",
        number_phone: "0414-1112233",
        gmail: "admin@sistema.com",
        role: "administrador",
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 2,
        document: "V-87654321",
        first_name: "Carlos",
        last_name: "Rodríguez",
        password: "oficial123",
        number_phone: "0414-4445566",
        gmail: "carlos.rodriguez@policia.gov",
        role: "funcionario",
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 3,
        document: "V-11223344",
        first_name: "María",
        last_name: "González",
        password: "civil123",
        number_phone: "0424-7778899",
        gmail: "maria.gonzalez@email.com",
        role: "civil",
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 4,
        document: "V-55667788",
        first_name: "Luis",
        last_name: "Pérez",
        password: "funcionario123",
        number_phone: "0412-3334455",
        gmail: "luis.perez@gobierno.gov",
        role: "funcionario",
        status: "Suspended",
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
        document: payload.document || '',
        first_name: payload.first_name || '',
        last_name: payload.last_name || '',
        password: payload.password || '',
        number_phone: payload.number_phone || '',
        gmail: payload.gmail || '',
        role: payload.role || 'civil',
        status: payload.status || 'Active',
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
                idNumber: user.document,
                email: user.gmail,
                phone: user.number_phone,
                unit: 'Pending Assignment',
                rank: 'Pending Assignment',
                status: user.status === 'Active' ? 'Active' : 'Inactive'
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
        const existingOfficer = await getOfficerByDocument(updatedUser.document)
        const isOfficerRole = updatedUser.role === 'officer' || updatedUser.role === 'oficial'

        if (isOfficerRole) {
            if (existingOfficer) {
                await updateOfficer(existingOfficer.id, {
                    name: updatedUser.first_name,
                    lastName: updatedUser.last_name,
                    email: updatedUser.gmail,
                    phone: updatedUser.number_phone,
                    status: updatedUser.status === 'Active' ? 'Active' : 'Inactive'
                })
            } else {
                await createOfficer({
                    name: updatedUser.first_name,
                    lastName: updatedUser.last_name,
                    idNumber: updatedUser.document,
                    email: updatedUser.gmail,
                    phone: updatedUser.number_phone,
                    unit: 'Pending Assignment',
                    rank: 'Pending Assignment',
                    status: updatedUser.status === 'Active' ? 'Active' : 'Inactive'
                })
            }
        } else {
            // If role changed FROM officer to something else, deactivate officer, don't delete
            if (existingOfficer) {
                await updateOfficer(existingOfficer.id, {
                    status: 'Inactive'
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

    if (userToDelete && (userToDelete.role === 'officer' || userToDelete.role === 'oficial' || userToDelete.document)) {
        try {
            await deleteOfficerByDocument(userToDelete.document)
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
        status: newStatus,
        updatedAt: new Date().toISOString()
    }
    save(items)

    try {
        const officerKey = 'mock_officers_v1'
        const rawOfficers = localStorage.getItem(officerKey)
        if (rawOfficers) {
            const officers = JSON.parse(rawOfficers)
            const userDoc = items[idx].document
            const oIdx = officers.findIndex(o => o.idNumber === userDoc)

            if (oIdx !== -1) {
                // Statuses are now unified
                const mappedStatus = newStatus
                if (officers[oIdx].status !== mappedStatus) {
                    officers[oIdx].status = mappedStatus
                    officers[oIdx].active = mappedStatus === 'Active'
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
        role: newRole,
        updatedAt: new Date().toISOString()
    }
    save(items)

    const updatedUser = items[idx]

    try {
        const existingOfficer = await getOfficerByDocument(updatedUser.document)
        const isOfficerRole = newRole === 'officer' || newRole === 'oficial'

        if (isOfficerRole) {
            if (!existingOfficer) {
                await createOfficer({
                    name: updatedUser.first_name,
                    lastName: updatedUser.last_name,
                    idNumber: updatedUser.document,
                    email: updatedUser.gmail,
                    phone: updatedUser.number_phone,
                    unit: 'Pending Assignment',
                    rank: 'Pending Assignment',
                    status: updatedUser.status === 'Active' ? 'Active' : 'Inactive'
                })
            } else {
            }
        } else {
            // Role is NOT officer, mark as Inactive if exists (DO NOT DELETE)
            if (existingOfficer) {
                await updateOfficer(existingOfficer.id, {
                    status: 'Inactive'
                })
            }
        }
    } catch (e) {
        console.error('Error syncing officer role change:', e)
    }

    return Promise.resolve(updatedUser)
}