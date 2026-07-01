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
import AvatarLetterXL from 'src/components/AvatarLetterXL'
import { listComplaints } from 'src/services/complaints'
import { modalStyles, cardStyles } from 'src/styles/darkModeStyles'

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
            'active': { color: 'success', text: 'Activo' },
            'inactive': { color: 'danger', text: 'Inactivo' },
            'training': { color: 'warning', text: 'En Formación' },
            'suspended': { color: 'secondary', text: 'Suspendido' }
        }

        const config = statusConfig[status] || { color: 'secondary', text: status }
        return <CBadge color={config.color}>{config.text}</CBadge>
    }

    const getComplaintStatusBadge = (status) => {
        const statusConfig = {
            'received': { color: 'primary', text: 'Recibida' },
            'under_investigation': { color: 'warning', text: 'Bajo Investigación' },
            'resolved': { color: 'success', text: 'Resuelta' },
            'closed': { color: 'secondary', text: 'Cerrada' },
            'rejected': { color: 'danger', text: 'Rechazada' }
        }

        const config = statusConfig[status] || { color: 'secondary', text: status }
        return <CBadge color={config.color}>{config.text}</CBadge>
    }

    const getComplaintPriorityBadge = (priority) => {
        const priorityConfig = {
            'low': { color: 'success', text: 'Baja' },
            'medium': { color: 'warning', text: 'Media' },
            'high': { color: 'danger', text: 'Alta' },
            'urgent': { color: 'danger', text: 'Urgente' }
        }

        const config = priorityConfig[priority] || { color: 'secondary', text: priority }
        return <CBadge color={config.color}>{config.text}</CBadge>
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible'
        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
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
                    Información del Oficial - {officer.name} {officer.secondName ? officer.secondName + ' ' : ''}{officer.lastName} {officer.secondLastName || ''}
                </CModalTitle>
            </CModalHeader>
            <CModalBody style={modalStyles.bodyScrollable}>
                <CRow className="g-3">
                    <CCol md={12}>
                        <CCard className="mb-4 tour-officer-info-profile" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilUser} className="me-2" />
                                    Perfil del Oficial
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CRow className="g-3 align-items-center">
                                    <CCol md={3} className="text-center">
                                        <AvatarLetterXL
                                            name={`${officer.name}`}
                                            size="xl"
                                            className="mb-2"
                                        />
                                        <div className="mt-2">
                                            {getStatusBadge(officer.status)}
                                        </div>
                                    </CCol>
                                    <CCol md={9}>
                                        <CRow className="g-3">
                                            <CCol md={6}>
                                                <strong>Primer Nombre:</strong>
                                                <div className="text-muted">
                                                    {officer.name}
                                                </div>
                                            </CCol>
                                            <CCol md={6}>
                                                <strong>Segundo Nombre:</strong>
                                                <div className="text-muted">
                                                    {officer.secondName || 'No especificado'}
                                                </div>
                                            </CCol>
                                            <CCol md={6}>
                                                <strong>Primer Apellido:</strong>
                                                <div className="text-muted">
                                                    {officer.lastName}
                                                </div>
                                            </CCol>
                                            <CCol md={6}>
                                                <strong>Segundo Apellido:</strong>
                                                <div className="text-muted">
                                                    {officer.secondLastName || 'No especificado'}
                                                </div>
                                            </CCol>
                                            <CCol md={6}>
                                                <strong>Rango:</strong>
                                                <div className="text-muted">
                                                    {officer.rank || 'No especificado'}
                                                </div>
                                            </CCol>
                                            <CCol md={6}>
                                                <strong>Unidad:</strong>
                                                <div className="text-muted">{officer.unit}</div>
                                            </CCol>
                                        </CRow>
                                    </CCol>
                                </CRow>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md={6}>
                        <CCard className="h-100 tour-officer-info-contact" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilAddressBook} className="me-2" />
                                    Información de Contacto
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilAddressBook} className="me-2 text-primary" />
                                            Cédula de Identidad:
                                        </span>
                                        <strong>{officer.idNumber || 'No especificado'}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilEnvelopeOpen} className="me-2 text-primary" />
                                            Correo Electrónico:
                                        </span>
                                        <strong>{officer.email || 'No especificado'}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span className="d-flex align-items-center">
                                            <CIcon icon={cilPhone} className="me-2 text-primary" />
                                            Teléfono:
                                        </span>
                                        <strong>{officer.phone || 'No especificado'}</strong>
                                    </CListGroupItem>
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md={6}>
                        <CCard className="h-100 tour-officer-info-stats" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilListRich} className="me-2" />
                                    Estadísticas de Asignación
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Total de Denuncias:</span>
                                        <CBadge color="primary">{complaints.length}</CBadge>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Bajo Investigación:</span>
                                        <CBadge color="warning">
                                            {complaints.filter(c => c.status === 'under_investigation').length}
                                        </CBadge>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Resueltas:</span>
                                        <CBadge color="success">
                                            {complaints.filter(c => c.status === 'resolved').length}
                                        </CBadge>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Prioridad Alta:</span>
                                        <CBadge color="danger">
                                            {complaints.filter(c => c.priority === 'high' || c.priority === 'urgent').length}
                                        </CBadge>
                                    </CListGroupItem>
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md={12}>
                        <CCard style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilWarning} className="me-2" />
                                    Denuncias Asignadas ({complaints.length})
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                {loadingComplaints ? (
                                    <div className="text-center py-4">
                                        <CSpinner color="primary" />
                                        <div className="mt-2">Cargando denuncias...</div>
                                    </div>
                                ) : complaints.length > 0 ? (
                                    <CTable hover responsive>
                                        <CTableHead>
                                            <CTableRow>
                                                <CTableHeaderCell>Caso</CTableHeaderCell>
                                                <CTableHeaderCell>Título</CTableHeaderCell>
                                                <CTableHeaderCell>Denunciante</CTableHeaderCell>
                                                <CTableHeaderCell>Ubicación</CTableHeaderCell>
                                                <CTableHeaderCell>Prioridad</CTableHeaderCell>
                                                <CTableHeaderCell>Estado</CTableHeaderCell>
                                                <CTableHeaderCell>Fecha del Incidente</CTableHeaderCell>
                                            </CTableRow>
                                        </CTableHead>
                                        <CTableBody>
                                            {complaints.map(complaint => (
                                                <CTableRow key={complaint.id}>
                                                    <CTableDataCell>
                                                        <CIcon icon={cilListRich} className="text-primary" />
                                                    </CTableDataCell>
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
                                        <div>No hay denuncias asignadas a este oficial</div>
                                        <small>Este oficial no tiene denuncias asignadas en este momento.</small>
                                    </div>
                                )}
                            </CCardBody>
                        </CCard>
                    </CCol>
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

export default InfoOfficer