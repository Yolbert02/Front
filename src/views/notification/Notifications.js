import React, { useEffect, useState } from 'react'
import {
    CCard, CCardBody, CCardHeader, CContainer, CRow, CCol,
    CButton, CBadge, CSpinner,
    CFormInput, CInputGroup, CInputGroupText, CCardTitle, CCardText,
    CCardFooter, CTooltip,
    CTable, CTableHead, CTableRow, CTableHeaderCell,
    CTableBody, CTableDataCell
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilPlus, cilPencil, cilTrash, cilCalendar, cilUser,
    cilBalanceScale, cilInfo, cilSearch, cilCheckCircle, cilBan,
    cilClock, cilWarning, cilPeople, cilListRich, cilApps
} from '@coreui/icons'
import NotificationForm from './NotificationForm'
import InfoNotification from './InfoNotification'
import {
    listNotifications, deleteNotification,
    updateNotification, createNotification
} from 'src/services/notifications'
import ConfirmationModal from 'src/components/ConfirmationModal'
import Pagination from 'src/components/Pagination'

const Notifications = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [showInfo, setShowInfo] = useState(false)
    const [editing, setEditing] = useState(null)
    const [selectedNotification, setSelectedNotification] = useState(null)

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(6)
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState('cards')

    const [deleteModal, setDeleteModal] = useState({
        visible: false,
        notificationId: null,
        notificationTitle: ''
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
            const res = await listNotifications()
            setData(res || [])
        } catch (error) {
            console.error('Error fetching notifications:', error)
            setData([])
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (term) => {
        setSearchTerm(term)
        setCurrentPage(1)
    }

    const filteredNotifications = data.filter(notification => {
        if (!searchTerm) return true

        const searchLower = searchTerm.toLowerCase()
        return (
            notification.case_number?.toLowerCase().includes(searchLower) ||
            notification.judge_name?.toLowerCase().includes(searchLower) ||
            notification.case_title?.toLowerCase().includes(searchLower)
        )
    })

    const getCurrentPageData = () => {
        if (!Array.isArray(filteredNotifications) || filteredNotifications.length === 0) return []

        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage

        return filteredNotifications.slice(startIndex, endIndex)
    }

    const currentPageData = getCurrentPageData()
    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage)

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const handleSave = async (payload) => {
        try {
            if (editing?.id) {
                await updateNotification(editing.id, payload)
            } else {
                await createNotification(payload)
            }
            setShowForm(false)
            setEditing(null)
            await fetchData()
        } catch (error) {
            console.error('Error saving notification:', error)
            alert('Error saving notification: ' + error.message)
        }
    }

    const showDeleteConfirmation = (id, title) => {
        setDeleteModal({
            visible: true,
            notificationId: id,
            notificationTitle: title
        })
    }

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id)
            await fetchData()
            console.log('Notification deleted successfully')
        } catch (error) {
            console.error('Error deleting notification:', error)
            alert('Error deleting notification: ' + error.message)
        }
    }

    const confirmDelete = () => {
        if (deleteModal.notificationId) {
            handleDelete(deleteModal.notificationId)
        }
        setDeleteModal({ visible: false, notificationId: null, notificationTitle: '' })
    }

    const handleEdit = (notification) => {
        setEditing(notification)
        setShowForm(true)
    }

    const handleNewNotification = () => {
        setEditing(null)
        setShowForm(true)
    }

    const handleCloseForm = () => {
        setShowForm(false)
        setEditing(null)
    }

    const handleShowInfo = (notification) => {
        setSelectedNotification(notification)
        setShowInfo(true)
    }

    const getStatusBadge = (status) => {
        const config = statusConfig[status] || { color: 'secondary', text: status }
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
        const config = priorityConfig[priority] || { color: 'secondary', text: priority }
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

    const getParticipantsCount = (notification) => {
        const officials = notification.officials?.length || 0
        const witnesses = notification.witnesses?.length || 0
        const jury = notification.jury?.length || 0
        return officials + witnesses + jury + (notification.judge_id ? 1 : 0)
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

    const ParticipantsCell = ({ notification }) => {
        const officials = notification.officials?.length || 0
        const witnesses = notification.witnesses?.length || 0
        const jury = notification.jury?.length || 0

        return (
            <CTableDataCell>
                <div className="d-flex align-items-center">
                    <div className="p-1 rounded bg-opacity-10 bg-secondary me-2 text-info">
                        <CIcon icon={cilPeople} size="sm" />
                    </div>
                    <div>
                        <div className="fw-semibold small">{getParticipantsCount(notification)} Total</div>
                        <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                            {officials} Off. / {witnesses} Wit. / {jury} Jur.
                        </div>
                    </div>
                </div>
            </CTableDataCell>
        )
    }

    const NotificationCard = ({ notification }) => {
        const participantsCount = getParticipantsCount(notification)

        return (
            <CCard className="h-100 shadow-sm border-0" style={{ borderRadius: '12px' }}>
                <div style={{
                    height: '4px',
                    background: notification.priority === 'high' ?
                        'linear-gradient(90deg, #dc3545 0%, #ff6b6b 100%)' :
                        notification.priority === 'medium' ?
                            'linear-gradient(90deg, #ffc107 0%, #ffd54f 100%)' :
                            'linear-gradient(90deg, #28a745 0%, #4caf50 100%)'
                }}></div>

                <CCardBody className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <CCardTitle className="fw-bold mb-1">
                                <span className="font-monospace">{notification.case_number}</span>
                            </CCardTitle>
                            <CCardText className="text-muted small mb-2">
                                {truncateDescription(notification.case_title, 60)}
                            </CCardText>
                        </div>
                        {getStatusBadge(notification.status)}
                    </div>

                    <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                            <CIcon icon={cilBalanceScale} className="me-2 text-secondary" size="sm" />
                            <span className="small fw-semibold">Judge:</span>
                        </div>
                        <CCardText className="mb-0 ps-4 small">
                            {notification.judge_name || 'Unassigned'}
                        </CCardText>
                    </div>

                    <div className="row mb-3">
                        <div className="col-6">
                            <div className="d-flex align-items-center mb-1">
                                <CIcon icon={cilCalendar} className="me-2 text-primary" size="sm" />
                                <span className="small fw-semibold">Hearing</span>
                            </div>
                            <div className="ps-4">
                                <div className="small fw-semibold">{formatDate(notification.hearing_date)}</div>
                                {notification.hearing_time && (
                                    <div className="small text-muted">{notification.hearing_time}</div>
                                )}
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="d-flex align-items-center mb-1">
                                <CIcon icon={cilCalendar} className="me-2 text-info" size="sm" />
                                <span className="small fw-semibold">Trial</span>
                            </div>
                            <div className="ps-4">
                                <div className="small fw-semibold">{formatDate(notification.trial_date)}</div>
                                {notification.trial_time && (
                                    <div className="small text-muted">{notification.trial_time}</div>
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
                                Officials: {notification.officials?.length || 0} |
                                Witnesses: {notification.witnesses?.length || 0} |
                                Jury: {notification.jury?.length || 0}
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="small fw-semibold">Priority:</span>
                        {getPriorityBadge(notification.priority)}
                    </div>
                </CCardBody>

                <CCardFooter className="border-top-0 bg-transparent pt-0 pb-4 px-4">
                    <div className="d-flex justify-content-between gap-2">
                        <CTooltip content="View Details">
                            <CButton
                                size="sm"
                                color="light"
                                variant="outline"
                                className="text-info shadow-sm"
                                onClick={() => handleShowInfo(notification)}
                                title="View Details"
                                shape="rounded-pill"
                            >
                                <CIcon icon={cilInfo} />
                            </CButton>
                        </CTooltip>

                        <CTooltip content="Edit Notification">
                            <CButton
                                size="sm"
                                color="light"
                                variant="outline"
                                className="text-primary shadow-sm"
                                onClick={() => handleEdit(notification)}
                                title="Edit Notification"
                                shape="rounded-pill"
                            >
                                <CIcon icon={cilPencil} />
                            </CButton>
                        </CTooltip>

                        <CTooltip content="Delete Notification">
                            <CButton
                                size="sm"
                                color="light"
                                variant="outline"
                                className="text-danger shadow-sm"
                                onClick={() => showDeleteConfirmation(notification.id, notification.case_title)}
                                title="Delete Notification"
                                shape="rounded-pill"
                            >
                                <CIcon icon={cilTrash} />
                            </CButton>
                        </CTooltip>
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
                                        Judicial Notifications
                                    </h4>
                                    <p className="text-muted mb-0 small">
                                        Manage court dates, hearings, and participants
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
                                    <CButton
                                        color="primary"
                                        style={{ backgroundColor: '#1a237e', borderColor: '#1a237e' }}
                                        onClick={handleNewNotification}
                                        className="d-flex align-items-center px-4 py-2 shadow-sm"
                                        shape="rounded-pill"
                                    >
                                        <CIcon icon={cilPlus} className="me-2 fw-bold" />
                                        NEW NOTIFICATION
                                    </CButton>
                                </div>
                            </div>
                        </CCardHeader>

                        <CCardBody className="px-4 pb-4">
                            {loading ? (
                                <div className="text-center py-5">
                                    <CSpinner color="primary" variant="grow" />
                                    <div className="mt-3 text-muted">Loading notifications...</div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 p-3 rounded-3 border d-flex justify-content-between align-items-center gap-3 bg-light-subtle dark:bg-dark-subtle">
                                        <div className="text-muted fw-semibold small">
                                            Total Records: <span className="fs-6">{filteredNotifications.length}</span>
                                        </div>

                                        <div style={{ maxWidth: '400px', width: '100%' }}>
                                            <CInputGroup>
                                                <CInputGroupText className="border-end-0 text-muted">
                                                    <CIcon icon={cilSearch} />
                                                </CInputGroupText>
                                                <CFormInput
                                                    className="border-start-0 ps-0"
                                                    placeholder="Search"
                                                    value={searchTerm}
                                                    onChange={(e) => handleSearch(e.target.value)}
                                                />
                                            </CInputGroup>
                                        </div>
                                    </div>

                                    {currentPageData.length > 0 ? (
                                        <>
                                            {viewMode === 'cards' ? (
                                                <CRow className="g-4">
                                                    {currentPageData.map(notification => (
                                                        <CCol key={notification.id} xs={12} sm={6} lg={4}>
                                                            <NotificationCard notification={notification} />
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
                                                                {currentPageData.map(notification => (
                                                                    <CTableRow key={notification.id}>
                                                                        <CTableDataCell className="ps-4">
                                                                            <div className="d-flex flex-column">
                                                                                <span className="font-monospace fw-bold">{notification.case_number}</span>
                                                                                <span className="small text-muted text-truncate" style={{ maxWidth: '150px' }}>{notification.case_title}</span>
                                                                            </div>
                                                                        </CTableDataCell>
                                                                        <CTableDataCell>
                                                                            <div className="d-flex align-items-center">
                                                                                <CIcon icon={cilBalanceScale} size="sm" className="me-2 text-secondary" />
                                                                                {notification.judge_name || 'Unassigned'}
                                                                            </div>
                                                                        </CTableDataCell>
                                                                        <DateCell date={notification.hearing_date} time={notification.hearing_time} />
                                                                        <DateCell date={notification.trial_date} time={notification.trial_time} />
                                                                        <ParticipantsCell notification={notification} />
                                                                        <CTableDataCell>
                                                                            {getPriorityBadge(notification.priority)}
                                                                        </CTableDataCell>
                                                                        <CTableDataCell>
                                                                            {getStatusBadge(notification.status)}
                                                                        </CTableDataCell>
                                                                        <CTableDataCell className="text-end pe-4">
                                                                            <div className="d-flex justify-content-end gap-2">
                                                                                <CButton
                                                                                    size="sm"
                                                                                    color="light"
                                                                                    className="text-info shadow-sm"
                                                                                    onClick={() => handleShowInfo(notification)}
                                                                                    title="View Details"
                                                                                    shape="rounded-pill"
                                                                                >
                                                                                    <CIcon icon={cilInfo} />
                                                                                </CButton>
                                                                                <CButton
                                                                                    size="sm"
                                                                                    color="light"
                                                                                    className="text-primary shadow-sm"
                                                                                    onClick={() => handleEdit(notification)}
                                                                                    title="Edit Notification"
                                                                                    shape="rounded-pill"
                                                                                >
                                                                                    <CIcon icon={cilPencil} />
                                                                                </CButton>
                                                                                <CButton
                                                                                    size="sm"
                                                                                    color="light"
                                                                                    className="text-danger shadow-sm"
                                                                                    onClick={() => showDeleteConfirmation(notification.id, notification.case_title)}
                                                                                    title="Delete Notification"
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
                                                </>
                                            )}

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
                                                <CIcon icon={cilBalanceScale} size="3xl" className="mb-3 text-secondary opacity-25" />
                                                <h5>{searchTerm ? 'No matches found' : 'No records available'}</h5>
                                                <p className="text-secondary">
                                                    {searchTerm
                                                        ? 'Try verifying the case number or title.'
                                                        : 'Create a new court notification to get started.'
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

            <NotificationForm
                visible={showForm}
                onClose={handleCloseForm}
                onSave={handleSave}
                initial={editing}
            />

            <InfoNotification
                visible={showInfo}
                onClose={() => {
                    setShowInfo(false)
                    setSelectedNotification(null)
                }}
                notification={selectedNotification}
            />

            <ConfirmationModal
                visible={deleteModal.visible}
                onClose={() => setDeleteModal({ visible: false, notificationId: null, notificationTitle: '' })}
                onConfirm={confirmDelete}
                title="Delete Notification"
                message={`Are you sure you want to delete the notification "${deleteModal.notificationTitle}"? This action cannot be undone.`}
                confirmText="Confirm Delete"
                type="danger"
            />
        </CContainer>
    )
}

export default Notifications