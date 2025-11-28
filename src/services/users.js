const KEY = 'mock_users_v1'

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
        status: "activo",
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
        status: "activo",
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
        status: "activo",
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
        status: "suspendido",
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
    } catch(e){ 
        console.warn('Error saving users:', e) 
    } 
}

function nextId(items){ 
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
        status: payload.status || 'activo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
    
    items.push(user)
    save(items)
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
    return Promise.resolve(items[idx])
}

export async function deleteUser(id) {
    const items = load()
    const filtered = items.filter(u => u.id !== id)
    save(filtered)
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
    return Promise.resolve(items[idx])
}