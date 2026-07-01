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
    CListGroupItem
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilWarning,
    cilUser,
    cilLocationPin,
    cilCalendar,
    cilDescription,
    cilEnvelopeOpen,
    cilPhone,
    cilBalanceScale,
    cilClock,
    cilCloudDownload
} from '@coreui/icons'
import { modalStyles, cardStyles } from 'src/styles/darkModeStyles'
import { downloadAssignmentPDF } from 'src/services/reports'

const InfoAssignment = ({ visible, onClose, assignment }) => {
    const dispatch = useDispatch()
    if (!assignment) return null

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
            'scheduled': { color: 'primary', label: 'Programada' },
            'in_progress': { color: 'warning', label: 'En Progreso' },
            'completed': { color: 'success', label: 'Completada' },
            'cancelled': { color: 'danger', label: 'Cancelada' },
            'postponed': { color: 'info', label: 'Pospuesta' }
        }

        const config = statusConfig[s] || { color: 'secondary', label: status }
        return <CBadge color={config.color}>{config.label}</CBadge>
    }

    const getPriorityBadge = (priority) => {
        const p = priority?.toLowerCase()
        const priorityConfig = {
            'high': { color: 'danger', label: 'Alta' },
            'medium': { color: 'warning', label: 'Media' },
            'low': { color: 'success', label: 'Baja' }
        }

        const config = priorityConfig[p] || { color: 'secondary', label: priority }
        return <CBadge color={config.color}>{config.label}</CBadge>
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

    const formatTime = (timeString) => {
        if (!timeString) return ''
        return timeString
    }

    const getParticipantsCount = (assignment) => {
        const officials = assignment.officials?.length || 0
        const funcionaries = assignment.funcionaries?.length || 0
        const witnesses = assignment.witnesses?.length || 0
        const jury = assignment.jury?.length || 0
        return officials + funcionaries + witnesses + jury + (assignment.judge_id ? 1 : 0)
    }

    const downloadPDF = async (id) => {
        try {
            await downloadAssignmentPDF(id)
            dispatch({
                type: 'set',
                appAlert: {
                    visible: true,
                    color: 'success',
                    message: 'Su PDF se descargó correctamente',
                },
            })
        } catch (error) {
            console.error('Error downloading PDF:', error)
            dispatch({
                type: 'set',
                appAlert: {
                    visible: true,
                    color: 'danger',
                    message: 'Error al descargar el informe de asignación',
                },
            })
        }
    }

    return (
        <CModal size="lg" visible={visible} onClose={onClose}>
            <CModalHeader style={modalStyles.header}>
                <CModalTitle>
                    <CIcon icon={cilBalanceScale} className="me-2" />
                    Asignación - {assignment.case_number}
                </CModalTitle>
            </CModalHeader>
            <CModalBody style={modalStyles.bodyScrollable}>
                <CRow className="g-3">
                    <CCol md={12}>
                        <CCard className="tour-assignment-info-case-card mb-4" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilBalanceScale} className="me-2" />
                                    Información del Caso
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CRow className="g-3">
                                    <CCol md={8}>
                                        <h5>{assignment.case_title}</h5>
                                        <p className="text-muted">{assignment.case_description}</p>
                                    </CCol>
                                    <CCol md={4}>
                                        <div className="d-flex flex-column gap-2">
                                            <div className="d-flex justify-content-between">
                                                <span>Estado:</span>
                                                {getStatusBadge(assignment.status)}
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span>Prioridad:</span>
                                                {getPriorityBadge(assignment.priority)}
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span>Número de Caso:</span>
                                                <strong>{assignment.case_number}</strong>
                                            </div>
                                        </div>
                                    </CCol>
                                </CRow>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md={6}>
                        <CCard className="tour-assignment-info-court-card h-100" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilBalanceScale} className="me-2" />
                                    Información del Tribunal
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Tribunal:</span>
                                        <strong>{assignment.court || 'No especificado'}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Ubicación:</span>
                                        <strong>{assignment.location || 'No especificado'}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Juez:</span>
                                        <strong>{assignment.judge_name || 'Sin asignar'}</strong>
                                    </CListGroupItem>
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md={6}>
                        <CCard className="tour-assignment-info-participants-card h-100" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilUser} className="me-2" />
                                    Participantes
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Total de Participantes:</span>
                                        <CBadge color="primary">{getParticipantsCount(assignment)}</CBadge>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Oficiales:</span>
                                        <CBadge color="info">{assignment.officials?.length || 0}</CBadge>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Funcionarios Judiciales:</span>
                                        <CBadge color="primary">{assignment.funcionaries?.length || 0}</CBadge>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Testigos:</span>
                                        <CBadge color="warning">{assignment.witnesses?.length || 0}</CBadge>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Miembros del Jurado:</span>
                                        <CBadge color="success">{assignment.jury?.length || 0}</CBadge>
                                    </CListGroupItem>
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md={6}>
                        <CCard className="tour-assignment-info-hearing-card h-100" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilCalendar} className="me-2" />
                                    Información de Audiencia
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Fecha:</span>
                                        <strong>{formatDate(assignment.hearing_date)}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Hora:</span>
                                        <strong>{formatTime(assignment.hearing_time) || 'No especificada'}</strong>
                                    </CListGroupItem>
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md={6}>
                        <CCard className="tour-assignment-info-trial-card h-100" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilClock} className="me-2" />
                                    Información del Juicio
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Fecha:</span>
                                        <strong>{formatDate(assignment.trial_date)}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Hora:</span>
                                        <strong>{formatTime(assignment.trial_time) || 'No especificada'}</strong>
                                    </CListGroupItem>
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    {assignment.officials && assignment.officials.length > 0 && (
                        <CCol md={12}>
                            <CCard style={cardStyles.card}>
                                <CCardHeader style={cardStyles.header}>
                                    <h6 className="mb-0">Oficiales del Caso (Policía/Investigadores)</h6>
                                </CCardHeader>
                                <CCardBody style={cardStyles.body}>
                                    <CListGroup flush>
                                        {assignment.officials.map((official, index) => (
                                            <CListGroupItem key={index} className="px-0">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span>
                                                        <strong>{official.name}</strong>
                                                        <br />
                                                        <small className="text-muted">{official.role}</small>
                                                    </span>
                                                    <CBadge color="info">Oficial</CBadge>
                                                </div>
                                            </CListGroupItem>
                                        ))}
                                    </CListGroup>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    )}
                    {assignment.funcionaries && assignment.funcionaries.length > 0 && (
                        <CCol md={12}>
                            <CCard style={cardStyles.card}>
                                <CCardHeader style={cardStyles.header}>
                                    <h6 className="mb-0">Funcionarios Judiciales</h6>
                                </CCardHeader>
                                <CCardBody style={cardStyles.body}>
                                    <CListGroup flush>
                                        {assignment.funcionaries.map((f, index) => (
                                            <CListGroupItem key={index} className="px-0">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span>
                                                        <strong>{f.name}</strong>
                                                        <br />
                                                        <small className="text-muted">{f.role}</small>
                                                    </span>
                                                    <CBadge color="primary">Personal Judicial</CBadge>
                                                </div>
                                            </CListGroupItem>
                                        ))}
                                    </CListGroup>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    )}
                    {assignment.witnesses && assignment.witnesses.length > 0 && (
                        <CCol md={12}>
                            <CCard style={cardStyles.card}>
                                <CCardHeader style={cardStyles.header}>
                                    <h6 className="mb-0">Testigos</h6>
                                </CCardHeader>
                                <CCardBody style={cardStyles.body}>
                                    <CListGroup flush>
                                        {assignment.witnesses.map((witness, index) => (
                                            <CListGroupItem key={index} className="px-0">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span>
                                                        <strong>{witness.name}</strong>
                                                        <br />
                                                        <small className="text-muted">{witness.role}</small>
                                                    </span>
                                                    <CBadge color="warning">Testigo</CBadge>
                                                </div>
                                            </CListGroupItem>
                                        ))}
                                    </CListGroup>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    )}
                    {assignment.jury && assignment.jury.length > 0 && (
                        <CCol md={12}>
                            <CCard style={cardStyles.card}>
                                <CCardHeader style={cardStyles.header}>
                                    <h6 className="mb-0">Miembros del Jurado</h6>
                                </CCardHeader>
                                <CCardBody style={cardStyles.body}>
                                    <CListGroup flush>
                                        {assignment.jury.map((juryMember, index) => (
                                            <CListGroupItem key={index} className="px-0">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span>
                                                        <strong>{juryMember.name}</strong>
                                                        <br />
                                                        <small className="text-muted">{juryMember.role}</small>
                                                    </span>
                                                    <CBadge color="success">Jurado</CBadge>
                                                </div>
                                            </CListGroupItem>
                                        ))}
                                    </CListGroup>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    )}
                </CRow>
            </CModalBody>
            <CModalFooter style={modalStyles.footer}>
                <CButton
                    color="primary"
                    onClick={() => downloadPDF(assignment.id)}
                    className="tour-assignment-info-pdf-btn me-auto"
                >
                    <CIcon icon={cilCloudDownload} className="me-2" />
                    Descargar Informe PDF
                </CButton>
                <CButton color="secondary" onClick={onClose}>
                    Cerrar
                </CButton>
            </CModalFooter>
        </CModal>
    )
}

export default InfoAssignment