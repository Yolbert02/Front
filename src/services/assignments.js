const KEY = 'mock_assignments_v1'

const initialAssignments = [
    {
        id: 1,
        case_number: "CASE-2024-001",
        case_title: "Robbery in public place",
        case_description: "Case of cell phone robbery in mall",
        judge_id: 2,
        judge_name: "Carlos Rodríguez",
        court: "First Penal Court",
        hearing_date: "2024-02-15",
        hearing_time: "09:00",
        trial_date: "2024-03-20",
        trial_time: "10:00",
        location: "Justice Palace, Room 4A",
        status: "scheduled",
        priority: "high",
        created_by: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
]

function load() {
    try {
        const raw = localStorage.getItem(KEY)
        if (!raw) {
            save(initialAssignments)
            return initialAssignments
        }
        const parsed = JSON.parse(raw)
        return parsed && parsed.length > 0 ? parsed : initialAssignments
    } catch (e) {
        console.error('Error loading assignments:', e)
        return initialAssignments
    }
}

function save(items) {
    try {
        localStorage.setItem(KEY, JSON.stringify(items))
    } catch (e) {
        console.warn('Error saving assignments:', e)
    }
}

function nextId(items) {
    const maxId = items.reduce((max, item) => Math.max(max, item.id || 0), 0)
    return maxId + 1
}

export async function listAssignments() {
    const data = load()
    return Promise.resolve(data)
}

export async function getAssignment(id) {
    const items = load()
    return Promise.resolve(items.find(n => n.id === id) || null)
}

export async function createAssignment(payload) {
    const items = load()
    const id = nextId(items)

    const assignment = {
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
        status: payload.status?.toLowerCase() || 'scheduled',
        priority: payload.priority?.toLowerCase() || 'medium',
        funcionaries: payload.funcionaries || [],
        witnesses: payload.witnesses || [],
        jury: payload.jury || [],
        created_by: payload.created_by || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }

    items.push(assignment)
    save(items)
    return Promise.resolve(assignment)
}

export async function updateAssignment(id, payload) {
    const items = load()
    const idx = items.findIndex(n => n.id === id)
    if (idx === -1) return Promise.reject(new Error('Assignment not found'))

    items[idx] = {
        ...items[idx],
        ...payload,
        updated_at: new Date().toISOString()
    }
    save(items)
    return Promise.resolve(items[idx])
}

export async function changeAssignmentStatus(id, newStatus) {
    return updateAssignment(id, { status: newStatus })
}

export async function deleteAssignment(id) {
    const items = load()
    const filtered = items.filter(n => n.id !== id)
    save(filtered)
    return Promise.resolve({ success: true })
}

export async function getFuncionaries() {
    try {
        const usersModule = await import('./users.js')
        const users = await usersModule.listUsers()
        return users.filter(user =>
            (user.role?.toLowerCase() === 'officer' || user.role?.toLowerCase() === 'functionary' || user.role?.toLowerCase() === 'funcionario') &&
            user.status?.toLowerCase() === 'active'
        )
    } catch (error) {
        console.error('Error loading funcionaries:', error)
        return []
    }
}

export async function getCitizens() {
    try {
        const usersModule = await import('./users.js')
        const users = await usersModule.listUsers()
        return users.filter(user => user.role?.toLowerCase() === 'civil' && user.status?.toLowerCase() === 'active')
    } catch (error) {
        console.error('Error loading citizens:', error)
        return []
    }
}

export async function getActiveUsers() {
    try {
        const usersModule = await import('./users.js')
        const users = await usersModule.listUsers()
        return users.filter(user => user.status?.toLowerCase() === 'active')
    } catch (error) {
        console.error('Error loading active users:', error)
        return []
    }
}