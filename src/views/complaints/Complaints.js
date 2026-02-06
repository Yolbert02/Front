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
    CDropdownItem
} from '@coreui/react'
import SearchInput from 'src/components/SearchInput'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash, cilInfo, cilFolderOpen, cilMap, cilUser, cilSearch, cilWarning, cilCheckCircle, cilBan, cilFile } from '@coreui/icons'
import ComplaintForm from './ComplaintForm'
import InfoComplaint from './InfoComplaint'
import { listComplaints, createComplaint, updateComplaint, deleteComplaint, changeComplaintStatus } from 'src/services/complaints'
import { downloadComplaintPDF } from 'src/services/reports'
import ConfirmationModal from 'src/components/ConfirmationModal'
import Pagination from 'src/components/Pagination'
import { colorbutton } from 'src/styles/darkModeStyles'

const Complaints = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [showInfo, setShowInfo] = useState(false)
    const [editing, setEditing] = useState(null)
    const [selectedComplaint, setSelectedComplaint] = useState(null)
    const dispatch = useDispatch()

    const userStr = sessionStorage.getItem('user')
    const userRole = userStr ? JSON.parse(userStr).role : 'civil'

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

    const getStatusOptions = (currentStatus) => {
        const s = currentStatus?.toLowerCase()
        const statuses = [
            { value: 'received', label: 'Received' },
            { value: 'under_investigation', label: 'Investigation' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'closed', label: 'Closed' },
            { value: 'rejected', label: 'Rejected' }
        ]
        return statuses.filter(status => status.value !== s)
    }

    async function handleStatusChange(complaintId, newStatus) {
        try {
            const lowerStatus = newStatus.toLowerCase()
            await changeComplaintStatus(complaintId, lowerStatus)
            await fetchData()
            dispatch({
                type: 'set',
                appAlert: {
                    visible: true,
                    color: 'success',
                    message: `Status updated to ${newStatus}`,
                },
            })
        } catch (error) {
            console.error('Error changing complaint status:', error)
            dispatch({
                type: 'set',
                appAlert: {
                    visible: true,
                    color: 'danger',
                    message: 'Error changing status: ' + error.message,
                },
            })
        }
    }

    const getStatusBadge = (status) => {
        const s = status?.toLowerCase()
        const statusConfig = {
            'received': { color: 'info', text: 'Received', icon: cilFile },
            'under_investigation': { color: 'warning', text: 'Investigation', icon: cilSearch },
            'resolved': { color: 'success', text: 'Resolved', icon: cilCheckCircle },
            'closed': { color: 'secondary', text: 'Closed', icon: cilBan },
            'rejected': { color: 'danger', text: 'Rejected', icon: cilBan }
        }

        const config = statusConfig[s] || { color: 'secondary', text: status }
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
        const p = priority?.toLowerCase()
        const priorityConfig = {
            'low': { color: 'success', text: 'Low' },
            'medium': { color: 'warning', text: 'Medium' },
            'high': { color: 'danger', text: 'High' },
            'urgent': { color: 'danger', text: 'URGENT', icon: cilWarning }
        }

        const config = priorityConfig[p] || { color: 'secondary', text: priority }
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
                                        color="primary colorbutton"
                                        style={colorbutton}
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
                                                            <CTableHeaderCell className="text-uppercase text-secondary small ps-4 py-3" style={{ fontWeight: 600 }}>Type</CTableHeaderCell>
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
                                                                    <CIcon icon={cilFile} className="text-primary" />
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
                                                                        <div className="fw-semibold">{complaint.complainant_name}</div>
                                                                        <div className="text-muted">{complaint.complainant_phone}</div>
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
                                                                            className="text-info shadow-sm"
                                                                            onClick={() => handleShowInfo(complaint)}
                                                                            title="View Details"
                                                                            shape="rounded-pill"
                                                                        >
                                                                            <CIcon icon={cilInfo} />
                                                                        </CButton>
                                                                        {(userRole === 'administrator' || userRole === 'oficial') && (
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
                                                                                            onClick={() => { setEditing(complaint); setShowForm(true) }}
                                                                                            style={{ cursor: 'pointer' }}
                                                                                        >
                                                                                            Edit Details
                                                                                        </CDropdownItem>
                                                                                        <CDropdownItem divider />
                                                                                        <CDropdownItem header style={{ cursor: 'default' }}>Status Management</CDropdownItem>
                                                                                        {getStatusOptions(complaint.status).map(status => (
                                                                                            <CDropdownItem
                                                                                                key={status.value}
                                                                                                onClick={() => handleStatusChange(complaint.id, status.value)}
                                                                                                className={status.value === 'Rejected' ? 'text-danger' : ''}
                                                                                                style={{ cursor: 'pointer' }}
                                                                                            >
                                                                                                Mark as {status.label}
                                                                                            </CDropdownItem>
                                                                                        ))}
                                                                                    </CDropdownMenu>
                                                                                </CDropdown>
                                                                                {userRole === 'administrator' && (
                                                                                    <CButton
                                                                                        size="sm"
                                                                                        className="text-danger shadow-sm"
                                                                                        onClick={() => showDeleteConfirmation(complaint.id, complaint.title)}
                                                                                        title="Delete Case"
                                                                                        shape="rounded-pill"
                                                                                    >
                                                                                        <CIcon icon={cilTrash} />
                                                                                    </CButton>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </CTableDataCell>
                                                            </CTableRow>
                                                        ))}
                                                    </CTableBody>
                                                </CTable>
                                            </div>

                                            {/* PAGINATION */}
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