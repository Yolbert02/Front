import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
    CButton,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CCard,
    CCardBody,
    CCardHeader,
    CBadge,
    CContainer,
    CRow,
    CCol,
    CSpinner,
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem,
    CDropdownDivider,
    CDropdownHeader
} from '@coreui/react'
import SearchInput from 'src/components/SearchInput'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash, cilInfo, cilShieldAlt, cilSearch, cilCheckCircle, cilBan, cilWarning } from '@coreui/icons'
import OfficerForm from './OfficerForm'
import InfoOfficer from './InfoOfficer'
import AvatarLetter from 'src/components/AvatarLetter'
import { listOfficers, createOfficer, updateOfficer, deleteOfficer, changeOfficerStatus } from 'src/services/officers'
import { colorbutton } from 'src/styles/darkModeStyles'
import ConfirmationModal from 'src/components/ConfirmationModal'
import Pagination from 'src/components/Pagination'

const Officers = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [showInfo, setShowInfo] = useState(false)
    const [editing, setEditing] = useState(null)
    const [selectedOfficer, setSelectedOfficer] = useState(null)
    const dispatch = useDispatch()
    const userStr = sessionStorage.getItem('user')
    const userRole = userStr ? JSON.parse(userStr).role : 'civil'

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(6)
    const [searchTerm, setSearchTerm] = useState('')

    const [deleteModal, setDeleteModal] = useState({
        visible: false,
        officerId: null,
        officerName: ''
    })

    useEffect(() => {
        console.log('Officers component mounted')
        fetchData()
    }, [])

    async function fetchData() {
        console.log('Fetching officers...')
        setLoading(true)
        try {
            const res = await listOfficers()
            console.log('Officers loaded:', res)
            setData(res || [])
        } catch (error) {
            console.error('Error fetching officers:', error)
            setData([])
        } finally {
            setLoading(false)
        }
    }

    const filteredOfficers = data.filter(officer => {
        if (!searchTerm) return true

        const searchLower = searchTerm.toLowerCase()
        return (
            officer.name?.toLowerCase().includes(searchLower) ||
            officer.lastName?.toLowerCase().includes(searchLower) ||
            officer.idNumber?.toLowerCase().includes(searchLower) ||
            officer.unit?.toLowerCase().includes(searchLower)
        )
    })

    const getCurrentPageData = () => {
        if (!Array.isArray(filteredOfficers) || filteredOfficers.length === 0) return []

        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage

        return filteredOfficers.slice(startIndex, endIndex)
    }

    const currentPageData = getCurrentPageData()
    const totalPages = Math.ceil(filteredOfficers.length / itemsPerPage)

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    async function handleSave(payload) {
        console.log('Saving officer:', payload)
        try {
            if (editing && editing.id) {
                await updateOfficer(editing.id, payload)
                dispatch({
                    type: 'set',
                    appAlert: {
                        visible: true,
                        color: 'success',
                        message: 'Oficial actualizado correctamente',
                    },
                })
            } else {
                await createOfficer(payload)
                dispatch({
                    type: 'set',
                    appAlert: {
                        visible: true,
                        color: 'success',
                        message: 'Oficial creado correctamente',
                    },
                })
            }
            setShowForm(false)
            setEditing(null)
            await fetchData()
        } catch (error) {
            console.error('Error saving officer:', error)
            dispatch({
                type: 'set',
                appAlert: {
                    visible: true,
                    color: 'danger',
                    message: 'Error al guardar el oficial: ' + error.message,
                },
            })
        }
    }

    const showDeleteConfirmation = (id, name) => {
        setDeleteModal({
            visible: true,
            officerId: id,
            officerName: name
        })
    }

    async function handleDelete(id) {
        try {
            await deleteOfficer(id)
            await fetchData()
            console.log('Officer deleted successfully')
            dispatch({
                type: 'set',
                appAlert: {
                    visible: true,
                    color: 'warning',
                    message: 'Oficial eliminado correctamente',
                },
            })
        } catch (error) {
            console.error('Error deleting officer:', error)
            dispatch({
                type: 'set',
                appAlert: {
                    visible: true,
                    color: 'danger',
                    message: 'Error al eliminar el oficial: ' + error.message,
                },
            })
        }
    }

    const confirmDelete = () => {
        if (deleteModal.officerId) {
            handleDelete(deleteModal.officerId)
        }
        setDeleteModal({ visible: false, officerId: null, officerName: '' })
    }

    const getStatusOptions = (currentStatus) => {
        const s = currentStatus?.toLowerCase()
        const statuses = [
            { value: 'active', label: 'Activo' },
            { value: 'inactive', label: 'Inactivo' },
            { value: 'training', label: 'En Formación' },
            { value: 'suspended', label: 'Suspendido' }
        ]
        return statuses.filter(status => status.value !== s)
    }

    async function handleStatusChange(officerId, newStatus) {
        try {
            await changeOfficerStatus(officerId, newStatus.toLowerCase())
            await fetchData()
        } catch (error) {
            console.error('Error changing officer status:', error)
            alert('Error changing status: ' + error.message)
        }
    }

    const getStatusBadge = (status) => {
        const s = status?.toLowerCase()
        const statusConfig = {
            'active': { color: 'success', text: 'Activo', icon: cilCheckCircle },
            'inactive': { color: 'secondary', text: 'Inactivo', icon: cilBan },
            'training': { color: 'info', text: 'En Formación', icon: cilInfo },
            'suspended': { color: 'danger', text: 'Suspendido', icon: cilWarning }
        }

        const config = statusConfig[s] || { color: 'secondary', text: status }
        return (
            <CBadge
                color={config.color}
                shape="rounded-pill"
                className="px-2 d-inline-flex align-items-center gap-1"
            >
                {config.icon && <CIcon icon={config.icon} size="sm" />}
                {config.text}
            </CBadge>
        )
    }

    const handleShowInfo = (officer) => {
        setSelectedOfficer(officer)
        setShowInfo(true)
    }

    return (
        <CContainer fluid>
            <CRow>
                <CCol>
                    <CCard className="shadow-sm border-0 mb-4" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                        {/* Premium Gradient Header */}
                        <div style={{ height: '5px', background: 'linear-gradient(90deg, #1a237e 0%, #0d47a1 100%)' }}></div>


                        <CCardHeader className="border-bottom-0 pt-4 pb-3 px-4">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                                <div>
                                    <h4 className="mb-1 fw-bold tour-officers-title" style={{ letterSpacing: '-0.5px' }}>
                                        <CIcon icon={cilShieldAlt} className="me-2 text-primary" style={{ color: '#1a237e' }} />
                                        Gestión de Oficiales
                                    </h4>
                                    <p className="text-muted mb-0 small">
                                        Gestionar el personal de la fuerza policial y sus asignaciones
                                    </p>
                                </div>
                                {userRole === 'administrator' && (
                                    <div>
                                        <CButton
                                            color="primary colorbutton"
                                            style={colorbutton}
                                            onClick={() => {
                                                console.log('New officer button clicked')
                                                setEditing(null);
                                                setShowForm(true)
                                            }}
                                            className="d-flex align-items-center px-4 py-2 shadow-sm tour-officers-new-btn"
                                            shape="rounded-pill"
                                        >
                                            <CIcon icon={cilPlus} className="me-2 fw-bold" />
                                            NUEVO OFICIAL
                                        </CButton>
                                    </div>
                                )}
                            </div>
                        </CCardHeader>

                        <CCardBody className="px-4 pb-4">
                            {loading ? (
                                <div className="text-center py-5">
                                    <CSpinner color="primary" variant="grow" />
                                    <div className="mt-3 text-muted">Cargando datos del personal...</div>
                                </div>
                            ) : (
                                <>
                                    {/* Filters & Search */}
                                    <div className="mb-4 p-3 rounded-3 border d-flex justify-content-between align-items-center gap-3 bg-light-subtle dark:bg-dark-subtle">
                                        <div className="text-muted fw-semibold small">
                                            Total de Oficiales: <span className="fs-6">{filteredOfficers.length}</span>
                                        </div>

                                        <div style={{ maxWidth: '350px', width: '100%' }} className="tour-officers-search">
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
                                            <div className="table-responsive border rounded-3">
                                                <CTable hover align="middle" className="mb-0">
                                                    <CTableHead>
                                                        <CTableRow>
                                                            <CTableHeaderCell className="text-uppercase text-secondary small ps-4 py-3" style={{ fontWeight: 600 }}>Personal</CTableHeaderCell>
                                                            <CTableHeaderCell className="text-uppercase text-secondary small py-3" style={{ fontWeight: 600 }}>Información de Contacto</CTableHeaderCell>
                                                            <CTableHeaderCell className="text-uppercase text-secondary small py-3" style={{ fontWeight: 600 }}>Unidad / División</CTableHeaderCell>
                                                            <CTableHeaderCell className="text-uppercase text-secondary small py-3" style={{ fontWeight: 600 }}>Estado</CTableHeaderCell>
                                                            <CTableHeaderCell className="text-uppercase text-secondary small text-end pe-4 py-3" style={{ fontWeight: 600, width: '150px' }}>Acciones</CTableHeaderCell>
                                                        </CTableRow>
                                                    </CTableHead>
                                                    <CTableBody>
                                                        {currentPageData.map((officer, index) => (
                                                            <CTableRow key={officer.id}>
                                                                <CTableDataCell className="ps-4">
                                                                    <div className="d-flex align-items-center py-2">
                                                                        <AvatarLetter
                                                                            name={officer.name}
                                                                            lastName={officer.lastName}
                                                                            size={44}
                                                                            className="shadow-sm border border-2 border-white"
                                                                        />
                                                                        <div className="ms-3">
                                                                            <div className="fw-bold">{officer.name} {officer.lastName}</div>
                                                                            <div className="small text-muted font-monospace">{officer.idNumber || 'NO-ID'}</div>
                                                                        </div>
                                                                    </div>
                                                                </CTableDataCell>
                                                                <CTableDataCell>
                                                                    <div className="small text-muted">
                                                                        {officer.email || officer.phone || 'N/A'}
                                                                    </div>
                                                                </CTableDataCell>
                                                                <CTableDataCell>
                                                                    <div className="d-flex align-items-center">
                                                                        <div className="p-1 rounded-circle bg-opacity-10 bg-secondary me-2">
                                                                            <CIcon icon={cilShieldAlt} size="sm" className="text-primary" />
                                                                        </div>
                                                                        {officer.unit}
                                                                    </div>
                                                                </CTableDataCell>
                                                                <CTableDataCell>
                                                                    {getStatusBadge(officer.status)}
                                                                </CTableDataCell>
                                                                <CTableDataCell className="text-end pe-4">
                                                                    <div className={`d-flex justify-content-end gap-2 ${index === 0 ? 'tour-officers-actions-first' : ''}`}>
                                                                        <CButton
                                                                            size="sm"
                                                                            className="text-info shadow-sm"
                                                                            onClick={() => handleShowInfo(officer)}
                                                                            title="Ver Perfil"
                                                                            shape="rounded-pill"
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
                                                                                            onClick={() => { setEditing(officer); setShowForm(true) }}
                                                                                            style={{ cursor: 'pointer' }}
                                                                                        >
                                                                                            Editar Detalles
                                                                                        </CDropdownItem>
                                                                                        <CDropdownDivider />
                                                                                        <CDropdownHeader style={{ cursor: 'default' }}>Gestión de Estado</CDropdownHeader>
                                                                                        {getStatusOptions(officer.status).map(status => (
                                                                                            <CDropdownItem
                                                                                                key={status.value}
                                                                                                onClick={() => handleStatusChange(officer.id, status.value)}
                                                                                                className={status.value === 'suspended' ? 'text-danger' : ''}
                                                                                                style={{ cursor: 'pointer' }}
                                                                                            >
                                                                                                Marcar como {status.label}
                                                                                            </CDropdownItem>
                                                                                        ))}
                                                                                    </CDropdownMenu>
                                                                                </CDropdown>
                                                                                <CButton
                                                                                    size="sm"
                                                                                    className="text-danger shadow-sm"
                                                                                    onClick={() => showDeleteConfirmation(officer.id, `${officer.name} ${officer.lastName}`)}
                                                                                    title="Desactivar/Eliminar"
                                                                                    shape="rounded-pill"
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
                                                <h5>{searchTerm ? 'No se encontraron coincidencias' : 'No hay oficiales listados'}</h5>
                                                <p className="text-secondary">
                                                    {searchTerm
                                                        ? 'Intente ajustar sus términos de búsqueda.'
                                                        : 'Comience creando un nuevo perfil de oficial.'
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

            <OfficerForm
                visible={showForm}
                onClose={() => {
                    console.log('Closing form')
                    setShowForm(false)
                    setEditing(null)
                }}
                onSave={handleSave}
                initial={editing}
            />

            <InfoOfficer
                visible={showInfo}
                onClose={() => {
                    setShowInfo(false)
                    setSelectedOfficer(null)
                }}
                officer={selectedOfficer}
            />

            <ConfirmationModal
                visible={deleteModal.visible}
                onClose={() => setDeleteModal({ visible: false, officerId: null, officerName: '' })}
                onConfirm={confirmDelete}
                title="Eliminar Oficial"
                message={`¿Está seguro de que desea eliminar al oficial "${deleteModal.officerName}"? Esta acción no se puede deshacer.`}
                confirmText="Confirmar Eliminación"
                type="danger"
            />
        </CContainer>
    )
}

export default Officers