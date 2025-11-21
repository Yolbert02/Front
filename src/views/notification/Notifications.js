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
    cilBalanceScale 
} from '@coreui/icons'
import NotificationForm from './NotificationForm'
import { 
    listNotifications, 
    deleteNotification, 
    updateNotification, 
    createNotification 
} from 'src/services/notifications'

const Notifications = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)

    // Configuraciones
    const statusConfig = {
        'programado': { color: 'primary', text: 'Programado' },
        'en_curso': { color: 'warning', text: 'En Curso' },
        'concluido': { color: 'success', text: 'Concluido' },
        'cancelado': { color: 'danger', text: 'Cancelado' },
        'aplazado': { color: 'info', text: 'Aplazado' }
    }

    const priorityConfig = {
        'alta': { color: 'danger', text: 'Alta' },
        'media': { color: 'warning', text: 'Media' },
        'baja': { color: 'success', text: 'Baja' }
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
            alert('Error al guardar la notificación: ' + error.message)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta notificación judicial?')) return
        
        try {
            await deleteNotification(id)
            await fetchData()
        } catch (error) {
            console.error('Error deleting notification:', error)
            alert('Error al eliminar la notificación: ' + error.message)
        }
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

    // Funciones de utilidad
    const getStatusBadge = (status) => {
        const config = statusConfig[status] || { color: 'secondary', text: status }
        return <CBadge color={config.color}>{config.text}</CBadge>
    }

    const getPriorityBadge = (priority) => {
        const config = priorityConfig[priority] || { color: 'secondary', text: priority }
        return <CBadge color={config.color}>{config.text}</CBadge>
    }

    const formatDate = (dateString) => {
        return dateString ? new Date(dateString).toLocaleDateString('es-ES') : 'No establecida'
    }

    const getParticipantsCount = (notification) => {
        const funcionaries = notification.funcionaries?.length || 0
        const witnesses = notification.witnesses?.length || 0
        const jury = notification.jury?.length || 0
        return funcionaries + witnesses + jury + (notification.judge_id ? 1 : 0)
    }

    const truncateDescription = (description, maxLength = 50) => {
        if (!description) return ''
        return description.length > maxLength 
            ? `${description.substring(0, maxLength)}...`
            : description
    }

    // Componentes reutilizables
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
        const funcionaries = notification.funcionaries?.length || 0
        const witnesses = notification.witnesses?.length || 0
        const jury = notification.jury?.length || 0
        
        return (
            <CTableDataCell>
                <div className="d-flex align-items-start">
                    <CIcon icon={cilUser} className="me-1 text-info mt-1" />
                    <div>
                        <div>{getParticipantsCount(notification)} personas</div>
                        <small className="text-muted">
                            {funcionaries} funcionario(s), {witnesses} testigo(s), {jury} jurado(s)
                        </small>
                    </div>
                </div>
            </CTableDataCell>
        )
    }

    const LoadingState = () => (
        <div className="text-center py-4">
            <CSpinner color="primary" />
            <div className="mt-2">Cargando notificaciones judiciales...</div>
        </div>
    )

    const EmptyState = () => (
        <div className="text-center py-5">
            <div className="text-muted">
                <CIcon icon={cilBalanceScale} size="3xl" className="mb-3" />
                <h5>No se encontraron notificaciones judiciales</h5>
                <p>Comienza creando una nueva notificación judicial.</p>
                <CButton color="primary" onClick={handleNewNotification}>
                    Crear primera notificación
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
                                    Gestión de Notificaciones Judiciales
                                </h4>
                                <CButton color="primary" onClick={handleNewNotification}>
                                    <CIcon icon={cilPlus} className="me-2" />
                                    Nueva Notificación
                                </CButton>
                            </div>
                        </CCardHeader>
                        <CCardBody>
                            {loading ? (
                                <LoadingState />
                            ) : (
                                <>
                                    <div className="mb-3 text-muted">
                                        Mostrando {data.length} notificación(es) judicial(es)
                                    </div>
                                    
                                    {data.length > 0 ? (
                                        <CTable hover responsive>
                                            <CTableHead>
                                                <CTableRow>
                                                    <CTableHeaderCell>N° de Caso</CTableHeaderCell>
                                                    <CTableHeaderCell>Título del Caso</CTableHeaderCell>
                                                    <CTableHeaderCell>Juez</CTableHeaderCell>
                                                    <CTableHeaderCell>Fecha de Audiencia</CTableHeaderCell>
                                                    <CTableHeaderCell>Fecha de Juicio</CTableHeaderCell>
                                                    <CTableHeaderCell>Participantes</CTableHeaderCell>
                                                    <CTableHeaderCell>Prioridad</CTableHeaderCell>
                                                    <CTableHeaderCell>Estado</CTableHeaderCell>
                                                    <CTableHeaderCell style={{ width: '120px' }}>Acciones</CTableHeaderCell>
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
                                                            {notification.judge_name || 'No asignado'}
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
                                                                    color="primary" 
                                                                    variant="outline"
                                                                    onClick={() => handleEdit(notification)}
                                                                    title="Editar notificación"
                                                                >
                                                                    <CIcon icon={cilPencil} />
                                                                </CButton>
                                                                <CButton 
                                                                    size="sm" 
                                                                    color="danger" 
                                                                    variant="outline"
                                                                    onClick={() => handleDelete(notification.id)}
                                                                    title="Eliminar notificación"
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
        </CContainer>
    )
}

export default Notifications