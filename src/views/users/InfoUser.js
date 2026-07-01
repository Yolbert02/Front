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
import AvatarLetterXL from 'src/components/AvatarLetterXL'
import { modalStyles, cardStyles, containerStyles } from 'src/styles/darkModeStyles'

const InfoUser = ({ visible, onClose, user }) => {
    if (!user) return null

    const getRoleBadge = (role) => {
        const r = role?.toLowerCase()
        const roleConfig = {
            'administrator': { color: 'danger', text: 'Administrador', icon: cilShieldAlt },
            'functionary': { color: 'info', text: 'Funcionario', icon: cilPeople },
            'officer': { color: 'primary', text: 'Oficial', icon: cilShieldAlt },
            'civil': { color: 'success', text: 'Civil', icon: cilUser }
        }

        const config = roleConfig[r] || { color: 'secondary', text: role, icon: cilUser }
        return (
            <CBadge color={config.color}>
                <CIcon icon={config.icon} className="me-1" />
                {config.text}
            </CBadge>
        )
    }

    const getStatusBadge = (status) => {
        const s = status?.toLowerCase()
        const statusConfig = {
            'active': { color: 'success', text: 'Activo' },
            'suspended': { color: 'warning', text: 'Suspendido' },
            'inactive': { color: 'secondary', text: 'Inactivo' },
            'deleted': { color: 'danger', text: 'Eliminado' }
        }

        const config = statusConfig[s] || { color: 'secondary', text: status }
        return <CBadge color={config.color}>{config.text}</CBadge>
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible'
        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch (e) {
            return 'Fecha inválida'
        }
    }

    return (
        <CModal size="lg" visible={visible} onClose={onClose}>
            <CModalHeader style={modalStyles.header}>
                <CModalTitle>
                    <CIcon icon={cilUser} className="me-2" />
                    Información del Usuario - {user.first_name} {user.second_name ? user.second_name + ' ' : ''}{user.last_name} {user.second_last_name || ''}
                </CModalTitle>
            </CModalHeader>
            <CModalBody style={modalStyles.body}>
                <CRow className="g-3">
                    <CCol md={12}>
                        <CCard className="mb-4 tour-user-info-profile" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilUser} className="me-2" />
                                    Información del Perfil
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CRow className="g-3 align-items-center">
                                    <CCol md={3} className="text-center">
                                        <AvatarLetterXL
                                            name={user.first_name}
                                            lastName={user.last_name}
                                            src={user.profile_picture}
                                            size="xl"
                                            className="mb-2"
                                        />
                                        <div className="mt-2">
                                            {getRoleBadge(user.role)}
                                        </div>
                                    </CCol>
                                    <CCol md={9}>
                                        <CRow className="g-3">
                                            <CCol md={6}>
                                                <strong>Primer Nombre:</strong>
                                                <div className="text-muted">
                                                    {user.first_name}
                                                </div>
                                            </CCol>
                                            <CCol md={6}>
                                                <strong>Segundo Nombre:</strong>
                                                <div className="text-muted">
                                                    {user.second_name || 'No especificado'}
                                                </div>
                                            </CCol>
                                            <CCol md={6}>
                                                <strong>Primer Apellido:</strong>
                                                <div className="text-muted">
                                                    {user.last_name}
                                                </div>
                                            </CCol>
                                            <CCol md={6}>
                                                <strong>Segundo Apellido:</strong>
                                                <div className="text-muted">
                                                    {user.second_last_name || 'No especificado'}
                                                </div>
                                            </CCol>
                                            <CCol md={6}>
                                                <strong>Estado:</strong>
                                                <div>{getStatusBadge(user.status)}</div>
                                            </CCol>
                                            <CCol md={6}>
                                                <strong>Miembro desde:</strong>
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
                        <CCard className="h-100 tour-user-info-contact" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilAddressBook} className="me-2" />
                                    Identificación y Contacto
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilAddressBook} className="me-2 text-primary" />
                                            DNI:
                                        </span>
                                        <strong>{user.dni}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilEnvelopeOpen} className="me-2 text-primary" />
                                            Correo Electrónico:
                                        </span>
                                        <strong>{user.email}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilPhone} className="me-2 text-primary" />
                                            Teléfono:
                                        </span>
                                        <strong>{user.phone}</strong>
                                    </CListGroupItem>
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </CCol>

                    {/* System Information */}
                    <CCol md={6}>
                        <CCard className="h-100 tour-user-info-system" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilShieldAlt} className="me-2" />
                                    Información del Sistema
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Rol:</span>
                                        {getRoleBadge(user.role)}
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Estado:</span>
                                        {getStatusBadge(user.status)}
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilCalendar} className="me-2 text-primary" />
                                            Creado:
                                        </span>
                                        <small className="text-muted">
                                            {formatDate(user.createdAt)}
                                        </small>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilCalendar} className="me-2 text-primary" />
                                            Última Actualización:
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
                            <CCard style={cardStyles.card}>
                                <CCardHeader style={cardStyles.header}>
                                    <h6 className="mb-0">Información Adicional</h6>
                                </CCardHeader>
                                <CCardBody style={cardStyles.body}>
                                    <CRow className="g-3">
                                        {user.department && (
                                            <CCol md={6}>
                                                <strong>Departamento:</strong>
                                                <div className="text-muted">{user.department}</div>
                                            </CCol>
                                        )}
                                        {user.location && (
                                            <CCol md={6}>
                                                <strong>Ubicación:</strong>
                                                <div className="text-muted">{user.location}</div>
                                            </CCol>
                                        )}
                                        {user.bio && (
                                            <CCol md={12}>
                                                <strong>Bio:</strong>
                                                <div className="text-muted mt-1 p-2 rounded" style={containerStyles.lightBg}>
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
            <CModalFooter style={modalStyles.footer}>
                <CButton color="secondary" onClick={onClose}>
                    Cerrar
                </CButton>
            </CModalFooter>
        </CModal>
    )
}

export default InfoUser