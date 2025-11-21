const KEY = 'mock_judicial_notifications_v1'

// Datos iniciales de notificaciones
const initialNotifications = [
    {
        id: 1,
        case_number: "CASE-2024-001",
        case_title: "Robo en vía pública",
        case_description: "Caso de robo de celular en centro comercial",
        judge_id: 2, // ID del funcionario Carlos Rodríguez
        judge_name: "Carlos Rodríguez",
        court: "Juzgado Primero Penal",
        hearing_date: "2024-02-15",
        hearing_time: "09:00",
        trial_date: "2024-03-20",
        trial_time: "10:00",
        location: "Palacio de Justicia, Sala 4A",
        status: "programado",
        priority: "alta",
        created_by: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
]

function load() {
    try {
        const raw = localStorage.getItem(KEY)
        if (!raw) {
            save(initialNotifications)
            return initialNotifications
        }
        const parsed = JSON.parse(raw)
        return parsed && parsed.length > 0 ? parsed : initialNotifications
    } catch (e) { 
        console.error('Error loading notifications:', e)
        return initialNotifications 
    }
}

function save(items) { 
    try { 
        localStorage.setItem(KEY, JSON.stringify(items)) 
    } catch(e){ 
        console.warn('Error saving notifications:', e) 
    } 
}

function nextId(items){ 
    const maxId = items.reduce((max, item) => Math.max(max, item.id || 0), 0)
    return maxId + 1
}

export async function listNotifications() {
    const data = load()
    return Promise.resolve(data)
}

export async function getNotification(id) {
    const items = load()
    return Promise.resolve(items.find(n => n.id === id) || null)
}

export async function createNotification(payload) {
    const items = load()
    const id = nextId(items)
    
    const notification = {
        id,
        case_number: payload.case_number || `CASE-${new Date().getFullYear()}-${String(items.length + 1).padStart(3, '0')}`,
        case_title: payload.case_title || '',
        case_description: payload.case_description || '',
        judge_id: payload.judge_id || null,
        judge_name: payload.judge_name || '',
        court: payload.court || '',
        hearing_date: payload.hearing_date || '',
        hearing_time: payload.hearing_time || '09:00',
        trial_date: payload.trial_date || '',
        trial_time: payload.trial_time || '10:00',
        location: payload.location || '',
        status: payload.status || 'programado',
        priority: payload.priority || 'media',
        funcionaries: payload.funcionaries || [],
        witnesses: payload.witnesses || [],
        jury: payload.jury || [],
        created_by: payload.created_by || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
    
    items.push(notification)
    save(items)
    return Promise.resolve(notification)
}

export async function updateNotification(id, payload) {
    const items = load()
    const idx = items.findIndex(n => n.id === id)
    if (idx === -1) return Promise.reject(new Error('Notification not found'))
    
    items[idx] = {
        ...items[idx],
        ...payload,
        updated_at: new Date().toISOString()
    }
    save(items)
    return Promise.resolve(items[idx])
}

export async function deleteNotification(id) {
    const items = load()
    const filtered = items.filter(n => n.id !== id)
    save(filtered)
    return Promise.resolve({ success: true })
}

// Obtener todos los funcionarios activos
export async function getFuncionaries() {
    try {
        const usersModule = await import('./users.js')
        const users = await usersModule.listUsers()
        return users.filter(user => user.role === 'funcionario' && user.status === 'activo')
    } catch (error) {
        console.error('Error loading funcionaries:', error)
        return []
    }
}

// Obtener ciudadanos para testigos y jurado
export async function getCitizens() {
    try {
        const usersModule = await import('./users.js')
        const users = await usersModule.listUsers()
        return users.filter(user => user.role === 'civil' && user.status === 'activo')
    } catch (error) {
        console.error('Error loading citizens:', error)
        return []
    }
}

// Obtener todos los usuarios activos (para búsqueda general)
export async function getActiveUsers() {
    try {
        const usersModule = await import('./users.js')
        const users = await usersModule.listUsers()
        return users.filter(user => user.status === 'activo')
    } catch (error) {
        console.error('Error loading active users:', error)
        return []
    }
}