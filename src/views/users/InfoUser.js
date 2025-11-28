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
    CListGroupItem
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { 
    cilUser, 
    cilAddressBook, 
    cilEnvelopeOpen, 
    cilPhone, 
    cilShieldAlt,
    cilCalendar,
    cilPeople
} from '@coreui/icons'
import AvatarLetter from 'src/components/AvatarLetter'

const InfoUser = ({ visible, onClose, user }) => {
    if (!user) return null

    const getRoleBadge = (role) => {
        const roleConfig = {
            'administrador': { color: 'danger', text: 'Administrator', icon: cilShieldAlt },
            'funcionario': { color: 'info', text: 'Funcionary', icon: cilPeople },
            'civil': { color: 'success', text: 'Civil', icon: cilUser }
        }
        
        const config = roleConfig[role] || { color: 'secondary', text: role, icon: cilUser }
        return (
            <CBadge color={config.color}>
                <CIcon icon={config.icon} className="me-1" />
                {config.text}
            </CBadge>
        )
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            'activo': { color: 'success', text: 'Active' },
            'suspendido': { color: 'warning', text: 'Suspended' },
            'eliminado': { color: 'danger', text: 'Deleted' }
        }
        
        const config = statusConfig[status] || { color: 'secondary', text: status }
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

    return (
        <CModal size="lg" visible={visible} onClose={onClose}>
            <CModalHeader>
                <CModalTitle>
                    <CIcon icon={cilUser} className="me-2" />
                    User Information - {user.first_name} {user.last_name}
                </CModalTitle>
            </CModalHeader>
            <CModalBody>
                <CRow className="g-3">
                    {/* Profile Section */}
                    <CCol md={12}>
                        <CCard className="mb-4">
                            <CCardHeader className="bg-light">
                                <h6 className="mb-0">
                                    <CIcon icon={cilUser} className="me-2" />
                                    Profile Information
                                </h6>
                            </CCardHeader>
                            <CCardBody>
                                <CRow className="g-3 align-items-center">
                                    <CCol md={3} className="text-center">
                                        <AvatarLetter 
                                            name={`${user.first_name}`} 
                                            size={80}
                                            className="mb-2"
                                        />
                                        <div className="mt-2">
                                            {getRoleBadge(user.role)}
                                        </div>
                                    </CCol>
                                    <CCol md={9}>
                                        <CRow className="g-3">
                                            <CCol md={6}>
                                                <strong>Full Name:</strong>
                                                <div className="text-muted">
                                                    {user.first_name} {user.last_name}
                                                </div>
                                            </CCol>
                                            <CCol md={6}>
                                                <strong>User ID:</strong>
                                                <div className="text-muted">#{user.id}</div>
                                            </CCol>
                                            <CCol md={6}>
                                                <strong>Status:</strong>
                                                <div>{getStatusBadge(user.status)}</div>
                                            </CCol>
                                            <CCol md={6}>
                                                <strong>Member Since:</strong>
                                                <div className="text-muted">
                                                    {formatDate(user.createdAt)}
                                                </div>
                                            </CCol>
                                        </CRow>
                                    </CCol>
                                </CRow>
                            </CCardBody>
                        </CCard>
                    </CCol>

                    {/* Contact Information */}
                    <CCol md={6}>
                        <CCard className="h-100">
                            <CCardHeader className="bg-light">
                                <h6 className="mb-0">
                                    <CIcon icon={cilAddressBook} className="me-2" />
                                    Identification & Contact
                                </h6>
                            </CCardHeader>
                            <CCardBody>
                                <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilAddressBook} className="me-2 text-primary" />
                                            Document:
                                        </span>
                                        <strong>{user.document}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilEnvelopeOpen} className="me-2 text-primary" />
                                            Email:
                                        </span>
                                        <strong>{user.gmail}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilPhone} className="me-2 text-primary" />
                                            Phone:
                                        </span>
                                        <strong>{user.number_phone}</strong>
                                    </CListGroupItem>
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </CCol>

                    {/* System Information */}
                    <CCol md={6}>
                        <CCard className="h-100">
                            <CCardHeader className="bg-light">
                                <h6 className="mb-0">
                                    <CIcon icon={cilShieldAlt} className="me-2" />
                                    System Information
                                </h6>
                            </CCardHeader>
                            <CCardBody>
                                <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Role:</span>
                                        {getRoleBadge(user.role)}
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Status:</span>
                                        {getStatusBadge(user.status)}
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilCalendar} className="me-2 text-primary" />
                                            Created:
                                        </span>
                                        <small className="text-muted">
                                            {formatDate(user.createdAt)}
                                        </small>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilCalendar} className="me-2 text-primary" />
                                            Last Updated:
                                        </span>
                                        <small className="text-muted">
                                            {formatDate(user.updatedAt)}
                                        </small>
                                    </CListGroupItem>
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    {(user.department || user.location || user.bio) && (
                        <CCol md={12}>
                            <CCard>
                                <CCardHeader className="bg-light">
                                    <h6 className="mb-0">Additional Information</h6>
                                </CCardHeader>
                                <CCardBody>
                                    <CRow className="g-3">
                                        {user.department && (
                                            <CCol md={6}>
                                                <strong>Department:</strong>
                                                <div className="text-muted">{user.department}</div>
                                            </CCol>
                                        )}
                                        {user.location && (
                                            <CCol md={6}>
                                                <strong>Location:</strong>
                                                <div className="text-muted">{user.location}</div>
                                            </CCol>
                                        )}
                                        {user.bio && (
                                            <CCol md={12}>
                                                <strong>Bio:</strong>
                                                <div className="text-muted mt-1 p-2 bg-light rounded">
                                                    {user.bio}
                                                </div>
                                            </CCol>
                                        )}
                                    </CRow>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    )}
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

export default InfoUser