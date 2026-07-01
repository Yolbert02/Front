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

// Leaflet imports
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

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

    const getFileIcon = (fileType) => {
        if (fileType?.includes('image')) return cilImage
        if (fileType?.includes('video')) return cilImage
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
        if (complaint.address) parts.push(complaint.address)
        if (complaint.zone) parts.push(complaint.zone)
        if (complaint.city) parts.push(complaint.city)
        if (complaint.municipality) parts.push(complaint.municipality)
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
                    message: 'Error al descargar el reporte PDF',
                },
            })
        }
    }

    const hasCoords = complaint.latitude && complaint.longitude;
    const position = hasCoords ? [complaint.latitude, complaint.longitude] : null;

    return (
        <CModal size="lg" visible={visible} onClose={onClose}>
            <CModalHeader style={modalStyles.header}>
                <CModalTitle>
                    <CIcon icon={cilWarning} className="me-2" />
                    Detalles de la Denuncia
                </CModalTitle>
            </CModalHeader>
            <CModalBody style={modalStyles.bodyScrollable}>
                <CRow className="g-3">
                    <CCol md={12}>
                        <CCard className="tour-complaint-info-card mb-4" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilWarning} className="me-2" />
                                    Información de la Denuncia
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CRow className="g-3">
                                    <CCol md={8}>
                                        <h5>{complaint.title}</h5>
                                        <p className="text-muted">{complaint.description}</p>
                                    </CCol>
                                    <CCol md={4}>
                                        <div className="d-flex flex-column gap-2 text-end">
                                            <div>
                                                <span className="me-2">Estado:</span>
                                                {getStatusBadge(complaint.status)}
                                            </div>
                                            <div>
                                                <span className="me-2">Prioridad:</span>
                                                {getPriorityBadge(complaint.priority)}
                                            </div>
                                        </div>
                                    </CCol>
                                </CRow>
                            </CCardBody>
                        </CCard>
                    </CCol>

                    <CCol md={12}>
                        <CCard className="tour-complaint-info-location-card mb-4" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilMap} className="me-2" />
                                    Ubicación Geográfica
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CRow className="g-3">
                                    <CCol md={hasCoords ? 6 : 12}>
                                        <div className="p-3 border rounded h-100 bg-light">
                                            <div className="mb-3">
                                                <strong>Dirección Completa:</strong>
                                                <div className="text-muted small mt-1">{buildFullAddress() || 'No disponible'}</div>
                                            </div>
                                            <CRow className="g-2 small">
                                                <CCol xs={6}><strong>Zona:</strong> {complaint.zone || 'N/A'}</CCol>
                                                <CCol xs={6}><strong>Ciudad:</strong> {complaint.city || 'N/A'}</CCol>
                                                <CCol xs={6}><strong>Municipio:</strong> {complaint.municipality || 'N/A'}</CCol>
                                                <CCol xs={6}><strong>Estado:</strong> {complaint.state || 'N/A'}</CCol>
                                            </CRow>
                                        </div>
                                    </CCol>
                                    {hasCoords && (
                                        <CCol md={6}>
                                            <div className="border rounded overflow-hidden shadow-sm" style={{ height: '200px' }}>
                                                <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false}>
                                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                    <Marker position={position} icon={DefaultIcon} />
                                                </MapContainer>
                                            </div>
                                            <div className="text-center small mt-1 text-muted">
                                                Lat: {complaint.latitude.toFixed(6)}, Lon: {complaint.longitude.toFixed(6)}
                                            </div>
                                        </CCol>
                                    )}
                                </CRow>
                            </CCardBody>
                        </CCard>
                    </CCol>

                    <CCol md={6}>
                        <CCard className="tour-complaint-info-complainant-card h-100" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilUser} className="me-2" />
                                    Información del Denunciante
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Nombre:</span>
                                        <strong>{complaint.complainant_name}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Teléfono:</span>
                                        <strong>{complaint.complainant_phone || 'N/A'}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Correo:</span>
                                        <strong className="small">{complaint.complainant_email || 'N/A'}</strong>
                                    </CListGroupItem>
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </CCol>

                    <CCol md={6}>
                        <CCard className="tour-complaint-info-chronology-card h-100" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilCalendar} className="me-2" />
                                    Cronología y Asignación
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Incidente:</span>
                                        <strong>{formatDate(complaint.incidentDate)}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Oficial:</span>
                                        <strong>{complaint.assignedOfficerName || 'Sin asignar'}</strong>
                                    </CListGroupItem>
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </CCol>

                    <CCol md={12}>
                        <CCard className="tour-complaint-info-evidence-card" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilPaperclip} className="me-2" />
                                    Evidencia Multimedia ({complaint.evidence?.length || 0})
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                {complaint.evidence && complaint.evidence.length > 0 ? (
                                    <div className="d-flex flex-wrap gap-3">
                                        {complaint.evidence.map((file, index) => {
                                            const isImage = file.type?.includes('image') || file.url?.startsWith('data:image')
                                            return (
                                                <div key={index} className="border rounded p-2 text-center" style={{ width: '120px' }}>
                                                    {isImage ? (
                                                        <img src={file.url} alt={file.name} style={{ width: '100px', height: '100px', objectFit: 'cover', cursor: 'pointer' }} onClick={() => window.open(file.url, '_blank')} className="rounded mb-1" />
                                                    ) : (
                                                        <div className="bg-light rounded d-flex align-items-center justify-content-center mb-1" style={{ width: '100px', height: '100px' }}>
                                                            <CIcon icon={getFileIcon(file.type)} size="xl" />
                                                        </div>
                                                    )}
                                                    <div className="small text-truncate" title={file.name}>{file.name}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted py-3 small">No hay evidencia adjunta</div>
                                )}
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CModalBody>
            <CModalFooter style={modalStyles.footer}>
                <CButton color="primary" onClick={() => downloadPDF(complaint.id)} className="tour-complaint-info-pdf-btn me-auto">
                    <CIcon icon={cilCloudDownload} className="me-2" /> Reporte PDF
                </CButton>
                <CButton color="secondary" onClick={onClose}>Cerrar</CButton>
            </CModalFooter>
        </CModal>
    )
}

export default InfoComplaint