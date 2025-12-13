import React, { useEffect, useState } from 'react'
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
    CInputGroup,
    CInputGroupText,
    CFormInput
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash, cilInfo, cilShieldAlt, cilSearch, cilCheckCircle, cilBan, cilWarning } from '@coreui/icons'
import OfficerForm from './OfficerForm'
import InfoOfficer from './InfoOfficer'
import AvatarLetter from 'src/components/AvatarLetter'
import { listOfficers, createOfficer, updateOfficer, deleteOfficer } from 'src/services/officers'
import ConfirmationModal from 'src/components/ConfirmationModal'
import Pagination from 'src/components/Pagination'

const Officers = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [showInfo, setShowInfo] = useState(false)
    const [editing, setEditing] = useState(null)
    const [selectedOfficer, setSelectedOfficer] = useState(null)

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
            } else {
                await createOfficer(payload)
            }
            setShowForm(false)
            setEditing(null)
            await fetchData()
        } catch (error) {
            console.error('Error saving officer:', error)
            alert('Error saving officer: ' + error.message)
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
        } catch (error) {
            console.error('Error deleting officer:', error)
            alert('Error deleting officer: ' + error.message)
        }
    }

    const confirmDelete = () => {
        if (deleteModal.officerId) {
            handleDelete(deleteModal.officerId)
        }
        setDeleteModal({ visible: false, officerId: null, officerName: '' })
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Active': { color: 'success', text: 'Active', icon: cilCheckCircle },
            'Inactive': { color: 'secondary', text: 'Inactive', icon: cilBan },
            'Training': { color: 'info', text: 'Training', icon: cilInfo },
            'Suspended': { color: 'danger', text: 'Suspended', icon: cilWarning }
        }

        const config = statusConfig[status] || { color: 'secondary', text: status }
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
                                    <h4 className="mb-1 fw-bold" style={{ letterSpacing: '-0.5px' }}>
                                        <CIcon icon={cilShieldAlt} className="me-2 text-primary" style={{ color: '#1a237e' }} />
                                        Officers Management
                                    </h4>
                                    <p className="text-muted mb-0 small">
                                        Manage police force personnel and assignments
                                    </p>
                                </div>
                                <div>
                                    <CButton
                                        color="primary"
                                        style={{ backgroundColor: '#1a237e', borderColor: '#1a237e' }}
                                        onClick={() => {
                                            console.log('New officer button clicked')
                                            setEditing(null);
                                            setShowForm(true)
                                        }}
                                        className="d-flex align-items-center px-4 py-2 shadow-sm"
                                        shape="rounded-pill"
                                    >
                                        <CIcon icon={cilPlus} className="me-2 fw-bold" />
                                        NEW OFFICER
                                    </CButton>
                                </div>
                            </div>
                        </CCardHeader>

                        <CCardBody className="px-4 pb-4">
                            {loading ? (
                                <div className="text-center py-5">
                                    <CSpinner color="primary" variant="grow" />
                                    <div className="mt-3 text-muted">Loading personnel data...</div>
                                </div>
                            ) : (
                                <>
                                    {/* Filters & Search */}
                                    <div className="mb-4 p-3 rounded-3 border d-flex justify-content-between align-items-center gap-3 bg-light-subtle dark:bg-dark-subtle">
                                        <div className="text-muted fw-semibold small">
                                            Total Officers: <span className="fs-6">{filteredOfficers.length}</span>
                                        </div>

                                        <div style={{ maxWidth: '350px', width: '100%' }}>
                                            <CInputGroup>
                                                <CInputGroupText className="border-end-0 text-muted">
                                                    <CIcon icon={cilSearch} />
                                                </CInputGroupText>
                                                <CFormInput
                                                    className="border-start-0 ps-0"
                                                    placeholder="Search"
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value)
                                                        setCurrentPage(1)
                                                    }}
                                                />
                                            </CInputGroup>
                                        </div>
                                    </div>

                                    {currentPageData.length > 0 ? (
                                        <>
                                            <div className="table-responsive border rounded-3">
                                                <CTable hover align="middle" className="mb-0">
                                                    <CTableHead>
                                                        <CTableRow>
                                                            <CTableHeaderCell className="text-uppercase text-secondary small ps-4 py-3" style={{ fontWeight: 600 }}>Personnel</CTableHeaderCell>
                                                            <CTableHeaderCell className="text-uppercase text-secondary small py-3" style={{ fontWeight: 600 }}>Badge ID</CTableHeaderCell>
                                                            <CTableHeaderCell className="text-uppercase text-secondary small py-3" style={{ fontWeight: 600 }}>Unit / Division</CTableHeaderCell>
                                                            <CTableHeaderCell className="text-uppercase text-secondary small py-3" style={{ fontWeight: 600 }}>Status</CTableHeaderCell>
                                                            <CTableHeaderCell className="text-uppercase text-secondary small text-end pe-4 py-3" style={{ fontWeight: 600, width: '150px' }}>Actions</CTableHeaderCell>
                                                        </CTableRow>
                                                    </CTableHead>
                                                    <CTableBody>
                                                        {currentPageData.map(officer => (
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
                                                                    <span className="font-monospace fw-semibold text-secondary">
                                                                        #{officer.id}
                                                                    </span>
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
                                                                    <div className="d-flex justify-content-end gap-2">
                                                                        <CButton
                                                                            size="sm"
                                                                            color="light"
                                                                            className="text-info shadow-sm"
                                                                            onClick={() => handleShowInfo(officer)}
                                                                            title="View Profile"
                                                                            shape="rounded-pill"
                                                                        >
                                                                            <CIcon icon={cilInfo} />
                                                                        </CButton>
                                                                        <CButton
                                                                            size="sm"
                                                                            color="light"
                                                                            className="text-primary shadow-sm"
                                                                            onClick={() => {
                                                                                setEditing(officer);
                                                                                setShowForm(true)
                                                                            }}
                                                                            title="Edit Record"
                                                                            shape="rounded-pill"
                                                                        >
                                                                            <CIcon icon={cilPencil} />
                                                                        </CButton>
                                                                        <CButton
                                                                            size="sm"
                                                                            color="light"
                                                                            className="text-danger shadow-sm"
                                                                            onClick={() => showDeleteConfirmation(officer.id, `${officer.name} ${officer.lastName}`)}
                                                                            title="Deactivate/Delete"
                                                                            shape="rounded-pill"
                                                                        >
                                                                            <CIcon icon={cilTrash} />
                                                                        </CButton>
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
                                                <h5>{searchTerm ? 'No matches found' : 'No officers listed'}</h5>
                                                <p className="text-secondary">
                                                    {searchTerm
                                                        ? 'Try adjusting your search terms.'
                                                        : 'Start by creating a new officer profile.'
                                                    }
                                                </p>
                                                {searchTerm && (
                                                    <CButton
                                                        color="secondary"
                                                        variant="ghost"
                                                        onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                                                    >
                                                        Clear Search
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
                title="Delete Officer"
                message={`Are you sure you want to delete the officer "${deleteModal.officerName}"? This action cannot be undone.`}
                confirmText="Confirm Delete"
                type="danger"
            />
        </CContainer>
    )
}

export default Officers