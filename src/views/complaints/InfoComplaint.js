import React from 'react'
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
    CTableDataCell
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { 
    cilWarning, 
    cilUser, 
    cilLocationPin, 
    cilCalendar,
    cilDescription,
    cilImage,
    cilPaperclip,
    cilEnvelopeOpen,
    cilPhone
} from '@coreui/icons'

const InfoComplaint = ({ visible, onClose, complaint }) => {
    if (!complaint) return null

    const getStatusBadge = (status) => {
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

    const getPriorityBadge = (priority) => {
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
                month: 'long',
                day: 'numeric'
            })
        } catch (e) {
            return 'Invalid date'
        }
    }

    const getFileIcon = (fileType) => {
        if (fileType.includes('image')) return cilImage
        if (fileType.includes('video')) return cilImage 
        return cilPaperclip
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <CModal size="xl" visible={visible} onClose={onClose}>
            <CModalHeader>
                <CModalTitle>
                    <CIcon icon={cilWarning} className="me-2" />
                    Complaint Details - #{complaint.id}
                </CModalTitle>
            </CModalHeader>
            <CModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <CRow className="g-3">
                    <CCol md={12}>
                        <CCard className="mb-4">
                            <CCardHeader className="bg-light">
                                <h6 className="mb-0">
                                    <CIcon icon={cilWarning} className="me-2" />
                                    Complaint Information
                                </h6>
                            </CCardHeader>
                            <CCardBody>
                                <CRow className="g-3">
                                    <CCol md={8}>
                                        <h5>{complaint.title}</h5>
                                        <p className="text-muted">{complaint.description}</p>
                                    </CCol>
                                    <CCol md={4}>
                                        <div className="d-flex flex-column gap-2">
                                            <div className="d-flex justify-content-between">
                                                <span>Status:</span>
                                                {getStatusBadge(complaint.status)}
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span>Priority:</span>
                                                {getPriorityBadge(complaint.priority)}
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span>Complaint ID:</span>
                                                <strong>#{complaint.id}</strong>
                                            </div>
                                        </div>
                                    </CCol>
                                </CRow>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md={6}>
                        <CCard className="h-100">
                            <CCardHeader className="bg-light">
                                <h6 className="mb-0">
                                    <CIcon icon={cilLocationPin} className="me-2" />
                                    Incident Details
                                </h6>
                            </CCardHeader>
                            <CCardBody>
                                <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilLocationPin} className="me-2 text-primary" />
                                            Location:
                                        </span>
                                        <strong>{complaint.location}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilCalendar} className="me-2 text-primary" />
                                            Incident Date:
                                        </span>
                                        <strong>{formatDate(complaint.incidentDate)}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilCalendar} className="me-2 text-primary" />
                                            Created:
                                        </span>
                                        <small className="text-muted">
                                            {formatDate(complaint.createdAt)}
                                        </small>
                                    </CListGroupItem>
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md={6}>
                        <CCard className="h-100">
                            <CCardHeader className="bg-light">
                                <h6 className="mb-0">
                                    <CIcon icon={cilUser} className="me-2" />
                                    Assigned Officer
                                </h6>
                            </CCardHeader>
                            <CCardBody>
                                {complaint.assignedOfficerName ? (
                                    <CListGroup flush>
                                        <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                            <span>Officer:</span>
                                            <strong>{complaint.assignedOfficerName}</strong>
                                        </CListGroupItem>
                                        <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                            <span>Officer ID:</span>
                                            <strong>#{complaint.assignedOfficerId}</strong>
                                        </CListGroupItem>
                                    </CListGroup>
                                ) : (
                                    <div className="text-center text-muted py-3">
                                        <CIcon icon={cilUser} size="xl" />
                                        <div>No officer assigned</div>
                                        <small>This complaint is not assigned to any officer yet</small>
                                    </div>
                                )}
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md={6}>
                        <CCard className="h-100">
                            <CCardHeader className="bg-light">
                                <h6 className="mb-0">
                                    <CIcon icon={cilUser} className="me-2" />
                                    Complainant Information
                                </h6>
                            </CCardHeader>
                            <CCardBody>
                                <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Name:</span>
                                        <strong>{complaint.complainantName}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilPhone} className="me-2 text-primary" />
                                            Phone:
                                        </span>
                                        <strong>{complaint.complainantPhone || 'Not provided'}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilEnvelopeOpen} className="me-2 text-primary" />
                                            Email:
                                        </span>
                                        <strong>{complaint.complainantEmail || 'Not provided'}</strong>
                                    </CListGroupItem>
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md={6}>
                        <CCard className="h-100">
                            <CCardHeader className="bg-light">
                                <h6 className="mb-0">
                                    <CIcon icon={cilPaperclip} className="me-2" />
                                    Evidence ({complaint.evidence?.length || 0})
                                </h6>
                            </CCardHeader>
                            <CCardBody>
                                {complaint.evidence && complaint.evidence.length > 0 ? (
                                    <CListGroup flush>
                                        {complaint.evidence.map((file, index) => (
                                            <CListGroupItem key={index} className="px-0">
                                                <div className="d-flex align-items-center">
                                                    <CIcon 
                                                        icon={getFileIcon(file.type)} 
                                                        className="me-2 text-primary" 
                                                    />
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span>{file.name}</span>
                                                            <small className="text-muted">
                                                                {formatFileSize(file.size)}
                                                            </small>
                                                        </div>
                                                        <small className="text-muted">
                                                            Uploaded: {formatDate(file.uploadedAt)}
                                                        </small>
                                                    </div>
                                                </div>
                                            </CListGroupItem>
                                        ))}
                                    </CListGroup>
                                ) : (
                                    <div className="text-center text-muted py-3">
                                        <CIcon icon={cilPaperclip} size="xl" />
                                        <div>No evidence files</div>
                                        <small>No multimedia evidence has been uploaded</small>
                                    </div>
                                )}
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md={12}>
                        <CCard>
                            <CCardHeader className="bg-light">
                                <h6 className="mb-0">
                                    <CIcon icon={cilDescription} className="me-2" />
                                    Full Description
                                </h6>
                            </CCardHeader>
                            <CCardBody>
                                <div className="p-3 bg-light rounded">
                                    {complaint.description || 'No detailed description provided.'}
                                </div>
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

export default InfoComplaint