import React, { useState, useEffect, useRef } from 'react'
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
import { checkDniExists, listUsers } from 'src/services/users'

const OfficerForm = ({ visible, onClose, onSave, initial = null }) => {
    const [step, setStep] = useState(1)
    const [primerNombre, setPrimerNombre] = useState('')
    const [segundoNombre, setSegundoNombre] = useState('')
    const [primerApellido, setPrimerApellido] = useState('')
    const [segundoApellido, setSegundoApellido] = useState('')
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
    const [dniStatus, setDniStatus] = useState(null) // null | 'checking' | 'exists' | 'available'
    const [dniOwner, setDniOwner] = useState('')
    const dniCheckTimeout = useRef(null)

    useEffect(() => {
        if (visible) {
            setStep(1)
            if (initial) {
                console.log('Editing officer:', initial)
                setPrimerNombre(initial.name || '')
                setSegundoNombre(initial.secondName || '')
                setPrimerApellido(initial.lastName || '')
                setSegundoApellido(initial.secondLastName || '')
                
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
                setPrimerNombre('')
                setSegundoNombre('')
                setPrimerApellido('')
                setSegundoApellido('')
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
            setDniStatus(null)
            setDniOwner('')
        }
    }, [visible, initial])

    const validateStep = (currentStep) => {
        const newErrors = {}
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

        if (currentStep === 1) {
            if (!primerNombre.trim()) {
                newErrors.primerNombre = 'El primer nombre es obligatorio'
            } else if (!nameRegex.test(primerNombre.trim())) {
                newErrors.primerNombre = 'El primer nombre no puede contener números'
            }

            if (segundoNombre.trim() && !nameRegex.test(segundoNombre.trim())) {
                newErrors.segundoNombre = 'El segundo nombre no puede contener números'
            }

            if (!primerApellido.trim()) {
                newErrors.primerApellido = 'El primer apellido es obligatorio'
            } else if (!nameRegex.test(primerApellido.trim())) {
                newErrors.primerApellido = 'El primer apellido no puede contener números'
            }

            if (segundoApellido.trim() && !nameRegex.test(segundoApellido.trim())) {
                newErrors.segundoApellido = 'El segundo apellido no puede contener números'
            }

            if (!idNumberOnly.trim()) {
                newErrors.idNumber = 'La cédula es obligatoria'
            } else if (idNumberOnly.length < 7 || idNumberOnly.length > 8) {
                newErrors.idNumber = 'La cédula debe tener entre 7 y 8 dígitos'
            } else if (dniStatus === 'exists' && !initial) {
                newErrors.idNumber = 'Esta cédula ya está registrada en el sistema'
            }
        }
        
        if (currentStep === 2) {
            const hasEmail = email && email.trim()
            const hasPhone = phoneNumber && phoneNumber.trim()

            if (!hasEmail && !hasPhone) {
                newErrors.contact = 'Se requiere al menos un método de contacto (correo o teléfono)'
            }

            if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                newErrors.email = 'Formato de correo inválido'
            }

            if (hasPhone && !/^\d{7}$/.test(phoneNumber.trim())) {
                newErrors.phone = 'El número de teléfono debe tener exactamente 7 dígitos'
            }
        }
        
        if (currentStep === 3) {
            if (!unit.trim()) newErrors.unit = 'La unidad es obligatoria'
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
                first_name: primerNombre.trim(),
                second_name: segundoNombre.trim() || null,
                last_name: primerApellido.trim(),
                second_last_name: segundoApellido.trim() || null,
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
        'Asignación Pendiente',
        'Cadete',
        'Oficial',
        'Detective',
        'Sargento',
        'Teniente',
        'Capitán',
        'Comandante',
        'Subjefe',
        'Jefe'
    ]

    return (
        <CModal size="lg" visible={visible} onClose={onClose} backdrop="static" keyboard={false}>
            <CModalHeader>
                <CModalTitle>{initial ? 'Editar Oficial' : 'Nuevo Oficial'}</CModalTitle>
            </CModalHeader>
            <CForm onSubmit={handleSubmit}>
                <CModalBody>
                    {Object.keys(errors).length > 0 && (
                        <CAlert color="danger" className="mb-3">
                            <ul className="mb-0">
                                {Object.values(errors).map((err, index) => (
                                    <li key={index}>{err}</li>
                                ))}
                            </ul>
                        </CAlert>
                    )}
                    {step === 1 && (
                        <>
                            <h5 className="mb-3 text-primary">Información Personal</h5>
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormInput
                                        className="tour-officer-form-firstname"
                                        label="Primer Nombre *"
                                        placeholder="Juan"
                                        value={primerNombre}
                                        onChange={(e) => setPrimerNombre(e.target.value.replace(/[0-9]/g, ''))}
                                        invalid={!!errors.primerNombre}
                                        feedback={errors.primerNombre}
                                        required
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormInput
                                        label="Segundo Nombre"
                                        placeholder="Carlos"
                                        value={segundoNombre}
                                        onChange={(e) => setSegundoNombre(e.target.value.replace(/[0-9]/g, ''))}
                                        invalid={!!errors.segundoNombre}
                                        feedback={errors.segundoNombre}
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormInput
                                        className="tour-officer-form-lastname"
                                        label="Primer Apellido *"
                                        placeholder="Pérez"
                                        value={primerApellido}
                                        onChange={(e) => setPrimerApellido(e.target.value.replace(/[0-9]/g, ''))}
                                        invalid={!!errors.primerApellido}
                                        feedback={errors.primerApellido}
                                        required
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormInput
                                        label="Segundo Apellido"
                                        placeholder="Gómez"
                                        value={segundoApellido}
                                        onChange={(e) => setSegundoApellido(e.target.value.replace(/[0-9]/g, ''))}
                                        invalid={!!errors.segundoApellido}
                                        feedback={errors.segundoApellido}
                                    />
                                </CCol>
                                <CCol md={12}>
                                    <div className="mb-3">
                                        <label className="form-label">Cédula de Identidad *</label>
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
                                                className="tour-officer-form-dni"
                                                placeholder="12345678"
                                                value={idNumberOnly}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '').substring(0, 8);
                                                    setIdNumberOnly(value);
                                                    if (dniCheckTimeout.current) clearTimeout(dniCheckTimeout.current);
                                                    if (value.length >= 7 && value.length <= 8 && !initial) {
                                                        setDniStatus('checking');
                                                        dniCheckTimeout.current = setTimeout(async () => {
                                                            const fullDni = `${idPrefix}-${value}`;
                                                            const res = await checkDniExists(fullDni);
                                                            setDniStatus(res.exists ? 'exists' : 'available');
                                                            if (res.exists) {
                                                                let ownerName = res.name || '';
                                                                if (!ownerName) {
                                                                    try {
                                                                        const users = await listUsers();
                                                                        const matchingUser = users.find(u => u.dni === fullDni);
                                                                        if (matchingUser) {
                                                                            ownerName = [
                                                                                matchingUser.first_name,
                                                                                matchingUser.second_name,
                                                                                matchingUser.last_name,
                                                                                matchingUser.second_last_name
                                                                            ].filter(Boolean).join(' ');
                                                                        }
                                                                    } catch (err) {
                                                                        console.error('Error fetching users for fallback:', err);
                                                                    }
                                                                }
                                                                setDniOwner(ownerName || 'Oficial/Usuario');
                                                                setErrors(prev => ({ ...prev, idNumber: `Esta cédula ya está registrada a nombre de: ${ownerName || 'Oficial/Usuario'}` }));
                                                            } else {
                                                                setDniOwner('');
                                                                setErrors(prev => { const { idNumber, ...rest } = prev; return rest; });
                                                            }
                                                        }, 500);
                                                    } else {
                                                        setDniStatus(null);
                                                        setDniOwner('');
                                                    }
                                                }}
                                                invalid={!!errors.idNumber}
                                                required
                                            />
                                            {!initial && dniStatus === 'checking' && (
                                                <span className="input-group-text bg-transparent border-0 px-2">
                                                    <CSpinner size="sm" />
                                                </span>
                                            )}
                                        </div>
                                        {dniStatus === 'exists' && (
                                            <div className="text-danger small mt-1">
                                                ⚠️ Esta cédula ya está registrada (Pertenece a: <strong>{dniOwner || 'Desconocido'}</strong>)
                                            </div>
                                        )}
                                        {dniStatus === 'available' && (
                                            <div className="text-success small mt-1">
                                                ✅ Cédula disponible
                                            </div>
                                        )}
                                        {errors.idNumber && dniStatus !== 'exists' && <div className="text-danger small mt-1">{errors.idNumber}</div>}
                                    </div>
                                </CCol>
                            </CRow>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h5 className="mb-3 text-primary">Información de Contacto</h5>
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormInput
                                        className="tour-officer-form-email"
                                        label="Correo Electrónico"
                                        type="email"
                                        placeholder="juan.perez@ejemplo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        invalid={!!errors.email}
                                        feedback={errors.email}
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <div className="mb-3">
                                        <label className="form-label">Teléfono *</label>
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
                                                className="tour-officer-form-phone"
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
                            <h5 className="mb-3 text-primary">Detalles del Servicio</h5>
                            <CRow className="g-3">
                                <CCol md={12}>
                                    <CFormInput
                                        className="tour-officer-form-unit"
                                        label="Unidad *"
                                        placeholder="CICPC - Homicidios"
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                        invalid={!!errors.unit}
                                        feedback={errors.unit}
                                        required
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormSelect
                                        className="tour-officer-form-rank"
                                        label="Rango"
                                        value={rank}
                                        onChange={(e) => setRank(e.target.value)}
                                    >
                                        <option value="">Seleccione el rango</option>
                                        {rankOptions.map(rank => (
                                            <option key={rank} value={rank}>{rank}</option>
                                        ))}
                                    </CFormSelect>
                                </CCol>
                                <CCol md={6}>
                                    <CFormSelect
                                        className="tour-officer-form-status"
                                        label="Estado *"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="active">Activo</option>
                                        <option value="inactive">Inactivo</option>
                                        <option value="training">En Formación</option>
                                        <option value="suspended">Suspendido</option>
                                    </CFormSelect>
                                </CCol>
                            </CRow>
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
                                <>{initial ? 'Actualizar' : 'Crear'} Oficial</>
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

export default OfficerForm