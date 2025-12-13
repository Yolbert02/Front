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
    CSpinner
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
    const [status, setStatus] = useState('scheduled')
    const [priority, setPriority] = useState('medium')

    const [officials, setOfficials] = useState([])
    const [witnesses, setWitnesses] = useState([])
    const [jury, setJury] = useState([])

    // Available users lists
    const [availableOfficials, setAvailableOfficials] = useState([])
    const [availableCitizens, setAvailableCitizens] = useState([])

    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

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
                setWitnesses(initial.witnesses || [])
                setJury(initial.jury || [])
            } else {
                resetForm()
            }
        }
    }, [visible, initial])

    const validateStep = (currentStep) => {
        if (currentStep === 1) {
            if (!caseTitle.trim() || !caseDescription.trim()) {
                return false
            }
            return true
        }
        if (currentStep === 2) {
            // Optional: validate dates logic if needed
            return true
        }
        if (currentStep === 3) {
            return true
        }
        return true
    }

    const handleNext = (e) => {
        if (e) e.preventDefault()
        if (validateStep(step)) {
            setStep(step + 1)
        } else {
            // Optional feedback
        }
    }

    const handleBack = (e) => {
        if (e) e.preventDefault()
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

            setAvailableOfficials(officials)
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
            const selectedUser = availableOfficials.find(u => u.id === parseInt(value))
            if (selectedUser) {
                updated[index].name = `${selectedUser.first_name} ${selectedUser.last_name}`
            }
        }

        setOfficials(updated)
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

    const removeOfficial = (index) => {
        setOfficials(officials.filter((_, i) => i !== index))
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
            const selectedJudge = availableOfficials.find(j => j.id === parseInt(judgeId))
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
                officials: officials.filter(f => f.user_id && f.name),
                witnesses: witnesses.filter(w => w.user_id && w.name),
                jury: jury.filter(j => j.user_id && j.name)
            }

            await onSave(payload)
            onClose()
        } catch (error) {
            console.error('Error saving notification:', error)
        } finally {
            setSaving(false)
        }
    }

    const renderOfficials = () => {
        return officials.map((official, index) => (
            <CRow key={index} className="g-3 mb-3 align-items-end">
                <CCol md={5}>
                    <CFormSelect
                        label="Official"
                        value={official.user_id}
                        onChange={(e) => updateOfficial(index, 'user_id', e.target.value)}
                    >
                        <option value="">Select official</option>
                        {availableOfficials.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.first_name} {user.last_name} - {user.document}
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={5}>
                    <CFormSelect
                        label="Role"
                        value={official.role}
                        onChange={(e) => updateOfficial(index, 'role', e.target.value)}
                    >
                        <option value="Lawyer">Lawyer</option>
                        <option value="Prosecutor">Prosecutor</option>
                        <option value="Defender">Defender</option>
                        <option value="Judge">Judge</option>
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

    const renderWitnesses = () => {
        return witnesses.map((witness, index) => (
            <CRow key={index} className="g-3 mb-3 align-items-end">
                <CCol md={5}>
                    <CFormSelect
                        label="Witness"
                        value={witness.user_id}
                        onChange={(e) => updateWitness(index, 'user_id', e.target.value)}
                    >
                        <option value="">Select witness</option>
                        {availableCitizens.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.first_name} {user.last_name} - {user.document}
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={5}>
                    <CFormInput
                        label="Role"
                        value={witness.role}
                        onChange={(e) => updateWitness(index, 'role', e.target.value)}
                        placeholder="Eyewitness, Expert witness..."
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
                        label="Jury Member"
                        value={juryMember.user_id}
                        onChange={(e) => updateJury(index, 'user_id', e.target.value)}
                    >
                        <option value="">Select member</option>
                        {availableCitizens.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.first_name} {user.last_name} - {user.document}
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={5}>
                    <CFormInput
                        label="Role"
                        value={juryMember.role}
                        onChange={(e) => updateJury(index, 'role', e.target.value)}
                        placeholder="Juror"
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
        <CModal size="lg" visible={visible} onClose={onClose}>
            <CModalHeader>
                <CModalTitle>
                    {initial ? 'Edit Judicial Notification' : 'New Judicial Notification'} - Step {step} of 3
                </CModalTitle>
            </CModalHeader>
            <CForm onSubmit={handleSubmit}>
                <CModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>

                    {/* SECCIÓN 1: CASE INFORMATION */}
                    {step === 1 && (
                        <>
                            <h6 className="mb-3 text-primary">Case Information</h6>
                            <CRow className="g-3">
                                <CCol md={12}>
                                    <CFormInput
                                        label="Case Title *"
                                        placeholder="Robbery in public space"
                                        value={caseTitle}
                                        onChange={(e) => setCaseTitle(e.target.value)}
                                        required
                                    />
                                </CCol>
                            </CRow>

                            <div className="mt-3">
                                <CFormTextarea
                                    label="Case Description *"
                                    placeholder="Detailed description of the case..."
                                    rows="3"
                                    value={caseDescription}
                                    onChange={(e) => setCaseDescription(e.target.value)}
                                    required
                                />
                            </div>

                            <CRow className="g-3 mt-2">
                                <CCol md={6}>
                                    <CFormInput
                                        label="Court"
                                        placeholder="First Criminal Court"
                                        value={court}
                                        onChange={(e) => setCourt(e.target.value)}
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormInput
                                        label="Location"
                                        placeholder="Justice Palace, Room 4A"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                </CCol>
                            </CRow>

                            <h6 className="mb-3 mt-4 text-primary">Main Judge</h6>
                            <CRow className="g-3">
                                <CCol md={12}>
                                    <CFormSelect
                                        label="Assigned Judge"
                                        value={judgeId}
                                        onChange={(e) => setJudgeId(e.target.value)}
                                        disabled={loading}
                                    >
                                        <option value="">Select a judge</option>
                                        {availableOfficials.map(official => (
                                            <option key={official.id} value={official.id}>
                                                {official.first_name} {official.last_name} - {official.document}
                                            </option>
                                        ))}
                                    </CFormSelect>
                                </CCol>
                            </CRow>
                        </>
                    )}

                    {/* SECCIÓN 2: DATES AND STATUS */}
                    {step === 2 && (
                        <>
                            <h6 className="mb-3 text-primary">Important Dates</h6>
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormInput
                                        label="Hearing Date"
                                        type="date"
                                        value={hearingDate}
                                        onChange={(e) => setHearingDate(e.target.value)}
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormInput
                                        label="Hearing Time"
                                        type="time"
                                        value={hearingTime}
                                        onChange={(e) => setHearingTime(e.target.value)}
                                    />
                                </CCol>
                            </CRow>

                            <CRow className="g-3 mt-2">
                                <CCol md={6}>
                                    <CFormInput
                                        label="Trial Date"
                                        type="date"
                                        value={trialDate}
                                        onChange={(e) => setTrialDate(e.target.value)}
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormInput
                                        label="Trial Time"
                                        type="time"
                                        value={trialTime}
                                        onChange={(e) => setTrialTime(e.target.value)}
                                    />
                                </CCol>
                            </CRow>

                            <h6 className="mb-3 mt-4 text-primary">Status and Priority</h6>
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormSelect
                                        label="Status"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="scheduled">Scheduled</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="postponed">Postponed</option>
                                    </CFormSelect>
                                </CCol>
                                <CCol md={6}>
                                    <CFormSelect
                                        label="Priority"
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                    >
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </CFormSelect>
                                </CCol>
                            </CRow>
                        </>
                    )}

                    {/* SECCIÓN 3: PARTICIPANTS */}
                    {step === 3 && (
                        <>
                            <h6 className="mb-3 text-primary">Case Officials</h6>
                            <CCard className="mb-3">
                                <CCardBody>
                                    {renderOfficials()}
                                    <CButton color="primary" variant="outline" onClick={addOfficial}>
                                        <CIcon icon={cilPlus} className="me-2" />
                                        Add Official
                                    </CButton>
                                </CCardBody>
                            </CCard>

                            <h6 className="mb-3 mt-4 text-primary">Witnesses</h6>
                            <CCard className="mb-3">
                                <CCardBody>
                                    {renderWitnesses()}
                                    <CButton color="primary" variant="outline" onClick={addWitness}>
                                        <CIcon icon={cilPlus} className="me-2" />
                                        Add Witness
                                    </CButton>
                                </CCardBody>
                            </CCard>

                            <h6 className="mb-3 mt-4 text-primary">Jury Members</h6>
                            <CCard className="mb-3">
                                <CCardBody>
                                    {renderJury()}
                                    <CButton color="primary" variant="outline" onClick={addJury}>
                                        <CIcon icon={cilPlus} className="me-2" />
                                        Add Member
                                    </CButton>
                                </CCardBody>
                            </CCard>
                        </>
                    )}

                    <div className="mt-3">
                        <small className="text-muted">* Required fields</small>
                    </div>
                </CModalBody>
                <CModalFooter>
                    {step > 1 && (
                        <CButton type="button" color="secondary" onClick={handleBack}>
                            Back
                        </CButton>
                    )}
                    {step < 3 ? (
                        <CButton type="button" color="primary" onClick={handleNext} disabled={saving}>
                            Next
                        </CButton>
                    ) : (
                        <CButton type="submit" color="success" disabled={saving}>
                            {saving ? (
                                <>
                                    <CSpinner size="sm" className="me-2" />
                                    Saving...
                                </>
                            ) : (
                                <>{initial ? 'Update' : 'Create'} Notification</>
                            )}
                        </CButton>
                    )}
                    <CButton type="button" color="light" onClick={onClose} className="ms-auto">
                        Cancel
                    </CButton>
                </CModalFooter>
            </CForm>
        </CModal>
    )
}

export default NotificationForm