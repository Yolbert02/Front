import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
    CCard, CCardBody, CCardHeader, CContainer, CRow, CCol,
    CButton, CBadge, CSpinner,
    CCardTitle, CCardText,
    CCardFooter, CTooltip,
    CTable, CTableHead, CTableRow, CTableHeaderCell,
    CTableBody, CTableDataCell,
    CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem
} from '@coreui/react'
import SearchInput from 'src/components/SearchInput'
import CIcon from '@coreui/icons-react'
import {
    cilPlus, cilPencil, cilTrash, cilCalendar, cilUser,
    cilBalanceScale, cilInfo, cilSearch, cilCheckCircle, cilBan,
    cilClock, cilWarning, cilPeople, cilListRich, cilApps, cilCloudDownload
} from '@coreui/icons'
import AssignmentForm from './AssignmentForm'
import InfoAssignment from './InfoAssignment'
import {
    listAssignments, deleteAssignment,
    updateAssignment, createAssignment, changeAssignmentStatus
} from 'src/services/assignments'
import { downloadAssignmentPDF } from 'src/services/reports'

import { colorbutton } from 'src/styles/darkModeStyles'
import ConfirmationModal from 'src/components/ConfirmationModal'
import Pagination from 'src/components/Pagination'

const Assignments = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [showInfo, setShowInfo] = useState(false)
    const [editing, setEditing] = useState(null)
    const [selectedAssignment, setSelectedAssignment] = useState(null)
    const dispatch = useDispatch()

    const userStr = sessionStorage.getItem('user')
    const user = userStr ? JSON.parse(userStr) : null
    const userId = user?.id
    const userRole = user?.role || 'civil'

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(6)
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState('cards')

    const [deleteModal, setDeleteModal] = useState({
        visible: false,
        assignmentId: null,
        assignmentTitle: ''
    })

    const statusConfig = {
        'scheduled': { color: 'primary', text: 'Scheduled', icon: cilCalendar },
        'in_progress': { color: 'warning', text: 'In Progress', icon: cilClock },
        'completed': { color: 'success', text: 'Completed', icon: cilCheckCircle },
        'cancelled': { color: 'danger', text: 'Cancelled', icon: cilBan },
        'postponed': { color: 'info', text: 'Postponed', icon: cilClock }
    }

    const priorityConfig = {
        'high': { color: 'danger', text: 'High' },
        'medium': { color: 'warning', text: 'Medium' },
        'low': { color: 'success', text: 'Low' }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await listAssignments()
            setData(res || [])
        } catch (error) {
            console.error('Error fetching assignments:', error)
            setData([])
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (term) => {
        setSearchTerm(term)
        setCurrentPage(1)
    }

    const filteredAssignments = data.filter(assignment => {
        // First filter by Role/ID permissions
        if (userRole !== 'administrator') {
            const isParticipant =
                assignment.officials?.some(o => o.id === userId) ||
                assignment.funcionaries?.some(f => f.id === userId) ||
                assignment.witnesses?.some(w => w.id === userId) ||
                assignment.jury?.some(j => j.id === userId) ||
                assignment.judge_id === userId ||
                assignment.created_by === userId;

            if (!isParticipant) return false;
        }

        // Then filter by search term
        if (!searchTerm) return true
        const searchLower = searchTerm.toLowerCase()
        return (
            assignment.case_number?.toLowerCase().includes(searchLower) ||
            assignment.judge_name?.toLowerCase().includes(searchLower) ||
            assignment.case_title?.toLowerCase().includes(searchLower)
        )
    })

    const getCurrentPageData = () => {
        if (!Array.isArray(filteredAssignments) || filteredAssignments.length === 0) return []

        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage

        return filteredAssignments.slice(startIndex, endIndex)
    }

    const currentPageData = getCurrentPageData()
    const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage)

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const handleSave = async (payload) => {
        try {
            if (editing?.id) {
                await updateAssignment(editing.id, payload)
                dispatch({
                    type: 'set',
                    appAlert: {
                        visible: true,
                        color: 'success',
                        message: 'Assignment updated successfully',
                    },
                })
            } else {
                await createAssignment(payload)
                dispatch({
                    type: 'set',
                    appAlert: {
                        visible: true,
                        color: 'success',
                        message: 'Assignment created successfully',
                    },
                })
            }
            setShowForm(false)
            setEditing(null)
            await fetchData()
        } catch (error) {
            console.error('Error saving assignment:', error)
            dispatch({
                type: 'set',
                appAlert: {
                    visible: true,
                    color: 'danger',
                    message: 'Error saving assignment: ' + error.message,
                },
            })
        }
    }

    const showDeleteConfirmation = (id, title) => {
        setDeleteModal({
            visible: true,
            assignmentId: id,
            assignmentTitle: title
        })
    }

    const handleDelete = async (id) => {
        try {
            await deleteAssignment(id)
            await fetchData()
            console.log('Assignment deleted successfully')
            dispatch({
                type: 'set',
                appAlert: {
                    visible: true,
                    color: 'warning',
                    message: 'Assignment deleted successfully',
                },
            })
        } catch (error) {
            console.error('Error deleting assignment:', error)
            dispatch({
                type: 'set',
                appAlert: {
                    visible: true,
                    color: 'danger',
                    message: 'Error deleting assignment: ' + error.message,
                },
            })
        }
    }

    const confirmDelete = () => {
        if (deleteModal.assignmentId) {
            handleDelete(deleteModal.assignmentId)
        }
        setDeleteModal({ visible: false, assignmentId: null, assignmentTitle: '' })
    }

    const handleEdit = (assignment) => {
        setEditing(assignment)
        setShowForm(true)
    }

    const handleNewAssignment = () => {
        setEditing(null)
        setShowForm(true)
    }

    const handleCloseForm = () => {
        setShowForm(false)
        setEditing(null)
    }

    const handleShowInfo = (assignment) => {
        setSelectedAssignment(assignment)
        setShowInfo(true)
    }

    const getStatusOptions = (currentStatus) => {
        const s = currentStatus?.toLowerCase()
        const statuses = [
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'postponed', label: 'Postponed' },
            { value: 'cancelled', label: 'Cancelled' }
        ]
        return statuses.filter(status => status.value !== s)
    }

    async function handleStatusChange(assignmentId, newStatus) {
        try {
            const lowerStatus = newStatus.toLowerCase()
            await changeAssignmentStatus(assignmentId, lowerStatus)
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
            console.error('Error changing assignment status:', error)
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
        const config = statusConfig[s] || { color: 'secondary', text: status }
        return (
            <CBadge
                color={config.color}
                className="d-flex align-items-center gap-1 px-2"
                shape="rounded-pill"
                style={{ fontSize: '0.75rem' }}
            >
                {config.icon && <CIcon icon={config.icon} size="sm" />}
                {config.text}
            </CBadge>
        )
    }

    const getPriorityBadge = (priority) => {
        const p = priority?.toLowerCase()
        const config = priorityConfig[p] || { color: 'secondary', text: priority }
        return (
            <CBadge
                color={config.color}
                shape="rounded-pill"
                className="px-2"
                style={{ fontSize: '0.75rem' }}
            >
                {config.text}
            </CBadge>
        )
    }

    const formatDate = (dateString) => {
        return dateString ? new Date(dateString).toLocaleDateString('en-US') : 'Not set'
    }

    const getParticipantsCount = (assignment) => {
        const officials = assignment.officials?.length || 0
        const funcionaries = assignment.funcionaries?.length || 0
        const witnesses = assignment.witnesses?.length || 0
        const jury = assignment.jury?.length || 0
        return officials + funcionaries + witnesses + jury + (assignment.judge_id ? 1 : 0)
    }

    const truncateDescription = (description, maxLength = 100) => {
        if (!description) return 'No description provided'
        return description.length > maxLength
            ? `${description.substring(0, maxLength)}...`
            : description
    }

    const DateCell = ({ date, time }) => (
        <CTableDataCell>
            <div className="d-flex align-items-center">
                <div className="p-1 rounded bg-opacity-10 bg-secondary me-2 text-primary">
                    <CIcon icon={cilCalendar} size="sm" />
                </div>
                <div>
                    <div className="small fw-semibold">{formatDate(date)}</div>
                    {time && <div className="small text-muted">{time}</div>}
                </div>
            </div>
        </CTableDataCell>
    )

    const ParticipantsCell = ({ assignment }) => {
        const officials = assignment.officials?.length || 0
        const witnesses = assignment.witnesses?.length || 0
        const jury = assignment.jury?.length || 0

        return (
            <CTableDataCell>
                <div className="d-flex align-items-center">
                    <div className="p-1 rounded bg-opacity-10 bg-secondary me-2 text-info">
                        <CIcon icon={cilPeople} size="sm" />
                    </div>
                    <div>
                        <div className="fw-semibold small">{getParticipantsCount(assignment)} Total</div>
                        <div className="small text-muted" style={{ fontSize: '0.7rem' }}>
                            {officials} Off. / {assignment.funcionaries?.length || 0} Fun. / {witnesses} Wit. / {jury} Jur.
                        </div>
                    </div>
                </div>
            </CTableDataCell>
        )
    }

    const AssignmentCard = ({ assignment }) => {
        const participantsCount = getParticipantsCount(assignment)

        return (
            <CCard className="h-100 shadow-sm border-0" style={{ borderRadius: '12px' }}>
                <div style={{
                    height: '4px',
                    background: assignment.priority?.toLowerCase() === 'high' ?
                        'linear-gradient(90deg, #dc3545 0%, #ff6b6b 100%)' :
                        assignment.priority?.toLowerCase() === 'medium' ?
                            'linear-gradient(90deg, #ffc107 0%, #ffd54f 100%)' :
                            'linear-gradient(90deg, #28a745 0%, #4caf50 100%)'
                }}></div>

                <CCardBody className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <CCardTitle className="fw-bold mb-1">
                                <CIcon icon={cilBalanceScale} className="text-primary me-2" />
                                <span>Case Details</span>
                            </CCardTitle>
                            <CCardText className="text-muted small mb-2">
                                {truncateDescription(assignment.case_title, 60)}
                            </CCardText>
                        </div>
                        {getStatusBadge(assignment.status)}
                    </div>

                    <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                            <CIcon icon={cilBalanceScale} className="me-2 text-secondary" size="sm" />
                            <span className="small fw-semibold">Judge:</span>
                        </div>
                        <CCardText className="mb-0 ps-4 small">
                            {assignment.judge_name || 'Unassigned'}
                        </CCardText>
                    </div>

                    <div className="row mb-3">
                        <div className="col-6">
                            <div className="d-flex align-items-center mb-1">
                                <CIcon icon={cilCalendar} className="me-2 text-primary" size="sm" />
                                <span className="small fw-semibold">Hearing</span>
                            </div>
                            <div className="ps-4">
                                <div className="small fw-semibold">{formatDate(assignment.hearing_date)}</div>
                                {assignment.hearing_time && (
                                    <div className="small text-muted">{assignment.hearing_time}</div>
                                )}
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="d-flex align-items-center mb-1">
                                <CIcon icon={cilCalendar} className="me-2 text-info" size="sm" />
                                <span className="small fw-semibold">Trial</span>
                            </div>
                            <div className="ps-4">
                                <div className="small fw-semibold">{formatDate(assignment.trial_date)}</div>
                                {assignment.trial_time && (
                                    <div className="small text-muted">{assignment.trial_time}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="d-flex align-items-center mb-2">
                            <CIcon icon={cilPeople} className="me-2 text-info" size="sm" />
                            <span className="small fw-semibold">Participants</span>
                        </div>
                        <div className="ps-4">
                            <div className="small fw-semibold">{participantsCount} Total</div>
                            <div className="small text-muted" style={{ fontSize: '0.7rem' }}>
                                Off: {assignment.officials?.length || 0} |
                                Fun: {assignment.funcionaries?.length || 0} |
                                Wit: {assignment.witnesses?.length || 0} |
                                Jur: {assignment.jury?.length || 0}
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="small fw-semibold">Priority:</span>
                        {getPriorityBadge(assignment.priority)}
                    </div>
                </CCardBody>

                <CCardFooter className="border-top-0 bg-transparent pt-0 pb-4 px-4">
                    <div className="d-flex justify-content-between gap-2">
                        <CTooltip content="View Details">
                            <CButton
                                size="sm"
                                variant="outline"
                                className="text-info shadow-sm"
                                onClick={() => handleShowInfo(assignment)}
                                title="View Details"
                                shape="rounded-pill"
                            >
                                <CIcon icon={cilInfo} />
                            </CButton>
                        </CTooltip>

                        {/* Action buttons (Edit/Delete) - Only for admin */}
                        {userRole === 'administrator' && (
                            <>
                                <CDropdown variant="btn-group">
                                    <CDropdownToggle
                                        size="sm"
                                        shape="rounded-pill"
                                        variant="outline"
                                        className="text-primary shadow-sm"
                                        split={false}
                                    >
                                        <CIcon icon={cilPencil} />
                                    </CDropdownToggle>
                                    <CDropdownMenu>
                                        <CDropdownItem
                                            onClick={() => handleEdit(assignment)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            Edit Details
                                        </CDropdownItem>
                                        <CDropdownItem divider />
                                        <CDropdownItem header style={{ cursor: 'default' }}>Status Management</CDropdownItem>
                                        {getStatusOptions(assignment.status).map(status => (
                                            <CDropdownItem
                                                key={status.value}
                                                onClick={() => handleStatusChange(assignment.id, status.value)}
                                                className={status.value === 'Cancelled' ? 'text-danger' : ''}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                Mark as {status.label}
                                            </CDropdownItem>
                                        ))}
                                    </CDropdownMenu>
                                </CDropdown>

                                <CTooltip content="Delete Assignment">
                                    <CButton
                                        size="sm"
                                        variant="outline"
                                        className="text-danger shadow-sm"
                                        onClick={() => showDeleteConfirmation(assignment.id, assignment.case_title)}
                                        title="Delete Assignment"
                                        shape="rounded-pill"
                                    >
                                        <CIcon icon={cilTrash} />
                                    </CButton>
                                </CTooltip>
                            </>
                        )}
                    </div>
                </CCardFooter>
            </CCard>
        )
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
                                        <CIcon icon={cilBalanceScale} className="me-2 text-primary" style={{ color: '#1a237e' }} />
                                        Assignment Management
                                    </h4>
                                    <p className="text-muted mb-0 small">
                                        Manage court cases, hearings, and assignments
                                    </p>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="btn-group" role="group">
                                        <CButton
                                            color={viewMode === 'cards' ? 'primary' : 'secondary'}
                                            variant={viewMode === 'cards' ? 'outline' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('cards')}
                                            title="Card View"
                                        >
                                            <CIcon icon={cilApps} />
                                        </CButton>
                                        <CButton
                                            color={viewMode === 'list' ? 'primary' : 'secondary'}
                                            variant={viewMode === 'list' ? 'outline' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('list')}
                                            title="List View"
                                        >
                                            <CIcon icon={cilListRich} />
                                        </CButton>
                                    </div>
                                    {userRole === 'administrator' && (
                                        <CButton
                                            color="primary colorbutton"
                                            style={colorbutton}
                                            onClick={handleNewAssignment}
                                            className="d-flex align-items-center px-4 py-2 shadow-sm"
                                            shape="rounded-pill"
                                        >
                                            <CIcon icon={cilPlus} className="me-2 fw-bold" />
                                            NEW ASSIGNMENT
                                        </CButton>
                                    )}
                                </div>
                            </div>
                        </CCardHeader>

                        <CCardBody className="px-4 pb-4">
                            {loading ? (
                                <div className="text-center py-5">
                                    <CSpinner color="primary" variant="grow" />
                                    <div className="mt-3 text-muted">Loading assignments...</div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 p-3 rounded-3 border d-flex justify-content-between align-items-center gap-3 bg-light-subtle dark:bg-dark-subtle">
                                        <div className="text-muted fw-semibold small">
                                            Total Records: <span className="fs-6">{filteredAssignments.length}</span>
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
                                            {viewMode === 'cards' ? (
                                                <CRow className="g-4">
                                                    {currentPageData.map(assignment => (
                                                        <CCol key={assignment.id} xs={12} sm={6} lg={4}>
                                                            <AssignmentCard assignment={assignment} />
                                                        </CCol>
                                                    ))}
                                                </CRow>
                                            ) : (
                                                <>
                                                    <div className="table-responsive border rounded-3">
                                                        <CTable hover align="middle" className="mb-0">
                                                            <CTableHead>
                                                                <CTableRow>
                                                                    <CTableHeaderCell className="text-uppercase text-secondary small ps-4 py-3" style={{ fontWeight: 600 }}>Case Details</CTableHeaderCell>
                                                                    <CTableHeaderCell className="text-uppercase text-secondary small py-3" style={{ fontWeight: 600 }}>Judge</CTableHeaderCell>
                                                                    <CTableHeaderCell className="text-uppercase text-secondary small py-3" style={{ fontWeight: 600 }}>Hearing</CTableHeaderCell>
                                                                    <CTableHeaderCell className="text-uppercase text-secondary small py-3" style={{ fontWeight: 600 }}>Trial</CTableHeaderCell>
                                                                    <CTableHeaderCell className="text-uppercase text-secondary small py-3" style={{ fontWeight: 600 }}>Participants</CTableHeaderCell>
                                                                    <CTableHeaderCell className="text-uppercase text-secondary small py-3" style={{ fontWeight: 600 }}>Priority</CTableHeaderCell>
                                                                    <CTableHeaderCell className="text-uppercase text-secondary small py-3" style={{ fontWeight: 600 }}>Status</CTableHeaderCell>
                                                                    <CTableHeaderCell className="text-uppercase text-secondary small text-end pe-4 py-3" style={{ fontWeight: 600, width: '150px' }}>Actions</CTableHeaderCell>
                                                                </CTableRow>
                                                            </CTableHead>
                                                            <CTableBody>
                                                                {currentPageData.map(assignment => (
                                                                    <CTableRow key={assignment.id}>
                                                                        <CTableDataCell className="ps-4">
                                                                            <div className="d-flex flex-column">
                                                                                <div className="d-flex align-items-center mb-1">
                                                                                    <CIcon icon={cilBalanceScale} size="sm" className="text-primary me-2" />
                                                                                    <span className="fw-bold">Trial Case</span>
                                                                                </div>
                                                                                <span className="small text-muted text-truncate" style={{ maxWidth: '150px' }}>{assignment.case_title}</span>
                                                                            </div>
                                                                        </CTableDataCell>
                                                                        <CTableDataCell>
                                                                            <div className="d-flex align-items-center">
                                                                                <CIcon icon={cilBalanceScale} size="sm" className="me-2 text-secondary" />
                                                                                {assignment.judge_name || 'Unassigned'}
                                                                            </div>
                                                                        </CTableDataCell>
                                                                        <DateCell date={assignment.hearing_date} time={assignment.hearing_time} />
                                                                        <DateCell date={assignment.trial_date} time={assignment.trial_time} />
                                                                        <ParticipantsCell assignment={assignment} />
                                                                        <CTableDataCell>
                                                                            {getPriorityBadge(assignment.priority)}
                                                                        </CTableDataCell>
                                                                        <CTableDataCell>
                                                                            {getStatusBadge(assignment.status)}
                                                                        </CTableDataCell>
                                                                        <CTableDataCell className="text-end pe-4">
                                                                            <div className="d-flex justify-content-end gap-2">
                                                                                <CButton
                                                                                    size="sm"
                                                                                    className="text-info shadow-sm"
                                                                                    onClick={() => handleShowInfo(assignment)}
                                                                                    title="View Details"
                                                                                    shape="rounded-pill"
                                                                                >
                                                                                    <CIcon icon={cilInfo} />
                                                                                </CButton>
                                                                                <CButton
                                                                                    size="sm"
                                                                                    className="text-success shadow-sm"
                                                                                    onClick={() => downloadAssignmentPDF(assignment.id)}
                                                                                    title="Download PDF"
                                                                                    shape="rounded-pill"
                                                                                >
                                                                                    <CIcon icon={cilCloudDownload} />
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
                                                                                                    onClick={() => handleEdit(assignment)}
                                                                                                    style={{ cursor: 'pointer' }}
                                                                                                >
                                                                                                    Edit Details
                                                                                                </CDropdownItem>
                                                                                                <CDropdownItem divider />
                                                                                                <CDropdownItem header style={{ cursor: 'default' }}>Status Management</CDropdownItem>
                                                                                                {getStatusOptions(assignment.status).map(status => (
                                                                                                    <CDropdownItem
                                                                                                        key={status.value}
                                                                                                        onClick={() => handleStatusChange(assignment.id, status.value)}
                                                                                                        className={status.value === 'Cancelled' ? 'text-danger' : ''}
                                                                                                        style={{ cursor: 'pointer' }}
                                                                                                    >
                                                                                                        Mark as {status.label}
                                                                                                    </CDropdownItem>
                                                                                                ))}
                                                                                            </CDropdownMenu>
                                                                                        </CDropdown>
                                                                                        <CButton
                                                                                            size="sm"
                                                                                            className="text-danger shadow-sm"
                                                                                            onClick={() => showDeleteConfirmation(assignment.id, assignment.case_title)}
                                                                                            title="Delete Assignment"
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
                                                </>
                                            )}

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
                                                <CIcon icon={cilBalanceScale} size="3xl" className="mb-3 text-secondary opacity-25" />
                                                <h5>{searchTerm ? 'No matches found' : 'No records available'}</h5>
                                                <p className="text-secondary">
                                                    {searchTerm
                                                        ? 'Try verifying the case number or title.'
                                                        : 'Create a new court assignment to get started.'
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

            <AssignmentForm
                visible={showForm}
                onClose={handleCloseForm}
                onSave={handleSave}
                initial={editing}
            />

            <InfoAssignment
                visible={showInfo}
                onClose={() => {
                    setShowInfo(false)
                    setSelectedAssignment(null)
                }}
                assignment={selectedAssignment}
            />

            <ConfirmationModal
                visible={deleteModal.visible}
                onClose={() => setDeleteModal({ visible: false, assignmentId: null, assignmentTitle: '' })}
                onConfirm={confirmDelete}
                title="Delete Assignment"
                message={`Are you sure you want to delete the assignment "${deleteModal.assignmentTitle}"? This action cannot be undone.`}
                confirmText="Confirm Delete"
                type="danger"
            />
        </CContainer>
    )
}

export default Assignments