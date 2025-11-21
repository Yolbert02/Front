import React, { useState, useEffect } from 'react'
import { 
    CModal, 
    CModalHeader, 
    CModalTitle, 
    CModalBody, 
    CForm, 
    CFormInput, 
    CModalFooter, 
    CButton, 
    CFormSelect, 
    CRow, 
    CCol,
    CFormTextarea,
    CCard,
    CCardBody
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash } from '@coreui/icons'
import { getFuncionaries, getCitizens } from 'src/services/notifications'

const NotificationForm = ({ visible, onClose, onSave, initial = null }) => {
    const [caseTitle, setCaseTitle] = useState('')
    const [caseDescription, setCaseDescription] = useState('')
    const [judgeId, setJudgeId] = useState('')
    const [court, setCourt] = useState('')
    const [hearingDate, setHearingDate] = useState('')
    const [hearingTime, setHearingTime] = useState('09:00')
    const [trialDate, setTrialDate] = useState('')
    const [trialTime, setTrialTime] = useState('10:00')
    const [location, setLocation] = useState('')
    const [status, setStatus] = useState('programado')
    const [priority, setPriority] = useState('media')
    
    const [funcionaries, setFuncionaries] = useState([])
    const [witnesses, setWitnesses] = useState([])
    const [jury, setJury] = useState([])
    
    // Listas de usuarios disponibles
    const [availableFuncionaries, setAvailableFuncionaries] = useState([])
    const [availableCitizens, setAvailableCitizens] = useState([])
    
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (visible) {
            loadUsers()
            
            if (initial) {
                // Edit mode
                setCaseTitle(initial.case_title || '')
                setCaseDescription(initial.case_description || '')
                setJudgeId(initial.judge_id || '')
                setCourt(initial.court || '')
                setHearingDate(initial.hearing_date || '')
                setHearingTime(initial.hearing_time || '09:00')
                setTrialDate(initial.trial_date || '')
                setTrialTime(initial.trial_time || '10:00')
                setLocation(initial.location || '')
                setStatus(initial.status || 'programado')
                setPriority(initial.priority || 'media')
                setFuncionaries(initial.funcionaries || [])
                setWitnesses(initial.witnesses || [])
                setJury(initial.jury || [])
            } else {
                resetForm()
            }
        }
    }, [visible, initial])

    const resetForm = () => {
        setCaseTitle('')
        setCaseDescription('')
        setJudgeId('')
        setCourt('')
        setHearingDate('')
        setHearingTime('09:00')
        setTrialDate('')
        setTrialTime('10:00')
        setLocation('')
        setStatus('programado')
        setPriority('media')
        setFuncionaries([])
        setWitnesses([])
        setJury([])
    }

    const loadUsers = async () => {
        setLoading(true)
        try {
            const [funcionaries, citizens] = await Promise.all([
                getFuncionaries(),
                getCitizens()
            ])
            
            setAvailableFuncionaries(funcionaries)
            setAvailableCitizens(citizens)
            
        } catch (error) {
            console.error('Error loading users:', error)
        } finally {
            setLoading(false)
        }
    }

    const addFuncionary = () => {
        setFuncionaries([...funcionaries, { 
            user_id: '', 
            name: '', 
            role: 'Abogado'
        }])
    }

    const addWitness = () => {
        setWitnesses([...witnesses, { user_id: '', name: '', role: 'Testigo' }])
    }

    const addJury = () => {
        setJury([...jury, { user_id: '', name: '', role: 'Jurado' }])
    }

    const updateFuncionary = (index, field, value) => {
        const updated = [...funcionaries]
        updated[index][field] = value
        
        if (field === 'user_id' && value) {
            const selectedUser = availableFuncionaries.find(u => u.id === parseInt(value))
            if (selectedUser) {
                updated[index].name = `${selectedUser.first_name} ${selectedUser.last_name}`
            }
        }
        
        setFuncionaries(updated)
    }

    const updateWitness = (index, field, value) => {
        const updated = [...witnesses]
        updated[index][field] = value
        
        if (field === 'user_id' && value) {
            const selectedUser = availableCitizens.find(u => u.id === parseInt(value))
            if (selectedUser) {
                updated[index].name = `${selectedUser.first_name} ${selectedUser.last_name}`
            }
        }
        
        setWitnesses(updated)
    }

    const updateJury = (index, field, value) => {
        const updated = [...jury]
        updated[index][field] = value
        
        if (field === 'user_id' && value) {
            const selectedUser = availableCitizens.find(u => u.id === parseInt(value))
            if (selectedUser) {
                updated[index].name = `${selectedUser.first_name} ${selectedUser.last_name}`
            }
        }
        
        setJury(updated)
    }

    const removeFuncionary = (index) => {
        setFuncionaries(funcionaries.filter((_, i) => i !== index))
    }

    const removeWitness = (index) => {
        setWitnesses(witnesses.filter((_, i) => i !== index))
    }

    const removeJury = (index) => {
        setJury(jury.filter((_, i) => i !== index))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        
        if (!caseTitle.trim() || !caseDescription.trim()) {
            alert('El título y descripción del caso son requeridos')
            return
        }

        // Encontrar el nombre del juez seleccionado
        const selectedJudge = availableFuncionaries.find(j => j.id === parseInt(judgeId))
        const judgeName = selectedJudge ? `${selectedJudge.first_name} ${selectedJudge.last_name}` : ''

        const payload = { 
            case_title: caseTitle.trim(),
            case_description: caseDescription.trim(),
            judge_id: judgeId ? parseInt(judgeId) : null,
            judge_name: judgeName,
            court: court.trim(),
            hearing_date: hearingDate,
            hearing_time: hearingTime,
            trial_date: trialDate,
            trial_time: trialTime,
            location: location.trim(),
            status,
            priority,
            funcionaries: funcionaries.filter(f => f.user_id && f.name),
            witnesses: witnesses.filter(w => w.user_id && w.name),
            jury: jury.filter(j => j.user_id && j.name)
        }
        
        onSave(payload)
    }

    const renderFuncionaries = () => {
        return funcionaries.map((funcionary, index) => (
            <CRow key={index} className="g-3 mb-3 align-items-end">
                <CCol md={5}>
                    <CFormSelect 
                        label="Funcionario"
                        value={funcionary.user_id}
                        onChange={(e) => updateFuncionary(index, 'user_id', e.target.value)}
                    >
                        <option value="">Seleccionar funcionario</option>
                        {availableFuncionaries.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.first_name} {user.last_name} - {user.document}
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={5}>
                    <CFormSelect 
                        label="Rol"
                        value={funcionary.role}
                        onChange={(e) => updateFuncionary(index, 'role', e.target.value)}
                    >
                        <option value="Abogado">Abogado</option>
                        <option value="Fiscal">Fiscal</option>
                        <option value="Defensor">Defensor</option>
                        <option value="Juez">Juez</option>
                    </CFormSelect>
                </CCol>
                <CCol md={2}>
                    <CButton 
                        color="danger" 
                        variant="outline"
                        onClick={() => removeFuncionary(index)}
                    >
                        <CIcon icon={cilTrash} />
                    </CButton>
                </CCol>
            </CRow>
        ))
    }

    const renderWitnesses = () => {
        return witnesses.map((witness, index) => (
            <CRow key={index} className="g-3 mb-3 align-items-end">
                <CCol md={5}>
                    <CFormSelect 
                        label="Testigo"
                        value={witness.user_id}
                        onChange={(e) => updateWitness(index, 'user_id', e.target.value)}
                    >
                        <option value="">Seleccionar testigo</option>
                        {availableCitizens.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.first_name} {user.last_name} - {user.document}
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={5}>
                    <CFormInput 
                        label="Rol"
                        value={witness.role}
                        onChange={(e) => updateWitness(index, 'role', e.target.value)}
                        placeholder="Testigo ocular, Testigo técnico..."
                    />
                </CCol>
                <CCol md={2}>
                    <CButton 
                        color="danger" 
                        variant="outline"
                        onClick={() => removeWitness(index)}
                    >
                        <CIcon icon={cilTrash} />
                    </CButton>
                </CCol>
            </CRow>
        ))
    }

    const renderJury = () => {
        return jury.map((juryMember, index) => (
            <CRow key={index} className="g-3 mb-3 align-items-end">
                <CCol md={5}>
                    <CFormSelect 
                        label="Miembro del Jurado"
                        value={juryMember.user_id}
                        onChange={(e) => updateJury(index, 'user_id', e.target.value)}
                    >
                        <option value="">Seleccionar miembro</option>
                        {availableCitizens.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.first_name} {user.last_name} - {user.document}
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={5}>
                    <CFormInput 
                        label="Rol"
                        value={juryMember.role}
                        onChange={(e) => updateJury(index, 'role', e.target.value)}
                        placeholder="Jurado"
                    />
                </CCol>
                <CCol md={2}>
                    <CButton 
                        color="danger" 
                        variant="outline"
                        onClick={() => removeJury(index)}
                    >
                        <CIcon icon={cilTrash} />
                    </CButton>
                </CCol>
            </CRow>
        ))
    }

    return (
        <CModal size="xl" visible={visible} onClose={onClose}>
            <CModalHeader>
                <CModalTitle>{initial ? 'Editar Notificación Judicial' : 'Nueva Notificación Judicial'}</CModalTitle>
            </CModalHeader>
            <CForm onSubmit={handleSubmit}>
                <CModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {/* Información del Caso */}
                    <h6 className="mb-3 text-primary">Información del Caso</h6>
                    <CRow className="g-3">
                        <CCol md={12}>
                            <CFormInput 
                                label="Título del Caso *" 
                                placeholder="Robo en vía pública"
                                value={caseTitle} 
                                onChange={(e) => setCaseTitle(e.target.value)}
                                required 
                            />
                        </CCol>
                    </CRow>

                    <div className="mt-3">
                        <CFormTextarea
                            label="Descripción del Caso *"
                            placeholder="Descripción detallada del caso..."
                            rows="3"
                            value={caseDescription}
                            onChange={(e) => setCaseDescription(e.target.value)}
                            required
                        />
                    </div>

                    <CRow className="g-3 mt-2">
                        <CCol md={6}>
                            <CFormInput 
                                label="Juzgado"
                                placeholder="Juzgado Primero Penal"
                                value={court}
                                onChange={(e) => setCourt(e.target.value)}
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormInput 
                                label="Ubicación"
                                placeholder="Palacio de Justicia, Sala 4A"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </CCol>
                    </CRow>

                    {/* Fechas Importantes */}
                    <h6 className="mb-3 mt-4 text-primary">Fechas Importantes</h6>
                    <CRow className="g-3">
                        <CCol md={6}>
                            <CFormInput 
                                label="Fecha de Audiencia"
                                type="date"
                                value={hearingDate}
                                onChange={(e) => setHearingDate(e.target.value)}
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormInput 
                                label="Hora de Audiencia"
                                type="time"
                                value={hearingTime}
                                onChange={(e) => setHearingTime(e.target.value)}
                            />
                        </CCol>
                    </CRow>

                    <CRow className="g-3 mt-2">
                        <CCol md={6}>
                            <CFormInput 
                                label="Fecha de Juicio"
                                type="date"
                                value={trialDate}
                                onChange={(e) => setTrialDate(e.target.value)}
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormInput 
                                label="Hora de Juicio"
                                type="time"
                                value={trialTime}
                                onChange={(e) => setTrialTime(e.target.value)}
                            />
                        </CCol>
                    </CRow>

                    {/* Juez Principal */}
                    <h6 className="mb-3 mt-4 text-primary">Juez Principal</h6>
                    <CRow className="g-3">
                        <CCol md={12}>
                            <CFormSelect 
                                label="Juez Asignado"
                                value={judgeId}
                                onChange={(e) => setJudgeId(e.target.value)}
                                disabled={loading}
                            >
                                <option value="">Seleccionar un juez</option>
                                {availableFuncionaries.map(funcionary => (
                                    <option key={funcionary.id} value={funcionary.id}>
                                        {funcionary.first_name} {funcionary.last_name} - {funcionary.document}
                                    </option>
                                ))}
                            </CFormSelect>
                        </CCol>
                    </CRow>

                    {/* Funcionarios del Caso */}
                    <h6 className="mb-3 mt-4 text-primary">Funcionarios del Caso</h6>
                    <CCard className="mb-3">
                        <CCardBody>
                            {renderFuncionaries()}
                            <CButton color="primary" variant="outline" onClick={addFuncionary}>
                                <CIcon icon={cilPlus} className="me-2" />
                                Agregar Funcionario
                            </CButton>
                        </CCardBody>
                    </CCard>

                    {/* Testigos */}
                    <h6 className="mb-3 mt-4 text-primary">Testigos</h6>
                    <CCard className="mb-3">
                        <CCardBody>
                            {renderWitnesses()}
                            <CButton color="primary" variant="outline" onClick={addWitness}>
                                <CIcon icon={cilPlus} className="me-2" />
                                Agregar Testigo
                            </CButton>
                        </CCardBody>
                    </CCard>

                    {/* Jurado */}
                    <h6 className="mb-3 mt-4 text-primary">Miembros del Jurado</h6>
                    <CCard className="mb-3">
                        <CCardBody>
                            {renderJury()}
                            <CButton color="primary" variant="outline" onClick={addJury}>
                                <CIcon icon={cilPlus} className="me-2" />
                                Agregar Miembro
                            </CButton>
                        </CCardBody>
                    </CCard>

                    {/* Estado y Prioridad */}
                    <h6 className="mb-3 mt-4 text-primary">Estado y Prioridad</h6>
                    <CRow className="g-3">
                        <CCol md={6}>
                            <CFormSelect 
                                label="Estado"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="programado">Programado</option>
                                <option value="en_curso">En Curso</option>
                                <option value="concluido">Concluido</option>
                                <option value="cancelado">Cancelado</option>
                                <option value="aplazado">Aplazado</option>
                            </CFormSelect>
                        </CCol>
                        <CCol md={6}>
                            <CFormSelect 
                                label="Prioridad"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option value="alta">Alta</option>
                                <option value="media">Media</option>
                                <option value="baja">Baja</option>
                            </CFormSelect>
                        </CCol>
                    </CRow>

                    <div className="mt-3">
                        <small className="text-muted">* Campos requeridos</small>
                    </div>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={onClose}>Cancelar</CButton>
                    <CButton type="submit" color="primary">
                        {initial ? 'Actualizar' : 'Crear'} Notificación
                    </CButton>
                </CModalFooter>
            </CForm>
        </CModal>
    )
}

export default NotificationForm