import React, { useState, useEffect } from 'react'
import { 
    CModal, 
    CModalHeader, 
    CModalTitle, 
    CModalBody, 
    CModalFooter,
    CButton,
    CRow,
    CCol,
    CCard,
    CCardBody,
    CCardHeader,
    CBadge,
    CListGroup,
    CListGroupItem,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { 
    cilUser, 
    cilAddressBook, 
    cilEnvelopeOpen, 
    cilPhone, 
    cilShieldAlt,
    cilCalendar,
    cilWarning,
    cilListRich
} from '@coreui/icons'
import AvatarLetter from 'src/components/AvatarLetter'
import { listComplaints } from 'src/services/complaints'

const InfoOfficer = ({ visible, onClose, officer }) => {
    const [complaints, setComplaints] = useState([])
    const [loadingComplaints, setLoadingComplaints] = useState(false)

    useEffect(() => {
        if (visible && officer) {
            loadOfficerComplaints()
        }
    }, [visible, officer])

    const loadOfficerComplaints = async () => {
        if (!officer) return
        
        setLoadingComplaints(true)
        try {
            const allComplaints = await listComplaints()
            const officerComplaints = allComplaints.filter(complaint => 
                complaint.assignedOfficerId === officer.id
            )
            setComplaints(officerComplaints)
        } catch (error) {
            console.error('Error loading officer complaints:', error)
            setComplaints([])
        } finally {
            setLoadingComplaints(false)
        }
    }

    if (!officer) return null

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Active': { color: 'success', text: 'Active' },
            'Inactive': { color: 'danger', text: 'Inactive' },
            'Training': { color: 'warning', text: 'Training' },
            'Suspended': { color: 'secondary', text: 'Suspended' }
        }
        
        const config = statusConfig[status] || { color: 'secondary', text: status }
        return <CBadge color={config.color}>{config.text}</CBadge>
    }

    const getComplaintStatusBadge = (status) => {
        const statusConfig = {
            'Received': { color: 'primary', text: 'Received' },
            'Under Investigation': { color: 'warning', text: 'Under Investigation' },
            'Resolved': { color: 'success', text: 'Resolved' },
            'Closed': { color: 'secondary', text: 'Closed' },
            'Rejected': { color: 'danger', text: 'Rejected' }
        }
        
        const config = statusConfig[status] || { color: 'secondary', text: status }
        return <CBadge color={config.color}>{config.text}</CBadge>
    }

    const getComplaintPriorityBadge = (priority) => {
        const priorityConfig = {
            'Low': { color: 'success', text: 'Low' },
            'Medium': { color: 'warning', text: 'Medium' },
            'High': { color: 'danger', text: 'High' },
            'Urgent': { color: 'danger', text: 'Urgent' }
        }
        
        const config = priorityConfig[priority] || { color: 'secondary', text: priority }
        return <CBadge color={config.color}>{config.text}</CBadge>
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Not available'
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        } catch (e) {
            return 'Invalid date'
        }
    }

    return (
        <CModal size="xl" visible={visible} onClose={onClose}>
            <CModalHeader>
                <CModalTitle>
                    <CIcon icon={cilUser} className="me-2" />
                    Officer Information - {officer.name} {officer.lastName}
                </CModalTitle>
            </CModalHeader>
            <CModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <CRow className="g-3">
                    <CCol md={12}>
                        <CCard className="mb-4">
                            <CCardHeader className="bg-light">
                                <h6 className="mb-0">
                                    <CIcon icon={cilUser} className="me-2" />
                                    Officer Profile
                                </h6>
                            </CCardHeader>
                            <CCardBody>
                                <CRow className="g-3 align-items-center">
                                    <CCol md={3} className="text-center">
                                        <AvatarLetter 
                                            name={`${officer.name}`} 
                                            size={80}
                                            className="mb-2"
                                        />
                                        <div className="mt-2">
                                            {getStatusBadge(officer.status)}
                                        </div>
                                    </CCol>
                                    <CCol md={9}>
                                        <CRow className="g-3">
                                            <CCol md={6}>
                                                <strong>Full Name:</strong>
                                                <div className="text-muted">
                                                    {officer.name} {officer.lastName}
                                                </div>
                                            </CCol>
                                            <CCol md={6}>
                                                <strong>Officer ID:</strong>
                                                <div className="text-muted">#{officer.id}</div>
                                            </CCol>
                                            <CCol md={6}>
                                                <strong>Rank:</strong>
                                                <div className="text-muted">
                                                    {officer.rank || 'Not specified'}
                                                </div>
                                            </CCol>
                                            <CCol md={6}>
                                                <strong>Unit:</strong>
                                                <div className="text-muted">{officer.unit}</div>
                                            </CCol>
                                        </CRow>
                                    </CCol>
                                </CRow>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md={6}>
                        <CCard className="h-100">
                            <CCardHeader className="bg-light">
                                <h6 className="mb-0">
                                    <CIcon icon={cilAddressBook} className="me-2" />
                                    Contact Information
                                </h6>
                            </CCardHeader>
                            <CCardBody>
                                <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilAddressBook} className="me-2 text-primary" />
                                            ID Number:
                                        </span>
                                        <strong>{officer.idNumber || 'Not specified'}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilEnvelopeOpen} className="me-2 text-primary" />
                                            Email:
                                        </span>
                                        <strong>{officer.email || 'Not specified'}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilPhone} className="me-2 text-primary" />
                                            Phone:
                                        </span>
                                        <strong>{officer.phone || 'Not specified'}</strong>
                                    </CListGroupItem>
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md={6}>
                        <CCard className="h-100">
                            <CCardHeader className="bg-light">
                                <h6 className="mb-0">
                                    <CIcon icon={cilListRich} className="me-2" />
                                    Assignment Statistics
                                </h6>
                            </CCardHeader>
                            <CCardBody>
                                <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Total Complaints:</span>
                                        <CBadge color="primary">{complaints.length}</CBadge>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Under Investigation:</span>
                                        <CBadge color="warning">
                                            {complaints.filter(c => c.status === 'Under Investigation').length}
                                        </CBadge>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Resolved:</span>
                                        <CBadge color="success">
                                            {complaints.filter(c => c.status === 'Resolved').length}
                                        </CBadge>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>High Priority:</span>
                                        <CBadge color="danger">
                                            {complaints.filter(c => c.priority === 'High' || c.priority === 'Urgent').length}
                                        </CBadge>
                                    </CListGroupItem>
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md={12}>
                        <CCard>
                            <CCardHeader className="bg-light">
                                <h6 className="mb-0">
                                    <CIcon icon={cilWarning} className="me-2" />
                                    Assigned Complaints ({complaints.length})
                                </h6>
                            </CCardHeader>
                            <CCardBody>
                                {loadingComplaints ? (
                                    <div className="text-center py-4">
                                        <CSpinner color="primary" />
                                        <div className="mt-2">Loading complaints...</div>
                                    </div>
                                ) : complaints.length > 0 ? (
                                    <CTable hover responsive>
                                        <CTableHead>
                                            <CTableRow>
                                                <CTableHeaderCell>ID</CTableHeaderCell>
                                                <CTableHeaderCell>Title</CTableHeaderCell>
                                                <CTableHeaderCell>Complainant</CTableHeaderCell>
                                                <CTableHeaderCell>Location</CTableHeaderCell>
                                                <CTableHeaderCell>Priority</CTableHeaderCell>
                                                <CTableHeaderCell>Status</CTableHeaderCell>
                                                <CTableHeaderCell>Incident Date</CTableHeaderCell>
                                            </CTableRow>
                                        </CTableHead>
                                        <CTableBody>
                                            {complaints.map(complaint => (
                                                <CTableRow key={complaint.id}>
                                                    <CTableDataCell>#{complaint.id}</CTableDataCell>
                                                    <CTableDataCell>
                                                        <strong>{complaint.title}</strong>
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        {complaint.complainantName}
                                                        <br />
                                                        <small className="text-muted">{complaint.complainantPhone}</small>
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        <small>{complaint.location}</small>
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        {getComplaintPriorityBadge(complaint.priority)}
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        {getComplaintStatusBadge(complaint.status)}
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        {formatDate(complaint.incidentDate)}
                                                    </CTableDataCell>
                                                </CTableRow>
                                            ))}
                                        </CTableBody>
                                    </CTable>
                                ) : (
                                    <div className="text-center py-4 text-muted">
                                        <CIcon icon={cilWarning} size="xl" className="mb-2" />
                                        <div>No complaints assigned to this officer</div>
                                        <small>This officer doesn't have any assigned complaints at the moment.</small>
                                    </div>
                                )}
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={onClose}>
                    Close
                </CButton>
            </CModalFooter>
        </CModal>
    )
}

export default InfoOfficer