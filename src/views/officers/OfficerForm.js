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
    CSpinner
} from '@coreui/react'
import { colorbutton } from 'src/styles/darkModeStyles'

const OfficerForm = ({ visible, onClose, onSave, initial = null }) => {
    const [step, setStep] = useState(1)
    const [name, setName] = useState('')
    const [lastName, setLastName] = useState('')
    const [idNumber, setIdNumber] = useState('')
    const [unit, setUnit] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [rank, setRank] = useState('')
    const [status, setStatus] = useState('Active')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (visible) {
            setStep(1)
            if (initial) {
                console.log('Editing officer:', initial)
                setName(initial.name || '')
                setLastName(initial.lastName || '')
                setIdNumber(initial.idNumber || '')
                setUnit(initial.unit || '')
                setEmail(initial.email || '')
                setPhone(initial.phone || '')
                setRank(initial.rank || '')
                setStatus(initial.status || 'Active')
            } else {
                console.log('Creating new officer')
                setName('')
                setLastName('')
                setIdNumber('')
                setUnit('')
                setEmail('')
                setPhone('')
                setRank('')
                setStatus('Active')
            }
        }
    }, [visible, initial])

    const validateStep = (currentStep) => {
        if (currentStep === 1) {
            if (!name.trim() || !lastName.trim()) {
                return false
            }
            return true
        }
        if (currentStep === 2) {
            return true
        }
        if (currentStep === 3) {
            if (!unit.trim()) return false
            return true
        }
        return true
    }

    const handleNext = (e) => {
        if (e) e.preventDefault()
        if (validateStep(step)) {
            setStep(step + 1)
        } else {
        }
    }

    const handleBack = (e) => {
        if (e) e.preventDefault()
        setStep(step - 1)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!validateStep(3)) {
            return
        }

        setSaving(true)

        try {
            const payload = {
                name: name.trim(),
                lastName: lastName.trim(),
                idNumber: idNumber.trim(),
                unit: unit.trim(),
                email: email.trim(),
                phone: phone.trim(),
                rank: rank.trim(),
                status
            }

            await onSave(payload)
            onClose()
        } catch (error) {
            console.error('Error saving officer:', error)
        } finally {
            setSaving(false)
        }
    }

    const rankOptions = [
        'Pending Assignment',
        'Cadet',
        'Officer',
        'Detective',
        'Sergeant',
        'Lieutenant',
        'Captain',
        'Commander',
        'Deputy Chief',
        'Chief'
    ]

    return (
        <CModal size="lg" visible={visible} onClose={onClose}>
            <CModalHeader>
                <CModalTitle>{initial ? 'Edit Officer' : 'New Officer'}</CModalTitle>
            </CModalHeader>
            <CForm onSubmit={handleSubmit}>
                <CModalBody>
                    {step === 1 && (
                        <>
                            <h5 className="mb-3 text-primary">Personal Information</h5>
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormInput
                                        label="Name *"
                                        placeholder="John"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormInput
                                        label="Last Name *"
                                        placeholder="Doe"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                </CCol>
                                <CCol md={12}>
                                    <CFormInput
                                        label="ID Number"
                                        placeholder="V-12345678"
                                        value={idNumber}
                                        onChange={(e) => setIdNumber(e.target.value)}
                                    />
                                </CCol>
                            </CRow>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h5 className="mb-3 text-primary">Contact Information</h5>
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormInput
                                        label="Email"
                                        type="email"
                                        placeholder="john.doe@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormInput
                                        label="Phone"
                                        placeholder="0414-1234567"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </CCol>
                            </CRow>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <h5 className="mb-3 text-primary">Service Details</h5>
                            <CRow className="g-3">
                                <CCol md={12}>
                                    <CFormInput
                                        label="Unit *"
                                        placeholder="CICPC - Homicides"
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                        required
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormSelect
                                        label="Rank"
                                        value={rank}
                                        onChange={(e) => setRank(e.target.value)}
                                    >
                                        <option value="">Select rank</option>
                                        {rankOptions.map(rank => (
                                            <option key={rank} value={rank}>{rank}</option>
                                        ))}
                                    </CFormSelect>
                                </CCol>
                                <CCol md={6}>
                                    <CFormSelect
                                        label="Status *"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Training">Training</option>
                                        <option value="Suspended">Suspended</option>
                                    </CFormSelect>
                                </CCol>
                            </CRow>
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
                        <CButton type="button" color="primary colorbutton" style={colorbutton} onClick={handleNext} disabled={saving}>
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
                                <>{initial ? 'Update' : 'Create'} Officer</>
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

export default OfficerForm