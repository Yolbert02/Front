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
    CCardBody,
    CSpinner,
    CAlert
} from '@coreui/react'
import { colorbutton } from 'src/styles/darkModeStyles'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash } from '@coreui/icons'
import { getFuncionaries, getCitizens } from 'src/services/assignments'
import { CRIME_TYPES } from 'src/constants/crimes'
import { COURTS } from 'src/constants/courts'

const AssignmentForm = ({ visible, onClose, onSave, initial = null }) => {
    const [caseTitle, setCaseTitle] = useState('')
    const [caseDescription, setCaseDescription] = useState('')
    const [judgeId, setJudgeId] = useState('')
    const [court, setCourt] = useState('')
    const [hearingDate, setHearingDate] = useState('')
    const [hearingTime, setHearingTime] = useState('09:00')
    const [trialDate, setTrialDate] = useState('')
    const [trialTime, setTrialTime] = useState('10:00')
    const [location, setLocation] = useState('')
    const [status, setStatus] = useState('scheduled')
    const [priority, setPriority] = useState('medium')

    const [officials, setOfficials] = useState([])
    const [funcionaries, setFuncionaries] = useState([])
    const [witnesses, setWitnesses] = useState([])
    const [jury, setJury] = useState([])

    const [availableOfficials, setAvailableOfficials] = useState([])
    const [availableFuncionaries, setAvailableFuncionaries] = useState([])
    const [availableCitizens, setAvailableCitizens] = useState([])

    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState({})

    const [step, setStep] = useState(1)

    useEffect(() => {
        if (visible) {
            setStep(1)
            loadUsers()

            if (initial) {
                setCaseTitle(initial.case_title || '')
                setCaseDescription(initial.case_description || '')
                setJudgeId(initial.judge_id || '')
                setCourt(initial.court || '')
                setHearingDate(initial.hearing_date || '')
                setHearingTime(initial.hearing_time || '09:00')
                setTrialDate(initial.trial_date || '')
                setTrialTime(initial.trial_time || '10:00')
                setLocation(initial.location || '')
                setStatus(initial.status || 'scheduled')
                setPriority(initial.priority || 'medium')
                setOfficials(initial.officials || [])
                setFuncionaries(initial.funcionaries || [])
                setWitnesses(initial.witnesses || [])
                setJury(initial.jury || [])
            } else {
                resetForm()
            }
        }
    }, [visible, initial])

    const today = new Date().toISOString().split('T')[0]

    const validateStep = (currentStep) => {
        const newErrors = {}

        if (currentStep === 1) {
            if (!caseTitle.trim())
                newErrors.caseTitle = 'El título del caso (delito) es obligatorio'

            if (!caseDescription.trim())
                newErrors.caseDescription = 'La descripción del caso es obligatoria'
            else if (caseDescription.trim().length < 10)
                newErrors.caseDescription = 'La descripción debe tener al menos 10 caracteres'

            if (!judgeId)
                newErrors.judgeId = 'Se debe asignar un juez al caso'
        }

        if (currentStep === 2) {
            if (!hearingDate)
                newErrors.hearingDate = 'La fecha de la audiencia es obligatoria'
            else if (hearingDate < today)
                newErrors.hearingDate = 'La fecha de la audiencia no puede ser en el pasado'

            if (trialDate && trialDate < today)
                newErrors.trialDate = 'La fecha del juicio no puede ser en el pasado'

            if (hearingDate && trialDate && trialDate < hearingDate)
                newErrors.trialDate = 'La fecha del juicio debe ser posterior a la fecha de la audiencia'
        }

        if (currentStep === 3) {
            // Check for unselected officials
            const unselectedOfficials = officials.filter(o => !o.user_id)
            if (unselectedOfficials.length > 0)
                newErrors.officials = 'Todos los oficiales añadidos deben tener un usuario seleccionado'

            const unselectedFuncionaries = funcionaries.filter(f => !f.user_id)
            if (unselectedFuncionaries.length > 0)
                newErrors.funcionaries = 'Todos los funcionarios añadidos deben tener un usuario seleccionado'

            const unselectedWitnesses = witnesses.filter(w => !w.user_id)
            if (unselectedWitnesses.length > 0)
                newErrors.witnesses = 'Todos los testigos añadidos deben tener un usuario seleccionado'

            const unselectedJury = jury.filter(j => !j.user_id)
            if (unselectedJury.length > 0)
                newErrors.jury = 'Todos los miembros del jurado añadidos deben tener un usuario seleccionado'

            // Check for duplicate participants
            const allOfficialIds = officials.map(o => o.user_id).filter(Boolean)
            if (new Set(allOfficialIds).size !== allOfficialIds.length)
                newErrors.officialsDuplicate = 'Se detectaron oficiales duplicados — cada oficial debe ser único'

            const allWitnessIds = witnesses.map(w => w.user_id).filter(Boolean)
            const allJuryIds = jury.map(j => j.user_id).filter(Boolean)
            if (new Set(allJuryIds).size !== allJuryIds.length)
                newErrors.juryDuplicate = 'Se detectaron miembros del jurado duplicados'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = (e) => {
        if (e) e.preventDefault()
        if (validateStep(step)) {
            setStep(step + 1)
        }
    }

    const handleBack = (e) => {
        if (e) e.preventDefault()
        setErrors({})
        setStep(step - 1)
    }

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
        setStatus('scheduled')
        setPriority('medium')
        setOfficials([])
        setFuncionaries([])
        setWitnesses([])
        setJury([])
    }

    const loadUsers = async () => {
        setLoading(true)
        try {
            const [officials, citizens] = await Promise.all([
                getFuncionaries(),
                getCitizens()
            ])

            setAvailableOfficials(officials.filter(u => u.role?.toLowerCase() === 'officer' || u.role?.toLowerCase() === 'oficial'))
            setAvailableFuncionaries(officials.filter(u => u.role?.toLowerCase() === 'functionary' || u.role?.toLowerCase() === 'funcionario'))
            setAvailableCitizens(citizens)

        } catch (error) {
            console.error('Error loading users:', error)
        } finally {
            setLoading(false)
        }
    }

    const addOfficial = () => {
        setOfficials([...officials, {
            user_id: '',
            name: '',
            role: 'Lawyer'
        }])
    }

    const addFuncionary = () => {
        setFuncionaries([...funcionaries, { user_id: '', name: '', role: 'Clerk' }])
    }

    const addWitness = () => {
        setWitnesses([...witnesses, { user_id: '', name: '', role: 'Witness' }])
    }

    const addJury = () => {
        setJury([...jury, { user_id: '', name: '', role: 'Juror' }])
    }

    const updateOfficial = (index, field, value) => {
        const updated = [...officials]
        updated[index][field] = value

        if (field === 'user_id' && value) {
            const selectedUser = availableOfficials.find(u => u.id === value)
            if (selectedUser) {
                updated[index].name = `${selectedUser.first_name} ${selectedUser.last_name}`
            }
        }

        setOfficials(updated)
    }

    const updateFuncionary = (index, field, value) => {
        const updated = [...funcionaries]
        updated[index][field] = value

        if (field === 'user_id' && value) {
            const selectedUser = availableFuncionaries.find(u => u.id === value)
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
            const selectedUser = availableCitizens.find(u => u.id === value)
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
            const selectedUser = availableCitizens.find(u => u.id === value)
            if (selectedUser) {
                updated[index].name = `${selectedUser.first_name} ${selectedUser.last_name}`
            }
        }

        setJury(updated)
    }

    const removeOfficial = (index) => {
        setOfficials(officials.filter((_, i) => i !== index))
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!validateStep(3)) {
            return
        }

        setSaving(true)

        try {
            const selectedJudge = availableOfficials.find(j => j.id === judgeId)
            const judgeName = selectedJudge ? `${selectedJudge.first_name} ${selectedJudge.last_name}` : ''

            const payload = {
                case_title: caseTitle.trim(),
                case_description: caseDescription.trim(),
                judge_id: judgeId || null,
                judge_name: judgeName,
                court: court.trim(),
                hearing_date: hearingDate,
                hearing_time: hearingTime,
                trial_date: trialDate,
                trial_time: trialTime,
                location: location.trim(),
                status,
                priority,
                officials: officials.filter(f => f.user_id).map(f => f.user_id),
                funcionaries: funcionaries.filter(f => f.user_id).map(f => f.user_id),
                witnesses: witnesses.filter(w => w.user_id).map(w => w.user_id),
                jury: jury.filter(j => j.user_id).map(j => j.user_id)
            }

            await onSave(payload)
            onClose()
        } catch (error) {
            console.error('Error saving assignment:', error)
        } finally {
            setSaving(false)
        }
    }

    const renderOfficials = () => {
        return officials.map((official, index) => (
            <CRow key={index} className="g-3 mb-3 align-items-end">
                <CCol md={5}>
                    <CFormSelect
                        label="Oficial (Oficial)"
                        value={official.user_id}
                        onChange={(e) => updateOfficial(index, 'user_id', e.target.value)}
                    >
                        <option value="">Seleccionar oficial</option>
                        {availableOfficials.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.first_name} {user.last_name} - {user.dni}
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={5}>
                    <CFormSelect
                        label="Rol"
                        value={official.role}
                        onChange={(e) => updateOfficial(index, 'role', e.target.value)}
                    >
                        <option value="Detective">Detective</option>
                        <option value="Agent">Agente</option>
                        <option value="Investigator">Investigador</option>
                        <option value="Supervisor">Supervisor</option>
                    </CFormSelect>
                </CCol>
                <CCol md={2}>
                    <CButton
                        color="danger"
                        variant="outline"
                        onClick={() => removeOfficial(index)}
                    >
                        <CIcon icon={cilTrash} />
                    </CButton>
                </CCol>
            </CRow>
        ))
    }

    const renderFuncionaries = () => {
        return funcionaries.map((f, index) => (
            <CRow key={index} className="g-3 mb-3 align-items-end">
                <CCol md={5}>
                    <CFormSelect
                        label="Funcionario Judicial"
                        value={f.user_id}
                        onChange={(e) => updateFuncionary(index, 'user_id', e.target.value)}
                    >
                        <option value="">Seleccionar funcionario</option>
                        {availableFuncionaries.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.first_name} {user.last_name} - {user.dni}
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={5}>
                    <CFormSelect
                        label="Rol"
                        value={f.role}
                        onChange={(e) => updateFuncionary(index, 'role', e.target.value)}
                    >
                        <option value="Clerk">Secretario</option>
                        <option value="Court Reporter">Relator</option>
                        <option value="Bailiff">Alguacil</option>
                        <option value="Secretary">Secretaria</option>
                        <option value="Lawyer">Abogado</option>
                        <option value="Prosecutor">Fiscal</option>
                        <option value="Defender">Defensor</option>
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
                                {user.first_name} {user.last_name} - {user.dni}
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={5}>
                    <CFormInput
                        label="Rol"
                        value={witness.role}
                        onChange={(e) => updateWitness(index, 'role', e.target.value)}
                        placeholder="Testigo presencial, perito..."
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
                                {user.first_name} {user.last_name} - {user.dni}
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
        <CModal size="lg" visible={visible} onClose={onClose} backdrop="static" keyboard={false}>
            <CModalHeader>
                <CModalTitle>
                    {initial ? 'Editar Asignación' : 'Nueva Asignación'} - Paso {step} de 3
                </CModalTitle>
            </CModalHeader>
            <CForm onSubmit={handleSubmit}>
                <CModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>

                    {Object.keys(errors).length > 0 && (
                        <CAlert color="danger" className="mb-3 py-2">
                            <ul className="mb-0 small">
                                {Object.values(errors).map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </CAlert>
                    )}

                    {/* SECCIÓN 1: INFORMACIÓN DEL CASO */}
                    {step === 1 && (
                        <>
                            <h6 className="mb-3 text-primary">Información del Caso</h6>
                            <CRow className="g-3">
                                <CCol md={12}>
                                    <CFormSelect
                                        className="tour-assignment-form-title"
                                        label="Delito Asignado *"
                                        value={caseTitle}
                                        onChange={(e) => setCaseTitle(e.target.value)}
                                        invalid={!!errors.caseTitle}
                                        feedback={errors.caseTitle}
                                        required
                                    >
                                        <option value="">Seleccione un delito...</option>
                                        {CRIME_TYPES.map(crime => (
                                            <option key={crime.id} value={crime.title}>
                                                {crime.title}
                                            </option>
                                        ))}
                                    </CFormSelect>

                                    {caseTitle && CRIME_TYPES.find(c => c.title === caseTitle) && (
                                        <div className="mt-2 p-2 bg-light rounded text-muted small">
                                            <strong>Descripción del delito: </strong>
                                            {CRIME_TYPES.find(c => c.title === caseTitle).description}
                                        </div>
                                    )}
                                </CCol>
                            </CRow>

                            <div className="mt-3">
                                <CFormTextarea
                                    className="tour-assignment-form-description"
                                    label="Descripción del Caso *"
                                    placeholder="Descripción detallada del caso..."
                                    rows="3"
                                    value={caseDescription}
                                    onChange={(e) => setCaseDescription(e.target.value)}
                                    invalid={!!errors.caseDescription}
                                    feedback={errors.caseDescription}
                                    required
                                />
                            </div>

                            <CRow className="g-3 mt-2">
                                <CCol md={6}>
                                    <CFormSelect
                                        className="tour-assignment-form-court"
                                        label="Tribunal"
                                        value={court}
                                        onChange={(e) => {
                                            const selectedCourt = e.target.value;
                                            setCourt(selectedCourt);
                                            const courtData = COURTS.find(c => c.name === selectedCourt);
                                            if (courtData) {
                                                setLocation(courtData.location);
                                            } else {
                                                setLocation('');
                                            }
                                        }}
                                    >
                                        <option value="">Seleccione un tribunal...</option>
                                        {COURTS.map(c => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                    </CFormSelect>
                                </CCol>
                                <CCol md={6}>
                                    <CFormInput
                                        className="tour-assignment-form-location"
                                        label="Ubicación"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        readOnly
                                        style={{ backgroundColor: location ? '#e8f5e9' : '' }}
                                    />
                                </CCol>
                            </CRow>

                            <h6 className="mb-3 mt-4 text-primary">Juez Principal</h6>
                            <CRow className="g-3">
                                <CCol md={12}>
                                    <CFormSelect
                                        className="tour-assignment-form-judge"
                                        label="Juez Asignado *"
                                        value={judgeId}
                                        onChange={(e) => setJudgeId(e.target.value)}
                                        disabled={loading}
                                        invalid={!!errors.judgeId}
                                        feedback={errors.judgeId}
                                    >
                                        <option value="">Seleccione un juez</option>
                                        {availableOfficials.map(official => (
                                            <option key={official.id} value={official.id}>
                                                {official.first_name} {official.last_name} - {official.dni}
                                            </option>
                                        ))}
                                    </CFormSelect>
                                </CCol>
                            </CRow>
                        </>
                    )}

                    {/* SECCIÓN 2: FECHAS Y ESTADO */}
                    {step === 2 && (
                        <>
                            <h6 className="mb-3 text-primary">Fechas Importantes</h6>
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormInput
                                        className="tour-assignment-form-hearing-date"
                                        label="Fecha de Audiencia *"
                                        type="date"
                                        value={hearingDate}
                                        min={today}
                                        onChange={(e) => setHearingDate(e.target.value)}
                                        invalid={!!errors.hearingDate}
                                        feedback={errors.hearingDate}
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormInput
                                        className="tour-assignment-form-hearing-time"
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
                                        className="tour-assignment-form-trial-date"
                                        label="Fecha de Juicio"
                                        type="date"
                                        value={trialDate}
                                        min={hearingDate || today}
                                        onChange={(e) => setTrialDate(e.target.value)}
                                        invalid={!!errors.trialDate}
                                        feedback={errors.trialDate}
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormInput
                                        className="tour-assignment-form-trial-time"
                                        label="Hora de Juicio"
                                        type="time"
                                        value={trialTime}
                                        onChange={(e) => setTrialTime(e.target.value)}
                                    />
                                </CCol>
                            </CRow>

                            <h6 className="mb-3 mt-4 text-primary">Estado y Prioridad</h6>
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormSelect
                                        className="tour-assignment-form-status"
                                        label="Estado"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="scheduled">Programada</option>
                                        <option value="in_progress">En Progreso</option>
                                        <option value="completed">Completada</option>
                                        <option value="cancelled">Cancelada</option>
                                        <option value="postponed">Pospuesta</option>
                                    </CFormSelect>
                                </CCol>
                                <CCol md={6}>
                                    <CFormSelect
                                        className="tour-assignment-form-priority"
                                        label="Prioridad"
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                    >
                                        <option value="high">Alta</option>
                                        <option value="medium">Media</option>
                                        <option value="low">Baja</option>
                                    </CFormSelect>
                                </CCol>
                            </CRow>
                        </>
                    )}

                    {/* SECCIÓN 3: PARTICIPANTES */}
                    {step === 3 && (
                        <>
                            <h6 className="mb-3 text-primary">Oficiales del Caso (Policía/Investigadores)</h6>
                            <CCard className="tour-assignment-form-officials mb-3">
                                <CCardBody>
                                    {renderOfficials()}
                                    <CButton color="primary" variant="outline" onClick={addOfficial}>
                                        <CIcon icon={cilPlus} className="me-2" />
                                        Añadir Oficial
                                    </CButton>
                                </CCardBody>
                            </CCard>

                            <h6 className="mb-3 mt-4 text-primary">Funcionarios Judiciales</h6>
                            <CCard className="tour-assignment-form-funcionaries mb-3">
                                <CCardBody>
                                    {renderFuncionaries()}
                                    <CButton color="primary" variant="outline" onClick={addFuncionary}>
                                        <CIcon icon={cilPlus} className="me-2" />
                                        Añadir Funcionario
                                    </CButton>
                                </CCardBody>
                            </CCard>

                            <h6 className="mb-3 mt-4 text-primary">Testigos</h6>
                            <CCard className="tour-assignment-form-witnesses mb-3">
                                <CCardBody>
                                    {renderWitnesses()}
                                    <CButton color="primary" variant="outline" onClick={addWitness}>
                                        <CIcon icon={cilPlus} className="me-2" />
                                        Añadir Testigo
                                    </CButton>
                                </CCardBody>
                            </CCard>

                            <h6 className="mb-3 mt-4 text-primary">Miembros del Jurado</h6>
                            <CCard className="tour-assignment-form-jury mb-3">
                                <CCardBody>
                                    {renderJury()}
                                    <CButton color="primary" variant="outline" onClick={addJury}>
                                        <CIcon icon={cilPlus} className="me-2" />
                                        Añadir Miembro
                                    </CButton>
                                </CCardBody>
                            </CCard>
                        </>
                    )}

                    <div className="mt-3">
                        <small className="text-muted">* Campos obligatorios</small>
                    </div>
                </CModalBody>
                <CModalFooter>
                    {step > 1 && (
                        <CButton type="button" color="secondary" onClick={handleBack}>
                            Atrás
                        </CButton>
                    )}
                    {step < 3 ? (
                        <CButton type="button" color="primary colorbutton" style={colorbutton} onClick={handleNext} disabled={saving}>
                            Siguiente
                        </CButton>
                    ) : (
                        <CButton type="submit" color="success" disabled={saving}>
                            {saving ? (
                                <>
                                    <CSpinner size="sm" className="me-2" />
                                    Guardando...
                                </>
                            ) : (
                                <>{initial ? 'Actualizar' : 'Crear'} Asignación</>
                            )}
                        </CButton>
                    )}
                    <CButton type="button" color="light" onClick={onClose} className="ms-auto">
                        Cancelar
                    </CButton>
                </CModalFooter>
            </CForm>
        </CModal>
    )
}

export default AssignmentForm