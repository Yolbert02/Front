import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
    CCard, CCardBody, CCardHeader, CContainer, CRow, CCol,
    CButton, CTable, CTableHead, CTableRow, CTableHeaderCell,
    CTableBody, CTableDataCell, CBadge, CSpinner, CDropdown,
    CDropdownToggle, CDropdownMenu, CDropdownItem, CDropdownDivider, CDropdownHeader
} from '@coreui/react'
import SearchInput from 'src/components/SearchInput'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash, cilUser, cilShieldAlt, cilPeople, cilBan, cilInfo, cilSearch, cilCheckCircle } from '@coreui/icons'
import UserForm from './UserForm'
import InfoUser from './InfoUser'
import { listUsers, createUser, updateUser, deleteUser, changeUserStatus, changeUserRole } from 'src/services/users'
import { colorbutton } from 'src/styles/darkModeStyles'
import AvatarLetter from 'src/components/AvatarLetter'
import ConfirmationModal from 'src/components/ConfirmationModal'
import Pagination from 'src/components/Pagination'

const Users = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [showInfo, setShowInfo] = useState(false)
    const [editing, setEditing] = useState(null)
    const [selectedUser, setSelectedUser] = useState(null)
    const dispatch = useDispatch()
    const userStr = sessionStorage.getItem('user')
    const userRole = userStr ? JSON.parse(userStr).role : 'civil'

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(8)
    const [searchTerm, setSearchTerm] = useState('')

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

    const filteredUsers = data.filter(user => {
        if (!searchTerm) return true

        const searchLower = searchTerm.toLowerCase()
        return (
            user.first_name?.toLowerCase().includes(searchLower) ||
            user.last_name?.toLowerCase().includes(searchLower) ||
            user.dni?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower)
        )
    })

    const getCurrentPageData = () => {
        if (!Array.isArray(filteredUsers) || filteredUsers.length === 0) return []

        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage

        return filteredUsers.slice(startIndex, endIndex)
    }

    const currentPageData = getCurrentPageData()
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    async function handleSave(payload) {
        console.log('Saving user:', payload)
        try {
            if (editing && editing.id) {
                await updateUser(editing.id, payload)
                dispatch({
                    type: 'set',
                    appAlert: {
                        visible: true,
                        color: 'success',
                        message: 'Usuario actualizado con éxito',
                    },
                })
            } else {
                await createUser(payload)
                dispatch({
                    type: 'set',
                    appAlert: {
                        visible: true,
                        color: 'success',
                        message: 'Usuario creado con éxito',
                    },
                })
            }
            setShowForm(false)
            setEditing(null)
            await fetchData()
        } catch (error) {
            console.error('Error saving user:', error)
            dispatch({
                type: 'set',
                appAlert: {
                    visible: true,
                    color: 'danger',
                    message: 'Error al guardar el usuario: ' + error.message,
                },
            })
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
            dispatch({
                type: 'set',
                appAlert: {
                    visible: true,
                    color: 'warning',
                    message: 'Usuario eliminado del sistema',
                },
            })
        } catch (error) {
            console.error('Error deleting user:', error)
            dispatch({
                type: 'set',
                appAlert: {
                    visible: true,
                    color: 'danger',
                    message: 'Error al eliminar al usuario: ' + error.message,
                },
            })
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
            await changeUserStatus(userId, newStatus.toLowerCase())
            await fetchData()
        } catch (error) {
            console.error('Error changing user status:', error)
            alert('Error al cambiar el estado: ' + error.message)
        }
    }

    async function handleRoleChange(userId, newRole) {
        try {
            await changeUserRole(userId, newRole.toLowerCase())
            await fetchData()
        } catch (error) {
            console.error('Error changing user role:', error)
            alert('Error al cambiar el rol: ' + error.message)
        }
    }

    const handleShowInfo = (user) => {
        setSelectedUser(user)
        setShowInfo(true)
    }

    const getRoleBadge = (role) => {
        const r = role?.toLowerCase()
        const roleConfig = {
            'administrator': { color: 'warning', text: 'ADMINISTRADOR', icon: cilShieldAlt, textColor: 'text-dark' },
            'functionary': { color: 'primary', text: 'FUNCIONARIO', icon: cilShieldAlt, textColor: 'text-white' },
            'officer': { color: 'info', text: 'OFICIAL', icon: cilShieldAlt, textColor: 'text-white' },
            'civil': { color: 'light', text: 'CIVIL', icon: cilUser, textColor: 'text-dark' }
        }

        const config = roleConfig[r] || { color: 'secondary', text: role?.toUpperCase(), icon: cilUser, textColor: 'text-white' }
        return (
            <CBadge
                color={config.color}
                className={`d-flex align-items-center gap-2 px-3 py-2 ${config.textColor}`}
                shape="rounded-pill"
            >
                <CIcon icon={config.icon} size="sm" />
                {config.text}
            </CBadge>
        )
    }

    const getStatusBadge = (status) => {
        const s = status?.toLowerCase()
        const statusConfig = {
            'active': { color: 'success', text: 'Activo' },
            'suspended': { color: 'warning', text: 'Suspendido' },
            'inactive': { color: 'secondary', text: 'Inactivo' },
            'deleted': { color: 'danger', text: 'Eliminado' }
        }

        const config = statusConfig[s] || { color: 'secondary', text: status }
        return (
            <CBadge color={config.color} shape="rounded-pill" className="px-2">
                {config.text}
            </CBadge>
        )
    }

    const getRoleOptions = (currentRole) => {
        const r = currentRole?.toLowerCase()
        const roles = [
            { value: 'administrator', label: 'Administrador', icon: cilShieldAlt },
            { value: 'functionary', label: 'Funcionario', icon: cilPeople },
            { value: 'officer', label: 'Oficial', icon: cilPeople },
            { value: 'civil', label: 'Civil', icon: cilUser }
        ]
        return roles.filter(role => role.value !== r)
    }

    const getStatusOptions = (currentStatus) => {
        const s = currentStatus?.toLowerCase()
        const statuses = [
            { value: 'active', label: 'Activo' },
            { value: 'suspended', label: 'Suspendido' },
            { value: 'inactive', label: 'Inactivo' }
        ]
        return statuses.filter(status => status.value !== s)
    }

    return (
        <CContainer fluid>
            <CRow>
                <CCol>
                    <CCard className="shadow-sm border-0 mb-4" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                        <div style={{ height: '5px', background: 'linear-gradient(90deg, #1a237e 0%, #0d47a1 100%)' }}></div>


                        <CCardHeader className="border-bottom-0 pt-4 pb-3 px-4">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                                <div>
                                    <h4 className="mb-1 fw-bold tour-users-title" style={{ letterSpacing: '-0.5px' }}>
                                        <CIcon icon={cilPeople} className="me-2 text-primary" style={{ color: '#1a237e' }} />
                                        Gestión de Usuarios
                                    </h4>
                                    <p className="text-muted mb-0 small">
                                        Control de acceso al sistema y administración de personal
                                    </p>
                                </div>
                                {userRole === 'administrator' && (
                                    <div>
                                        <CButton
                                            color="primary colorbutton"
                                            style={colorbutton}
                                            onClick={() => {
                                                setEditing(null);
                                                setShowForm(true)
                                            }}
                                            className="d-flex align-items-center px-4 py-2 shadow-sm tour-users-new-btn"
                                            shape="rounded-pill"
                                        >
                                            <CIcon icon={cilPlus} className="me-2 fw-bold" />
                                            NUEVO USUARIO
                                        </CButton>
                                    </div>
                                )}
                            </div>
                        </CCardHeader>

                        <CCardBody className="px-4 pb-4">
                            {loading ? (
                                <div className="text-center py-5">
                                    <CSpinner color="primary" variant="grow" />
                                    <div className="mt-3 text-muted">Cargando datos seguros...</div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 p-3 rounded-3 border d-flex justify-content-between align-items-center gap-3 bg-light-subtle dark:bg-dark-subtle">
                                        <div className="text-muted fw-semibold small">
                                            Total de Usuarios: <span className="fs-6">{filteredUsers.length}</span>
                                        </div>

                                        <div style={{ maxWidth: '350px', width: '100%' }} className="tour-users-search">
                                            <SearchInput
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value)
                                                    setCurrentPage(1)
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {currentPageData.length > 0 ? (
                                        <>
                                            <div className="table-responsive border rounded-3 tour-users-table">
                                                <CTable hover align="middle" className="mb-0">
                                                    <CTableHead>
                                                        <CTableRow>
                                                            <CTableHeaderCell className="text-uppercase text-secondary small ps-4 py-3" style={{ fontWeight: 600 }}>Perfil de Usuario</CTableHeaderCell>
                                                            <CTableHeaderCell className="text-uppercase text-secondary small py-3" style={{ fontWeight: 600 }}>Información de Contacto</CTableHeaderCell>
                                                            <CTableHeaderCell className="text-uppercase text-secondary small py-3" style={{ fontWeight: 600 }}>Rol del Sistema</CTableHeaderCell>
                                                            <CTableHeaderCell className="text-uppercase text-secondary small py-3" style={{ fontWeight: 600 }}>Estado</CTableHeaderCell>
                                                            <CTableHeaderCell className="text-uppercase text-secondary small text-end pe-4 py-3" style={{ fontWeight: 600, width: '180px' }}>Acciones</CTableHeaderCell>
                                                        </CTableRow>
                                                    </CTableHead>
                                                    <CTableBody>
                                                        {currentPageData.map((user, index) => (
                                                            <CTableRow key={user.id}>
                                                                <CTableDataCell className="ps-4">
                                                                    <div className="d-flex align-items-center py-2">
                                                                        <AvatarLetter
                                                                            name={user.first_name}
                                                                            lastName={user.last_name}
                                                                            src={user.profile_picture}
                                                                            size={44}
                                                                            className="shadow-sm border border-2 border-white"
                                                                        />
                                                                        <div className="ms-3">
                                                                            <div className="fw-bold">{user.first_name} {user.last_name}</div>
                                                                            <div className="small text-muted font-monospace">{user.dni}</div>
                                                                        </div>
                                                                    </div>
                                                                </CTableDataCell>
                                                                <CTableDataCell>
                                                                    <div className="small">
                                                                        <div className="mb-1">{user.email || 'N/A'}</div>
                                                                        <div className="text-muted">{user.phone || 'N/A'}</div>
                                                                    </div>
                                                                </CTableDataCell>
                                                                <CTableDataCell>
                                                                    {getRoleBadge(user.role)}
                                                                </CTableDataCell>
                                                                <CTableDataCell>
                                                                    {getStatusBadge(user.status)}
                                                                </CTableDataCell>
                                                                <CTableDataCell className="text-end pe-4">
                                                                    <div className={`d-flex justify-content-end gap-2 ${index === 0 ? 'tour-users-actions-first' : ''}`}>
                                                                        <CButton
                                                                            size="sm"
                                                                            shape="rounded-pill"
                                                                            onClick={() => handleShowInfo(user)}
                                                                            title="Ver detalles"
                                                                            className="text-info shadow-sm"
                                                                        >
                                                                            <CIcon icon={cilInfo} />
                                                                        </CButton>

                                                                        {userRole === 'administrator' && (
                                                                            <>
                                                                                <CDropdown variant="btn-group">
                                                                                    <CDropdownToggle
                                                                                        size="sm"
                                                                                        shape="rounded-pill"
                                                                                        className="text-primary shadow-sm"
                                                                                        split={false}
                                                                                    >
                                                                                        <CIcon icon={cilPencil} />
                                                                                    </CDropdownToggle>
                                                                                    <CDropdownMenu>
                                                                                        <CDropdownItem
                                                                                            onClick={() => { setEditing(user); setShowForm(true) }}
                                                                                            style={{ cursor: 'pointer' }}
                                                                                        >
                                                                                            Editar Detalles
                                                                                        </CDropdownItem>
                                                                                        <CDropdownDivider />
                                                                                        <CDropdownHeader style={{ cursor: 'default' }}>Gestión de Roles</CDropdownHeader>
                                                                                        {getRoleOptions(user.role).map(role => (
                                                                                            <CDropdownItem
                                                                                                key={role.value}
                                                                                                onClick={() => handleRoleChange(user.id, role.value)}
                                                                                                style={{ cursor: 'pointer' }}
                                                                                            >
                                                                                                Cambiar a {role.label}
                                                                                            </CDropdownItem>
                                                                                        ))}
                                                                                        <CDropdownDivider />
                                                                                        <CDropdownHeader style={{ cursor: 'default' }}>Gestión de Estados</CDropdownHeader>
                                                                                        {getStatusOptions(user.status).map(status => (
                                                                                            <CDropdownItem
                                                                                                key={status.value}
                                                                                                onClick={() => handleStatusChange(user.id, status.value)}
                                                                                                style={{ cursor: 'pointer' }}
                                                                                            >
                                                                                                Marcar como {status.label}
                                                                                            </CDropdownItem>
                                                                                        ))}
                                                                                    </CDropdownMenu>
                                                                                </CDropdown>
                                                                                <CButton
                                                                                    size="sm"
                                                                                    shape="rounded-pill"
                                                                                    onClick={() => showDeleteConfirmation(user.id, `${user.first_name} ${user.last_name}`)}
                                                                                    disabled={user.role?.toLowerCase() === 'administrator'}
                                                                                    title="Eliminar Usuario"
                                                                                    className="text-danger shadow-sm"
                                                                                >
                                                                                    <CIcon icon={cilTrash} />
                                                                                </CButton>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </CTableDataCell>
                                                            </CTableRow>
                                                        ))}
                                                    </CTableBody>
                                                </CTable>
                                            </div>

                                            {/* PAGINACIÓN */}
                                            {totalPages > 1 && (
                                                <div className="mt-4 d-flex justify-content-end">
                                                    <Pagination
                                                        currentPage={currentPage}
                                                        totalPages={totalPages}
                                                        onPageChange={handlePageChange}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-5 rounded-3 border border-dashed">
                                            <div className="text-muted">
                                                <CIcon icon={cilSearch} size="3xl" className="mb-3 text-secondary opacity-25" />
                                                <h5>{searchTerm ? 'No se encontraron resultados' : 'No hay usuarios disponibles'}</h5>
                                                <p className="text-secondary">
                                                    {searchTerm
                                                        ? 'Intente refinar su consulta de búsqueda.'
                                                        : 'Comience agregando un nuevo usuario al sistema.'
                                                    }
                                                </p>
                                                {searchTerm && (
                                                    <CButton
                                                        color="secondary"
                                                        variant="ghost"
                                                        onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                                                    >
                                                        Limpiar Búsqueda
                                                    </CButton>
                                                )}
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
                title="Eliminar Usuario"
                message={`¿Está seguro de que desea eliminar al usuario "${deleteModal.userName}"? Esta acción no se puede deshacer.`}
                confirmText="Confirmar Eliminación"
                type="danger"
            />
        </CContainer>
    )
}

export default Users