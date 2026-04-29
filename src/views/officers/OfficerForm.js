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
    const [idPrefix, setIdPrefix] = useState('V')
    const [idNumberOnly, setIdNumberOnly] = useState('')
    const [idNumber, setIdNumber] = useState('')
    const [unit, setUnit] = useState('')
    const [email, setEmail] = useState('')
    const [phonePrefix, setPhonePrefix] = useState('0414')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [phone, setPhone] = useState('')
    const [rank, setRank] = useState('')
    const [status, setStatus] = useState('Active')
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (visible) {
            setStep(1)
            if (initial) {
                console.log('Editing officer:', initial)
                setName(initial.name || '')
                setLastName(initial.lastName || '')
                
                const initialId = initial.idNumber || ''
                const prefixMatch = initialId.match(/^([VE])-?/)
                if (prefixMatch) {
                    setIdPrefix(prefixMatch[1])
                    setIdNumberOnly(initialId.substring(prefixMatch[0].length).replace(/\D/g, ''))
                } else {
                    setIdPrefix('V')
                    setIdNumberOnly(initialId.replace(/\D/g, ''))
                }
                setUnit(initial.unit || '')
                setEmail(initial.email || '')
                setPhone(initial.phone || '')
                setRank(initial.rank || '')
                setStatus(initial.status || 'Active')

                // Parse initial phone
                const initialPhone = initial.phone || ''
                const phoneMatch = initialPhone.match(/^(0414|0424|0412|0416|0426)/)
                if (phoneMatch) {
                    setPhonePrefix(phoneMatch[0])
                    setPhoneNumber(initialPhone.substring(phoneMatch[0].length))
                } else {
                    setPhonePrefix('0414')
                    setPhoneNumber(initialPhone)
                }
            } else {
                console.log('Creating new officer')
                setName('')
                setLastName('')
                setIdPrefix('V')
                setIdNumberOnly('')
                setUnit('')
                setEmail('')
                setPhonePrefix('0414')
                setPhoneNumber('')
                setRank('')
                setStatus('Active')
            }
            setErrors({})
        }
    }, [visible, initial])

    const validateStep = (currentStep) => {
        const newErrors = {}
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

        if (currentStep === 1) {
            if (!name.trim()) {
                newErrors.name = 'Name is required'
            } else if (!nameRegex.test(name.trim())) {
                newErrors.name = 'Name cannot contain numbers'
            }

            if (!lastName.trim()) {
                newErrors.lastName = 'Last name is required'
            } else if (!nameRegex.test(lastName.trim())) {
                newErrors.lastName = 'Last name cannot contain numbers'
            }

            if (!idNumberOnly.trim()) {
                newErrors.idNumber = 'ID is required'
            } else if (idNumberOnly.length < 7 || idNumberOnly.length > 8) {
                newErrors.idNumber = 'ID must be between 7 and 8 digits'
            }
        }
        
        if (currentStep === 2) {
            if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                newErrors.email = 'Invalid email format'
            }
            if (!phoneNumber.trim()) {
                newErrors.phone = 'Phone number is required'
            } else if (!/^\d{7}$/.test(phoneNumber.trim())) {
                newErrors.phone = 'Phone number must be exactly 7 digits'
            }
        }
        
        if (currentStep === 3) {
            if (!unit.trim()) newErrors.unit = 'Unit is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
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
                idNumber: `${idPrefix}-${idNumberOnly.trim()}`,
                unit: unit.trim(),
                email: email.trim(),
                phone: `${phonePrefix}${phoneNumber.trim()}`,
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
                                        onChange={(e) => setName(e.target.value.replace(/[0-9]/g, ''))}
                                        invalid={!!errors.name}
                                        feedback={errors.name}
                                        required
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormInput
                                        label="Last Name *"
                                        placeholder="Doe"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value.replace(/[0-9]/g, ''))}
                                        invalid={!!errors.lastName}
                                        feedback={errors.lastName}
                                        required
                                    />
                                </CCol>
                                <CCol md={12}>
                                    <div className="mb-3">
                                        <label className="form-label">ID Number *</label>
                                        <div className="input-group">
                                            <CFormSelect
                                                style={{ maxWidth: '70px' }}
                                                value={idPrefix}
                                                onChange={(e) => setIdPrefix(e.target.value)}
                                            >
                                                <option value="V">V</option>
                                                <option value="E">E</option>
                                            </CFormSelect>
                                            <CFormInput
                                                placeholder="12345678"
                                                value={idNumberOnly}
                                                onChange={(e) => setIdNumberOnly(e.target.value.replace(/\D/g, '').substring(0, 8))}
                                                invalid={!!errors.idNumber}
                                                required
                                            />
                                        </div>
                                        {errors.idNumber && <div className="text-danger small mt-1">{errors.idNumber}</div>}
                                    </div>
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
                                        invalid={!!errors.email}
                                        feedback={errors.email}
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <div className="mb-3">
                                        <label className="form-label">Phone *</label>
                                        <div className="input-group">
                                            <CFormSelect
                                                style={{ maxWidth: '100px' }}
                                                value={phonePrefix}
                                                onChange={(e) => setPhonePrefix(e.target.value)}
                                            >
                                                <option value="0414">0414</option>
                                                <option value="0424">0424</option>
                                                <option value="0412">0412</option>
                                                <option value="0416">0416</option>
                                                <option value="0426">0426</option>
                                            </CFormSelect>
                                            <CFormInput
                                                placeholder="1234567"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').substring(0, 7))}
                                                invalid={!!errors.phone}
                                                required
                                            />
                                        </div>
                                        {errors.phone && <div className="text-danger small mt-1">{errors.phone}</div>}
                                    </div>
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
                                        invalid={!!errors.unit}
                                        feedback={errors.unit}
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
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="training">Training</option>
                                        <option value="suspended">Suspended</option>
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