import React from 'react'
import { useDispatch } from 'react-redux'
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
    cilPhone,
    cilGlobeAlt,
    cilBuilding,
    cilMap,
    cilHome,
    cilCloudDownload
} from '@coreui/icons'
import { modalStyles, cardStyles, containerStyles } from 'src/styles/darkModeStyles'
import { downloadComplaintPDF } from 'src/services/reports'

const InfoComplaint = ({ visible, onClose, complaint }) => {
    const dispatch = useDispatch()
    if (!complaint) return null

    const formatLabel = (label) => {
        if (!label) return ''
        return label
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
    }

    const getStatusBadge = (status) => {
        const s = status?.toLowerCase()
        const statusConfig = {
            'received': { color: 'primary' },
            'under_investigation': { color: 'warning' },
            'resolved': { color: 'success' },
            'closed': { color: 'secondary' },
            'rejected': { color: 'danger' }
        }

        const config = statusConfig[s] || { color: 'secondary' }
        return <CBadge color={config.color}>{formatLabel(status)}</CBadge>
    }

    const getPriorityBadge = (priority) => {
        const p = priority?.toLowerCase()
        const priorityConfig = {
            'low': { color: 'success' },
            'medium': { color: 'warning' },
            'high': { color: 'danger' },
            'urgent': { color: 'danger' }
        }

        const config = priorityConfig[p] || { color: 'secondary' }
        return <CBadge color={config.color}>{formatLabel(priority)}</CBadge>
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

    const buildFullAddress = () => {
        const parts = []
        if (complaint.address_detail) parts.push(complaint.address_detail)
        if (complaint.zone) parts.push(complaint.zone)
        if (complaint.city) parts.push(complaint.city)
        if (complaint.municipality) parts.push(complaint.municipality)
        if (complaint.parish) parts.push(complaint.parish)
        if (complaint.state) parts.push(complaint.state)
        if (complaint.country) parts.push(complaint.country)

        return parts.join(', ')
    }

    const downloadPDF = async (id) => {
        try {
            await downloadComplaintPDF(id)
            dispatch({
                type: 'set',
                appAlert: {
                    visible: true,
                    color: 'success',
                    message: 'Your PDF downloaded successfully',
                },
            })
        } catch (error) {
            console.error('Error downloading PDF:', error)
            dispatch({
                type: 'set',
                appAlert: {
                    visible: true,
                    color: 'danger',
                    message: 'Error downloading PDF report',
                },
            })
        }
    }

    return (
        <CModal size="lg" visible={visible} onClose={onClose}>
            <CModalHeader style={modalStyles.header}>
                <CModalTitle>
                    <CIcon icon={cilWarning} className="me-2" />
                    Complaint Details
                </CModalTitle>
            </CModalHeader>
            <CModalBody style={modalStyles.bodyScrollable}>
                <CRow className="g-3">
                    <CCol md={12}>
                        <CCard className="mb-4" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilWarning} className="me-2" />
                                    Complaint Information
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
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
                                        </div>
                                    </CCol>
                                </CRow>
                            </CCardBody>
                        </CCard>
                    </CCol>

                    <CCol md={12}>
                        <CCard className="mb-4" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilMap} className="me-2" />
                                    Detailed Location Information
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CRow>
                                    <CCol md={12} className="mb-3">
                                        <div className="p-3 border rounded" style={containerStyles.lightBg}>
                                            <strong>Full Address:</strong>
                                            <div className="mt-1">
                                                {buildFullAddress() || 'No address details available'}
                                            </div>
                                        </div>
                                    </CCol>

                                    <CCol md={12}>
                                        <CRow className="g-3">
                                            <CCol md={4}>
                                                <div className="d-flex align-items-center mb-2">
                                                    <CIcon icon={cilGlobeAlt} className="me-2 text-primary" />
                                                    <strong>Country:</strong>
                                                </div>
                                                <div className="ms-4">
                                                    {complaint.country || 'Not specified'}
                                                </div>
                                            </CCol>

                                            <CCol md={4}>
                                                <div className="d-flex align-items-center mb-2">
                                                    <CIcon icon={cilMap} className="me-2 text-primary" />
                                                    <strong>State:</strong>
                                                </div>
                                                <div className="ms-4">
                                                    {complaint.state || 'Not specified'}
                                                </div>
                                            </CCol>

                                            <CCol md={4}>
                                                <div className="d-flex align-items-center mb-2">
                                                    <CIcon icon={cilBuilding} className="me-2 text-primary" />
                                                    <strong>Municipality:</strong>
                                                </div>
                                                <div className="ms-4">
                                                    {complaint.municipality || 'Not specified'}
                                                </div>
                                            </CCol>

                                            <CCol md={4}>
                                                <div className="d-flex align-items-center mb-2">
                                                    <CIcon icon={cilMap} className="me-2 text-primary" />
                                                    <strong>Parish:</strong>
                                                </div>
                                                <div className="ms-4">
                                                    {complaint.parish || 'Not specified'}
                                                </div>
                                            </CCol>

                                            <CCol md={4}>
                                                <div className="d-flex align-items-center mb-2">
                                                    <CIcon icon={cilBuilding} className="me-2 text-primary" />
                                                    <strong>City:</strong>
                                                </div>
                                                <div className="ms-4">
                                                    {complaint.city || 'Not specified'}
                                                </div>
                                            </CCol>

                                            <CCol md={4}>
                                                <div className="d-flex align-items-center mb-2">
                                                    <CIcon icon={cilLocationPin} className="me-2 text-primary" />
                                                    <strong>Zone/Neighborhood:</strong>
                                                </div>
                                                <div className="ms-4">
                                                    {complaint.zone || 'Not specified'}
                                                </div>
                                            </CCol>

                                            <CCol md={4}>
                                                <div className="d-flex align-items-center mb-2">
                                                    <CIcon icon={cilHome} className="me-2 text-primary" />
                                                    <strong>Street Address:</strong>
                                                </div>
                                                <div className="ms-4">
                                                    {complaint.address_detail || 'Not specified'}
                                                </div>
                                            </CCol>
                                        </CRow>
                                    </CCol>
                                </CRow>
                            </CCardBody>
                        </CCard>
                    </CCol>

                    <CCol md={6}>
                        <CCard className="h-100" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilCalendar} className="me-2" />
                                    Incident Details
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CListGroup flush>
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
                                    {complaint.latitude !== null && complaint.latitude !== undefined &&
                                        complaint.longitude !== null && complaint.longitude !== undefined && (
                                            <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                                <span className="d-flex align-items-center">
                                                    <CIcon icon={cilLocationPin} className="me-2 text-primary" />
                                                    Coordinates:
                                                </span>
                                                <small className="text-muted">
                                                    {Number(complaint.latitude).toFixed(6)}, {Number(complaint.longitude).toFixed(6)}
                                                </small>
                                            </CListGroupItem>
                                        )}
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md={6}>
                        <CCard className="h-100" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilUser} className="me-2" />
                                    Assigned Officer
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                {complaint.assignedOfficerName ? (
                                    <CListGroup flush>
                                        <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                            <span>Officer:</span>
                                            <strong>{complaint.assignedOfficerName}</strong>
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
                        <CCard className="h-100" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilUser} className="me-2" />
                                    Complainant Information
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Name:</span>
                                        <strong>{complaint.complainant_name}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilPhone} className="me-2 text-primary" />
                                            Phone:
                                        </span>
                                        <strong>{complaint.complainant_phone || 'Not provided'}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilEnvelopeOpen} className="me-2 text-primary" />
                                            Email:
                                        </span>
                                        <strong>{complaint.complainant_email || 'Not provided'}</strong>
                                    </CListGroupItem>
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md={6}>
                        <CCard className="h-100" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilPaperclip} className="me-2" />
                                    Evidence ({complaint.evidence?.length || 0})
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                {complaint.evidence && complaint.evidence.length > 0 ? (
                                    <CListGroup flush>
                                        {complaint.evidence.map((file, index) => {
                                            const isImage = file.type?.includes('image') || file.url?.startsWith('data:image')
                                            return (
                                                <CListGroupItem key={index} className="px-0 py-3 border-bottom">
                                                    <div className="d-flex align-items-start">
                                                        <CIcon
                                                            icon={getFileIcon(file.type || 'image/png')}
                                                            className="me-3 text-primary mt-1"
                                                            size="lg"
                                                        />
                                                        <div className="flex-grow-1">
                                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                                <span className="fw-semibold">{file.name}</span>
                                                                <small className="text-muted">
                                                                    {formatFileSize(file.size || 0)}
                                                                </small>
                                                            </div>
                                                            <div className="small text-muted mb-2">
                                                                Uploaded: {formatDate(file.uploadedAt)}
                                                            </div>
                                                            {isImage && file.url && (
                                                                <div className="mt-2 rounded overflow-hidden border shadow-sm" style={{ maxWidth: '200px' }}>
                                                                    <img
                                                                        src={file.url}
                                                                        alt={file.name}
                                                                        style={{ width: '100%', height: 'auto', display: 'block', cursor: 'pointer' }}
                                                                        onClick={() => window.open(file.url, '_blank')}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CListGroupItem>
                                            )
                                        })}
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
                        <CCard style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilDescription} className="me-2" />
                                    Full Description
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <div className="p-3 rounded" style={containerStyles.lightBg}>
                                    {complaint.description || 'No detailed description provided.'}
                                </div>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CModalBody>
            <CModalFooter style={modalStyles.footer}>
                <CButton
                    color="primary"
                    onClick={() => downloadPDF(complaint.id)}
                    className="me-auto"
                >
                    <CIcon icon={cilCloudDownload} className="me-2" />
                    Download PDF Report
                </CButton>
                <CButton color="secondary" onClick={onClose}>
                    Close
                </CButton>
            </CModalFooter>
        </CModal>
    )
}

export default InfoComplaint