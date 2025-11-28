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
    CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { 
    cilPlus, 
    cilPencil, 
    cilTrash, 
    cilCalendar, 
    cilUser, 
    cilBalanceScale,
    cilInfo
} from '@coreui/icons'
import NotificationForm from './NotificationForm'
import InfoNotification from './InfoNotification'
import { 
    listNotifications, 
    deleteNotification, 
    updateNotification, 
    createNotification 
} from 'src/services/notifications'
import ConfirmationModal from 'src/components/ConfirmationModal'

const Notifications = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [showInfo, setShowInfo] = useState(false)
    const [editing, setEditing] = useState(null)
    const [selectedNotification, setSelectedNotification] = useState(null)

    const [deleteModal, setDeleteModal] = useState({
    visible: false,
    notificationId: null,
    notificationTitle: ''
})

    const statusConfig = {
        'scheduled': { color: 'primary', text: 'Scheduled' },
        'in_progress': { color: 'warning', text: 'In Progress' },
        'completed': { color: 'success', text: 'Completed' },
        'cancelled': { color: 'danger', text: 'Cancelled' },
        'postponed': { color: 'info', text: 'Postponed' }
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
        return <CBadge color={config.color}>{config.text}</CBadge>
    }

    const getPriorityBadge = (priority) => {
        const config = priorityConfig[priority] || { color: 'secondary', text: priority }
        return <CBadge color={config.color}>{config.text}</CBadge>
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

    const truncateDescription = (description, maxLength = 50) => {
        if (!description) return ''
        return description.length > maxLength 
            ? `${description.substring(0, maxLength)}...`
            : description
    }

    const DateCell = ({ date, time }) => (
        <CTableDataCell>
            <div className="d-flex align-items-start">
                <CIcon icon={cilCalendar} className="me-1 text-primary mt-1" />
                <div>
                    <div>{formatDate(date)}</div>
                    {time && (
                        <small className="text-muted">{time}</small>
                    )}
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
                <div className="d-flex align-items-start">
                    <CIcon icon={cilUser} className="me-1 text-info mt-1" />
                    <div>
                        <div>{getParticipantsCount(notification)} people</div>
                        <small className="text-muted">
                            {officials} official(s), {witnesses} witness(es), {jury} juror(s)
                        </small>
                    </div>
                </div>
            </CTableDataCell>
        )
    }

    const LoadingState = () => (
        <div className="text-center py-4">
            <CSpinner color="primary" />
            <div className="mt-2">Loading judicial notifications...</div>
        </div>
    )

    const EmptyState = () => (
        <div className="text-center py-5">
            <div className="text-muted">
                <CIcon icon={cilBalanceScale} size="3xl" className="mb-3" />
                <h5>No judicial notifications found</h5>
                <p>Start by creating a new judicial notification.</p>
                <CButton color="primary" onClick={handleNewNotification}>
                    Create first notification
                </CButton>
            </div>
        </div>
    )

    return (
        <CContainer fluid>
            <CRow>
                <CCol>
                    <CCard>
                        <CCardHeader>
                            <div className="d-flex justify-content-between align-items-center">
                                <h4 className="mb-0">
                                    <CIcon icon={cilBalanceScale} className="me-2" />
                                    Judicial Notifications Management
                                </h4>
                                <CButton color="primary" onClick={handleNewNotification}>
                                    <CIcon icon={cilPlus} className="me-2" />
                                    New Notification
                                </CButton>
                            </div>
                        </CCardHeader>
                        <CCardBody>
                            {loading ? (
                                <LoadingState />
                            ) : (
                                <>
                                    <div className="mb-3 text-muted">
                                        Showing {data.length} judicial notification(s)
                                    </div>
                                    
                                    {data.length > 0 ? (
                                        <CTable hover responsive>
                                            <CTableHead>
                                                <CTableRow>
                                                    <CTableHeaderCell>Case No.</CTableHeaderCell>
                                                    <CTableHeaderCell>Case Title</CTableHeaderCell>
                                                    <CTableHeaderCell>Judge</CTableHeaderCell>
                                                    <CTableHeaderCell>Hearing Date</CTableHeaderCell>
                                                    <CTableHeaderCell>Trial Date</CTableHeaderCell>
                                                    <CTableHeaderCell>Participants</CTableHeaderCell>
                                                    <CTableHeaderCell>Priority</CTableHeaderCell>
                                                    <CTableHeaderCell>Status</CTableHeaderCell>
                                                    <CTableHeaderCell style={{ width: '150px' }}>Actions</CTableHeaderCell>
                                                </CTableRow>
                                            </CTableHead>
                                            <CTableBody>
                                                {data.map(notification => (
                                                    <CTableRow key={notification.id}>
                                                        <CTableDataCell>
                                                            <strong>{notification.case_number}</strong>
                                                        </CTableDataCell>
                                                        <CTableDataCell>
                                                            <div>
                                                                <strong>{notification.case_title}</strong>
                                                                <br />
                                                                <small className="text-muted">
                                                                    {truncateDescription(notification.case_description)}
                                                                </small>
                                                            </div>
                                                        </CTableDataCell>
                                                        <CTableDataCell>
                                                            {notification.judge_name || 'Not assigned'}
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
                                                        <CTableDataCell>
                                                            <div className="d-flex gap-2">
                                                                <CButton 
                                                                    size="sm" 
                                                                    color="success" 
                                                                    variant="outline"
                                                                    onClick={() => handleShowInfo(notification)}
                                                                    title="View notification details"
                                                                >
                                                                    <CIcon icon={cilInfo} />
                                                                </CButton>
                                                                <CButton 
                                                                    size="sm" 
                                                                    color="primary" 
                                                                    variant="outline"
                                                                    onClick={() => handleEdit(notification)}
                                                                    title="Edit notification"
                                                                >
                                                                    <CIcon icon={cilPencil} />
                                                                </CButton>
                                                                <CButton 
                                                                    size="sm" 
                                                                    color="danger" 
                                                                    variant="outline"
                                                                    onClick={() => showDeleteConfirmation(notification.id, notification.case_title)}
                                                                    title="Delete notification"
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
                                        <EmptyState />
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
                title="Delete Judicial Notification"
                message={`Are you sure you want to delete the notification "${deleteModal.notificationTitle}"? This action cannot be undone.`}
                confirmText="Delete"
                type="danger"
            />
        </CContainer>
    )
}

export default Notifications