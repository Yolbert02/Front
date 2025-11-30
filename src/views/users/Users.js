import React, { useEffect, useState } from 'react'
import { 
    CCard, 
    CCardBody, 
    CCardHeader,
    CContainer,
    CRow,
    CCol,
    CButton,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CBadge,
    CSpinner,
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash, cilUser, cilShieldAlt, cilPeople, cilBan, cilInfo } from '@coreui/icons'
import UserForm from './UserForm'
import InfoUser from './InfoUser'
import { listUsers, createUser, updateUser, deleteUser, changeUserStatus, changeUserRole } from 'src/services/users'
import AvatarLetter from 'src/components/AvatarLetter'
import ConfirmationModal from 'src/components/ConfirmationModal'

const Users = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [showInfo, setShowInfo] = useState(false)
    const [editing, setEditing] = useState(null)
    const [selectedUser, setSelectedUser] = useState(null)
    
    const [deleteModal, setDeleteModal] = useState({
        visible: false,
        userId: null,
        userName: ''
    })

    useEffect(() => { 
        console.log('Users component mounted')
        fetchData() 
    }, [])

    async function fetchData() { 
        console.log('Fetching users...')
        setLoading(true)
        try {
            const res = await listUsers()
            console.log('Users loaded:', res)
            setData(res || [])
        } catch (error) {
            console.error('Error fetching users:', error)
            setData([])
        } finally {
            setLoading(false)
        }
    }

    async function handleSave(payload) {
        console.log('Saving user:', payload)
        try {
            if (editing && editing.id) {
                await updateUser(editing.id, payload)
            } else {
                await createUser(payload)
            }
            setShowForm(false)
            setEditing(null)
            await fetchData()
        } catch (error) {
            console.error('Error saving user:', error)
            alert('Error saving user: ' + error.message)
        }
    }

    const showDeleteConfirmation = (id, name) => {
        setDeleteModal({
            visible: true,
            userId: id,
            userName: name
        })
    }

    async function handleDelete(id) {
        try {
            await deleteUser(id)
            await fetchData()
            console.log('User deleted successfully')
        } catch (error) {
            console.error('Error deleting user:', error)
            alert('Error deleting user: ' + error.message)
        }
    }

    const confirmDelete = () => {
        if (deleteModal.userId) {
            handleDelete(deleteModal.userId)
        }
        setDeleteModal({ visible: false, userId: null, userName: '' })
    }

    async function handleStatusChange(userId, newStatus) {
        try {
            await changeUserStatus(userId, newStatus)
            await fetchData()
        } catch (error) {
            console.error('Error changing user status:', error)
            alert('Error changing status: ' + error.message)
        }
    }

    async function handleRoleChange(userId, newRole) {
        try {
            await changeUserRole(userId, newRole)
            await fetchData()
        } catch (error) {
            console.error('Error changing user role:', error)
            alert('Error changing role: ' + error.message)
        }
    }

    const handleShowInfo = (user) => {
        setSelectedUser(user)
        setShowInfo(true)
    }

    const getRoleBadge = (role) => {
        const roleConfig = {
            'administrador': { color: 'danger', text: 'Administrator', icon: cilShieldAlt },
            'funcionario': { color: 'info', text: 'Funcionary', icon: cilPeople },
            'civil': { color: 'success', text: 'Civil', icon: cilUser }
        }
        
        const config = roleConfig[role] || { color: 'secondary', text: role, icon: cilUser }
        return (
            <CBadge color={config.color}>
                <CIcon icon={config.icon} className="me-1" />
                {config.text}
            </CBadge>
        )
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            'activo': { color: 'success', text: 'Active' },
            'suspendido': { color: 'warning', text: 'Suspended' },
            'eliminado': { color: 'danger', text: 'Deleted' }
        }
        
        const config = statusConfig[status] || { color: 'secondary', text: status }
        return <CBadge color={config.color}>{config.text}</CBadge>
    }

    const getRoleOptions = (currentRole) => {
        const roles = [
            { value: 'administrador', label: 'Administrator', icon: cilShieldAlt },
            { value: 'funcionario', label: 'Funcionary', icon: cilPeople },
            { value: 'civil', label: 'Civil', icon: cilUser }
        ]
        return roles.filter(role => role.value !== currentRole)
    }

    const getStatusOptions = (currentStatus) => {
        const statuses = [
            { value: 'activo', label: 'Active' },
            { value: 'suspendido', label: 'Suspended' },
            { value: 'eliminado', label: 'Deleted' }
        ]
        return statuses.filter(status => status.value !== currentStatus)
    }

    return (
        <CContainer fluid>
            <CRow>
                <CCol>
                    <CCard>
                        <CCardHeader>
                            <div className="d-flex justify-content-between align-items-center">
                                <h4 className="mb-0">Users Management</h4>
                                <CButton 
                                    color="primary" 
                                    onClick={() => { 
                                        setEditing(null); 
                                        setShowForm(true) 
                                    }}
                                >
                                    <CIcon icon={cilPlus} className="me-2" />
                                    New User
                                </CButton>
                            </div>
                        </CCardHeader>
                        <CCardBody>
                            {loading ? (
                                <div className="text-center py-4">
                                    <CSpinner color="primary" />
                                    <div className="mt-2">Loading users...</div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-3 text-muted">
                                        Showing {data.length} user(s)
                                    </div>
                                    
                                    {data.length > 0 ? (
                                        <CTable hover responsive>
                                            <CTableHead>
                                                <CTableRow>
                                                    <CTableHeaderCell style={{ width: '70px' }}></CTableHeaderCell>
                                                    <CTableHeaderCell>ID</CTableHeaderCell>
                                                    <CTableHeaderCell>Document</CTableHeaderCell>
                                                    <CTableHeaderCell>Name</CTableHeaderCell>
                                                    <CTableHeaderCell>Email</CTableHeaderCell>
                                                    <CTableHeaderCell>Phone</CTableHeaderCell>
                                                    <CTableHeaderCell>Role</CTableHeaderCell>
                                                    <CTableHeaderCell>Status</CTableHeaderCell>
                                                    <CTableHeaderCell style={{ width: '200px' }}>Actions</CTableHeaderCell>
                                                </CTableRow>
                                            </CTableHead>
                                            <CTableBody>
                                                {data.map(user => (
                                                    <CTableRow key={user.id}>
                                                        <CTableDataCell>
                                                            <AvatarLetter 
                                                                name={`${user.first_name}`} 
                                                                size={40} 
                                                            />
                                                        </CTableDataCell>
                                                        <CTableDataCell>#{user.id}</CTableDataCell>
                                                        <CTableDataCell>{user.document}</CTableDataCell>
                                                        <CTableDataCell>
                                                            <strong>{user.first_name} {user.last_name}</strong>
                                                        </CTableDataCell>
                                                        <CTableDataCell>{user.gmail}</CTableDataCell>
                                                        <CTableDataCell>{user.number_phone}</CTableDataCell>
                                                        <CTableDataCell>
                                                            {getRoleBadge(user.role)}
                                                        </CTableDataCell>
                                                        <CTableDataCell>
                                                            {getStatusBadge(user.status)}
                                                        </CTableDataCell>
                                                        <CTableDataCell>
                                                            <div className="d-flex gap-2">
                                                                <CButton 
                                                                    size="sm" 
                                                                    color="success" 
                                                                    variant="outline"
                                                                    onClick={() => handleShowInfo(user)}
                                                                    title="View user information"
                                                                >
                                                                    <CIcon icon={cilInfo} />
                                                                </CButton>
                                                                
                                                                <CDropdown>
                                                                    <CDropdownToggle color="primary" size="sm" variant="outline">
                                                                        <CIcon icon={cilPencil} />
                                                                    </CDropdownToggle>
                                                                    <CDropdownMenu>
                                                                        <CDropdownItem onClick={() => { setEditing(user); setShowForm(true) }}>
                                                                            Edit User
                                                                        </CDropdownItem>
                                                                        <CDropdownItem divider />
                                                                        <CDropdownItem header>Change Role</CDropdownItem>
                                                                        {getRoleOptions(user.role).map(role => (
                                                                            <CDropdownItem 
                                                                                key={role.value}
                                                                                onClick={() => handleRoleChange(user.id, role.value)}
                                                                            >
                                                                                <CIcon icon={role.icon} className="me-2" />
                                                                                Change to {role.label}
                                                                            </CDropdownItem>
                                                                        ))}
                                                                        <CDropdownItem divider />
                                                                        <CDropdownItem header>Change Status</CDropdownItem>
                                                                        {getStatusOptions(user.status).map(status => (
                                                                            <CDropdownItem 
                                                                                key={status.value}
                                                                                onClick={() => handleStatusChange(user.id, status.value)}
                                                                            >
                                                                                <CIcon icon={cilBan} className="me-2" />
                                                                                Mark as {status.label}
                                                                            </CDropdownItem>
                                                                        ))}
                                                                    </CDropdownMenu>
                                                                </CDropdown>
                                                                <CButton 
                                                                    size="sm" 
                                                                    color="danger" 
                                                                    variant="outline"
                                                                    onClick={() => showDeleteConfirmation(user.id, `${user.first_name} ${user.last_name}`)}
                                                                    disabled={user.role === 'administrador'}
                                                                >
                                                                    <CIcon icon={cilTrash} />
                                                                </CButton>
                                                            </div>
                                                        </CTableDataCell>
                                                    </CTableRow>
                                                ))}
                                            </CTableBody>
                                        </CTable>
                                    ) : (
                                        <div className="text-center py-5">
                                            <div className="text-muted">
                                                <h5>No users found</h5>
                                                <p>Start by adding a new user to the system.</p>
                                                <CButton 
                                                    color="primary" 
                                                    onClick={() => { 
                                                        setEditing(null); 
                                                        setShowForm(true) 
                                                    }}
                                                >
                                                    Add First User
                                                </CButton>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <UserForm 
                visible={showForm} 
                onClose={() => {
                    setShowForm(false)
                    setEditing(null)
                }} 
                onSave={handleSave} 
                initial={editing} 
            />

            <InfoUser 
                visible={showInfo}
                onClose={() => {
                    setShowInfo(false)
                    setSelectedUser(null)
                }}
                user={selectedUser}
            />

            <ConfirmationModal
                visible={deleteModal.visible}
                onClose={() => setDeleteModal({ visible: false, userId: null, userName: '' })}
                onConfirm={confirmDelete}
                title="Delete User"
                message={`Are you sure you want to delete the user "${deleteModal.userName}"? This action cannot be undone.`}
                confirmText="Delete"
                type="danger"
            />
        </CContainer>
    )
}

export default Users