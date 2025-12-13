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
    CSpinner
} from '@coreui/react'
import SearchInput from 'src/components/SearchInput'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash, cilInfo, cilFolderOpen, cilMap, cilUser, cilSearch, cilWarning, cilCheckCircle, cilBan, cilFile } from '@coreui/icons'
import ComplaintForm from './ComplaintForm'
import InfoComplaint from './InfoComplaint'
import { listComplaints, createComplaint, updateComplaint, deleteComplaint } from 'src/services/complaints'
import ConfirmationModal from 'src/components/ConfirmationModal'
import Pagination from 'src/components/Pagination'

const Complaints = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [showInfo, setShowInfo] = useState(false)
    const [editing, setEditing] = useState(null)
    const [selectedComplaint, setSelectedComplaint] = useState(null)
    const dispatch = useDispatch()

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(6)
    const [searchTerm, setSearchTerm] = useState('')

    const [deleteModal, setDeleteModal] = useState({
        visible: false,
        complaintId: null,
        complaintTitle: ''
    })

    useEffect(() => {
        console.log('Complaints component mounted')
        fetchData()
    }, [])

    async function fetchData() {
        console.log('Fetching complaints...')
        setLoading(true)
        try {
            const res = await listComplaints()
            console.log('Complaints loaded:', res)
            setData(res || [])
        } catch (error) {
            console.error('Error fetching complaints:', error)
            setData([])
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (term) => {
        setSearchTerm(term)
        setCurrentPage(1)
    }

    const filteredComplaints = data.filter(complaint => {
        if (!searchTerm) return true

        const searchLower = searchTerm.toLowerCase()
        return (
            complaint.id?.toString().includes(searchTerm) ||
            complaint.location?.toLowerCase().includes(searchLower) ||
            complaint.assignedOfficerName?.toLowerCase().includes(searchLower) ||
            complaint.title?.toLowerCase().includes(searchLower)
        )
    })

    const getCurrentPageData = () => {
        if (!Array.isArray(filteredComplaints) || filteredComplaints.length === 0) return []

        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage

        return filteredComplaints.slice(startIndex, endIndex)
    }

    const currentPageData = getCurrentPageData()
    const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage)

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    async function handleSave(payload) {
        console.log('Saving complaint:', payload)
        try {
            if (editing && editing.id) {
                await updateComplaint(editing.id, payload)
                dispatch({
                    type: 'set',
                    appAlert: {
                        visible: true,
                        color: 'success',
                        message: 'Complaint updated successfully',
                    },
                })
            } else {
                await createComplaint(payload)
                dispatch({
                    type: 'set',
                    appAlert: {
                        visible: true,
                        color: 'success',
                        message: 'Complaint created successfully',
                    },
                })
            }
            setShowForm(false)
            setEditing(null)
            await fetchData()
        } catch (error) {
            console.error('Error saving complaint:', error)
            dispatch({
                type: 'set',
                appAlert: {
                    visible: true,
                    color: 'danger',
                    message: 'Error saving complaint: ' + error.message,
                },
            })
        }
    }

    const showDeleteConfirmation = (id, title) => {
        setDeleteModal({
            visible: true,
            complaintId: id,
            complaintTitle: title
        })
    }

    async function handleDelete(id) {
        try {
            await deleteComplaint(id)
            await fetchData()
            console.log('Complaint deleted successfully')
            dispatch({
                type: 'set',
                appAlert: {
                    visible: true,
                    color: 'warning',
                    message: 'Complaint deleted successfully',
                },
            })
        } catch (error) {
            console.error('Error deleting complaint:', error)
            dispatch({
                type: 'set',
                appAlert: {
                    visible: true,
                    color: 'danger',
                    message: 'Error deleting complaint: ' + error.message,
                },
            })
        }
    }

    const confirmDelete = () => {
        if (deleteModal.complaintId) {
            handleDelete(deleteModal.complaintId)
        }
        setDeleteModal({ visible: false, complaintId: null, complaintTitle: '' })
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Received': { color: 'info', text: 'Received', icon: cilFile },
            'Under Investigation': { color: 'warning', text: 'Investigation', icon: cilSearch },
            'Resolved': { color: 'success', text: 'Resolved', icon: cilCheckCircle },
            'Closed': { color: 'secondary', text: 'Closed', icon: cilBan },
            'Rejected': { color: 'danger', text: 'Rejected', icon: cilBan }
        }

        const config = statusConfig[status] || { color: 'secondary', text: status }
        return (
            <CBadge
                color={config.color}
                className="d-flex align-items-center gap-1 px-2"
                shape="rounded-pill"
            >
                {config.icon && <CIcon icon={config.icon} size="sm" />}
                {config.text}
            </CBadge>
        )
    }

    const getPriorityBadge = (priority) => {
        const priorityConfig = {
            'Low': { color: 'success', text: 'Low' },
            'Medium': { color: 'warning', text: 'Medium' },
            'High': { color: 'danger', text: 'High' },
            'Urgent': { color: 'danger', text: 'URGENT', icon: cilWarning }
        }

        const config = priorityConfig[priority] || { color: 'secondary', text: priority }
        return (
            <CBadge
                color={config.color}
                shape="rounded-pill"
                className="px-2"
            >
                {config.icon && <CIcon icon={config.icon} size="sm" className="me-1" />}
                {config.text}
            </CBadge>
        )
    }

    const handleShowInfo = (complaint) => {
        setSelectedComplaint(complaint)
        setShowInfo(true)
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
                                    <h4 className="mb-1 fw-bold" style={{ letterSpacing: '-0.5px' }}>
                                        <CIcon icon={cilFolderOpen} className="me-2 text-primary" style={{ color: '#1a237e' }} />
                                        Complaints Management
                                    </h4>
                                    <p className="text-muted mb-0 small">
                                        Track investigations, incidents, and case resolution
                                    </p>
                                </div>
                                <div>
                                    <CButton
                                        color="primary"
                                        style={{ backgroundColor: '#1a237e', borderColor: '#1a237e' }}
                                        onClick={() => {
                                            setEditing(null);
                                            setShowForm(true)
                                        }}
                                        className="d-flex align-items-center px-4 py-2 shadow-sm"
                                        shape="rounded-pill"
                                    >
                                        <CIcon icon={cilPlus} className="me-2 fw-bold" />
                                        NEW COMPLAINT
                                    </CButton>
                                </div>
                            </div>
                        </CCardHeader>

                        <CCardBody className="px-4 pb-4">
                            {loading ? (
                                <div className="text-center py-5">
                                    <CSpinner color="primary" variant="grow" />
                                    <div className="mt-3 text-muted">Loading cases...</div>
                                </div>
                            ) : (
                                <>
                                    {/* Filters & Search */}
                                    <div className="mb-4 p-3 rounded-3 border d-flex justify-content-between align-items-center gap-3 bg-light-subtle dark:bg-dark-subtle">
                                        <div className="text-muted fw-semibold small">
                                            Total Cases: <span className="fs-6">{filteredComplaints.length}</span>
                                        </div>

                                        <div style={{ maxWidth: '400px', width: '100%' }}>
                                            <SearchInput
                                                value={searchTerm}
                                                onChange={(e) => handleSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {currentPageData.length > 0 ? (
                                        <>
                                            <div className="table-responsive border rounded-3">
                                                <CTable hover align="middle" className="mb-0">
                                                    <CTableHead>
                                                        <CTableRow>
                                                            <CTableHeaderCell className="text-uppercase text-secondary small ps-4 py-3" style={{ fontWeight: 600 }}>Case ID</CTableHeaderCell>
                                                            <CTableHeaderCell className="text-uppercase text-secondary small py-3" style={{ fontWeight: 600 }}>Incident</CTableHeaderCell>
                                                            <CTableHeaderCell className="text-uppercase text-secondary small py-3" style={{ fontWeight: 600 }}>Complainant</CTableHeaderCell>
                                                            <CTableHeaderCell className="text-uppercase text-secondary small py-3" style={{ fontWeight: 600 }}>Assigned To</CTableHeaderCell>
                                                            <CTableHeaderCell className="text-uppercase text-secondary small py-3" style={{ fontWeight: 600 }}>Priority</CTableHeaderCell>
                                                            <CTableHeaderCell className="text-uppercase text-secondary small py-3" style={{ fontWeight: 600 }}>Status</CTableHeaderCell>
                                                            <CTableHeaderCell className="text-uppercase text-secondary small text-end pe-4 py-3" style={{ fontWeight: 600, width: '150px' }}>Actions</CTableHeaderCell>
                                                        </CTableRow>
                                                    </CTableHead>
                                                    <CTableBody>
                                                        {currentPageData.map(complaint => (
                                                            <CTableRow key={complaint.id}>
                                                                <CTableDataCell className="ps-4">
                                                                    <span className="font-monospace fw-bold text-primary">#{complaint.id}</span>
                                                                </CTableDataCell>
                                                                <CTableDataCell>
                                                                    <div style={{ maxWidth: '200px' }} className="text-truncate" title={complaint.title}>
                                                                        <strong>{complaint.title}</strong>
                                                                    </div>
                                                                    <div className="small text-muted d-flex align-items-center mt-1">
                                                                        <CIcon icon={cilMap} size="xs" className="me-1" />
                                                                        <span className="text-truncate" style={{ maxWidth: '180px' }}>{complaint.location}</span>
                                                                    </div>
                                                                </CTableDataCell>
                                                                <CTableDataCell>
                                                                    <div className="small">
                                                                        <div className="fw-semibold">{complaint.complainantName}</div>
                                                                        <div className="text-muted">{complaint.complainantPhone}</div>
                                                                    </div>
                                                                </CTableDataCell>
                                                                <CTableDataCell>
                                                                    {complaint.assignedOfficerName ? (
                                                                        <div className="d-flex align-items-center">
                                                                            <CIcon icon={cilUser} size="sm" className="me-2 text-secondary" />
                                                                            {complaint.assignedOfficerName}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="badge bg-opacity-10 bg-secondary text-secondary border">Unassigned</span>
                                                                    )}
                                                                </CTableDataCell>
                                                                <CTableDataCell>
                                                                    {getPriorityBadge(complaint.priority)}
                                                                </CTableDataCell>
                                                                <CTableDataCell>
                                                                    {getStatusBadge(complaint.status)}
                                                                </CTableDataCell>
                                                                <CTableDataCell className="text-end pe-4">
                                                                    <div className="d-flex justify-content-end gap-2">
                                                                        <CButton
                                                                            size="sm"
                                                                            color="light"
                                                                            className="text-info shadow-sm"
                                                                            onClick={() => handleShowInfo(complaint)}
                                                                            title="View Details"
                                                                            shape="rounded-pill"
                                                                        >
                                                                            <CIcon icon={cilInfo} />
                                                                        </CButton>
                                                                        <CButton
                                                                            size="sm"
                                                                            color="light"
                                                                            className="text-primary shadow-sm"
                                                                            onClick={() => {
                                                                                setEditing(complaint);
                                                                                setShowForm(true)
                                                                            }}
                                                                            title="Edit Case"
                                                                            shape="rounded-pill"
                                                                        >
                                                                            <CIcon icon={cilPencil} />
                                                                        </CButton>
                                                                        <CButton
                                                                            size="sm"
                                                                            color="light"
                                                                            className="text-danger shadow-sm"
                                                                            onClick={() => showDeleteConfirmation(complaint.id, complaint.title)}
                                                                            title="Delete Case"
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
                                                <CIcon icon={cilFolderOpen} size="3xl" className="mb-3 text-secondary opacity-25" />
                                                <h5>{searchTerm ? 'No cases found' : 'No complaints filed'}</h5>
                                                <p className="text-secondary">
                                                    {searchTerm
                                                        ? 'Try different search keywords.'
                                                        : 'Create a new complaint to start tracking.'
                                                    }
                                                </p>
                                                {searchTerm && (
                                                    <CButton
                                                        color="secondary"
                                                        variant="ghost"
                                                        onClick={() => handleSearch('')}
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

            <ComplaintForm
                visible={showForm}
                onClose={() => {
                    setShowForm(false)
                    setEditing(null)
                }}
                onSave={handleSave}
                initial={editing}
            />

            <InfoComplaint
                visible={showInfo}
                onClose={() => {
                    setShowInfo(false)
                    setSelectedComplaint(null)
                }}
                complaint={selectedComplaint}
            />

            <ConfirmationModal
                visible={deleteModal.visible}
                onClose={() => setDeleteModal({ visible: false, complaintId: null, complaintTitle: '' })}
                onConfirm={confirmDelete}
                title="Delete Complaint"
                message={`Are you sure you want to delete the complaint "${deleteModal.complaintTitle}"? This action cannot be undone.`}
                confirmText="Confirm Delete"
                type="danger"
            />
        </CContainer>
    )
}

export default Complaints