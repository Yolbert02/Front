import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    CAlert,
    CSpinner
} from '@coreui/react';
import { colorbutton } from 'src/styles/darkModeStyles';
import { checkDniExists, listUsers } from 'src/services/users';

const UserForm = ({ visible, onClose, onSave, initial = null }) => {
    const [step, setStep] = useState(1);
    const [dniPrefix, setDniPrefix] = useState('V');
    const [dniNumber, setDniNumber] = useState('');
    const [dni, setDni] = useState('');
    const [document_image, setDocumentImage] = useState(null);
    const [primerNombre, setPrimerNombre] = useState('');
    const [segundoNombre, setSegundoNombre] = useState('');
    const [primerApellido, setPrimerApellido] = useState('');
    const [segundoApellido, setSegundoApellido] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phonePrefix, setPhonePrefix] = useState('0414');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [dateBirth, setDateBirth] = useState('');
    const [role, setRole] = useState('civil');
    const [status, setStatus] = useState('active');
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [dniStatus, setDniStatus] = useState(null); // null | 'checking' | 'exists' | 'available'
    const [dniOwner, setDniOwner] = useState('');
    const dniCheckTimeout = useRef(null);

    useEffect(() => {
        if (visible) {
            setStep(1);
            if (initial) {
                const initialDni = initial.dni || '';
                const prefixMatch = initialDni.match(/^([VE])-?/);
                if (prefixMatch) {
                    setDniPrefix(prefixMatch[1]);
                    setDniNumber(initialDni.substring(prefixMatch[0].length).replace(/\D/g, ''));
                } else {
                    setDniPrefix('V');
                    setDniNumber(initialDni.replace(/\D/g, ''));
                }
                setDocumentImage(null);
                setPrimerNombre(initial.first_name || '');
                setSegundoNombre(initial.second_name || '');
                setPrimerApellido(initial.last_name || '');
                setSegundoApellido(initial.second_last_name || '');
                setPassword('');
                setConfirmPassword('');
                setPhone(initial.phone || '');
                setEmail(initial.email || '');
                setDateBirth(initial.date_birth ? new Date(initial.date_birth).toISOString().split('T')[0] : '');
                setRole(initial.role || 'civil');
                setStatus(initial.status || 'active');
                
                // Parse initial phone
                const initialPhone = initial.phone || '';
                const phoneMatch = initialPhone.match(/^(0414|0424|0412|0416|0426)/);
                if (phoneMatch) {
                    setPhonePrefix(phoneMatch[0]);
                    setPhoneNumber(initialPhone.substring(phoneMatch[0].length));
                } else {
                    setPhonePrefix('0414');
                    setPhoneNumber(initialPhone);
                }
                setStatus(initial.status || 'active');
            } else {
                setDniPrefix('V');
                setDniNumber('');
                setDocumentImage(null);
                setPrimerNombre('');
                setSegundoNombre('');
                setPrimerApellido('');
                setSegundoApellido('');
                setPassword('');
                setConfirmPassword('');
                setPhonePrefix('0414');
                setPhoneNumber('');
                setEmail('');
                setDateBirth('');
                setRole('civil');
                setStatus('active');
            }
            setErrors({});
            setDniStatus(null);
            setDniOwner('');
        }
    }, [visible, initial]);

    const handleDniNumberChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').substring(0, 8);
        setDniNumber(value);

        // Clear previous timeout
        if (dniCheckTimeout.current) clearTimeout(dniCheckTimeout.current);

        // Only check if the number has valid length (7-8 digits)
        if (value.length >= 7 && value.length <= 8 && !initial) {
            setDniStatus('checking');
            dniCheckTimeout.current = setTimeout(async () => {
                const fullDni = `${dniPrefix}-${value}`;
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
                            console.error('Error fetching users for fallback check:', err);
                        }
                    }
                    setDniOwner(ownerName || 'Usuario Registrado');
                    setErrors(prev => ({ ...prev, dni: `Esta cédula ya está registrada en el sistema a nombre de: ${ownerName || 'Usuario Registrado'}` }));
                } else {
                    setDniOwner('');
                    setErrors(prev => {
                        const { dni, ...rest } = prev;
                        return rest;
                    });
                }
            }, 500);
        } else {
            setDniStatus(null);
            setDniOwner('');
        }
    };

    const handleDocumentImageChange = (e) => {
        setDocumentImage(e.target.files[0] || null);
    };

    const validateStep = (currentStep) => {
        const newErrors = {};
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

        if (currentStep === 1) {
            if (!primerNombre.trim()) {
                newErrors.primerNombre = 'El primer nombre es obligatorio';
            } else if (!nameRegex.test(primerNombre.trim())) {
                newErrors.primerNombre = 'El primer nombre no puede contener números ni caracteres especiales';
            }

            if (segundoNombre.trim() && !nameRegex.test(segundoNombre.trim())) {
                newErrors.segundoNombre = 'El segundo nombre no puede contener números ni caracteres especiales';
            }

            if (!primerApellido.trim()) {
                newErrors.primerApellido = 'El primer apellido es obligatorio';
            } else if (!nameRegex.test(primerApellido.trim())) {
                newErrors.primerApellido = 'El primer apellido no puede contener números ni caracteres especiales';
            }

            if (segundoApellido.trim() && !nameRegex.test(segundoApellido.trim())) {
                newErrors.segundoApellido = 'El segundo apellido no puede contener números ni caracteres especiales';
            }

            if (!dniNumber.trim()) {
                newErrors.dni = 'La cédula es obligatoria';
            } else if (dniNumber.length < 7 || dniNumber.length > 8) {
                newErrors.dni = 'La cédula debe tener entre 7 y 8 dígitos';
            } else if (dniStatus === 'exists' && !initial) {
                newErrors.dni = 'Esta cédula ya está registrada en el sistema';
            }

            if (!dateBirth) {
                newErrors.dateBirth = 'La fecha de nacimiento es obligatoria';
            } else {
                const birth = new Date(dateBirth);
                const today = new Date();
                let age = today.getFullYear() - birth.getFullYear();
                const m = today.getMonth() - birth.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                if (age < 18) {
                    newErrors.dateBirth = 'El usuario debe ser mayor de edad (18 años)';
                }
            }
        }

        if (currentStep === 2) {
            const hasEmail = email && email.trim();
            const hasPhone = phoneNumber && phoneNumber.trim();

            if (!hasEmail && !hasPhone) {
                newErrors.contact = 'Se requiere al menos un método de contacto (correo o teléfono)';
            }

            if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                newErrors.email = 'Formato de correo electrónico no válido';
            }

            if (hasPhone && !/^\d{7}$/.test(phoneNumber.trim())) {
                newErrors.phone = 'El número de teléfono debe tener exactamente 7 dígitos';
            }
        }

        if (currentStep === 3) {
            if (!initial && !password.trim()) newErrors.password = 'La contraseña es obligatoria';
            if (password.trim() && password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
            if (!initial && password !== confirmPassword) {
                newErrors.confirmPassword = 'Las contraseñas no coinciden';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = (e) => {
        if (e) e.preventDefault();
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const handleBack = (e) => {
        if (e) e.preventDefault();
        setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!validateStep(3)) {
            if (Object.keys(errors).length > 0 && step !== 3) setStep(3);
            return;
        }

        setSaving(true);

        try {
            const payload = {
                dni: `${dniPrefix}-${dniNumber.trim()}`,
                first_name: primerNombre.trim(),
                second_name: segundoNombre.trim() || null,
                last_name: primerApellido.trim(),
                second_last_name: segundoApellido.trim() || null,
                phone: `${phonePrefix}${phoneNumber.trim()}`,
                email: email.trim(),
                date_birth: dateBirth,
                role: role.toLowerCase(),
                status: status.toLowerCase()
            };

            if (password.trim()) {
                payload.password = password.trim();
            }

            await onSave(payload);

            onClose();
        } catch (error) {
            console.error('Error saving user:', error);
        } finally {
            setSaving(false);
        }
    };

    const hasErrors = Object.keys(errors).length > 0;

    // Calculate max date for birth (must be at least 18 years ago)
    const maxBirthDate = new Date();
    maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 18);
    const maxBirthDateStr = maxBirthDate.toISOString().split('T')[0];

    return (
        <CModal size="lg" visible={visible} onClose={onClose} backdrop="static" keyboard={false}>
            <CModalHeader>
                <CModalTitle>
                    {initial ? 'Editar Usuario' : 'Nuevo Usuario'} - Paso {step} de 3
                </CModalTitle>
            </CModalHeader>
            <CForm onSubmit={handleSubmit}>
                <CModalBody>
                    {hasErrors && (
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
                            <h5 className="mb-3 text-primary">Datos Personales</h5>
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormInput
                                        className="tour-user-form-firstname"
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
                                        className="tour-user-form-lastname"
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
                                <CCol md={6}>
                                    <div className="mb-3">
                                        <label className="form-label">Cédula de Identidad *</label>
                                        <div className="input-group">
                                            <CFormSelect
                                                style={{ maxWidth: '70px' }}
                                                value={dniPrefix}
                                                onChange={(e) => setDniPrefix(e.target.value)}
                                                disabled={!!initial}
                                            >
                                                <option value="V">V</option>
                                                <option value="E">E</option>
                                            </CFormSelect>
                                            <CFormInput
                                                className="tour-user-form-dni"
                                                placeholder="12345678"
                                                value={dniNumber}
                                                onChange={handleDniNumberChange}
                                                invalid={!!errors.dni}
                                                required
                                                disabled={!!initial}
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
                                        {errors.dni && dniStatus !== 'exists' && <div className="text-danger small mt-1">{errors.dni}</div>}
                                    </div>
                                </CCol>
                                <CCol md={6}>
                                    <CFormInput
                                        className="tour-user-form-birth"
                                        label="Fecha de Nacimiento *"
                                        type="date"
                                        value={dateBirth}
                                        onChange={(e) => setDateBirth(e.target.value)}
                                        invalid={!!errors.dateBirth}
                                        feedback={errors.dateBirth}
                                        max={maxBirthDateStr}
                                        required
                                    />
                                    {errors.dateBirth && <div className="text-danger small mt-1">{errors.dateBirth}</div>}
                                    <small className="text-muted">Debe ser mayor de 18 años</small>
                                </CCol>
                                <CCol md={6}>
                                    <CFormInput
                                        label={`Imagen del Documento ${initial ? '(Opcional para Editar)' : '(Opcional)'}`}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleDocumentImageChange}
                                        invalid={!!errors.document_image}
                                        feedback={errors.document_image}
                                        required={false}
                                    />
                                </CCol>
                            </CRow>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h5 className="mb-3 text-primary">Contacto</h5>
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormInput
                                        className="tour-user-form-email"
                                        label="Correo Electrónico *"
                                        type="email"
                                        placeholder="user@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        invalid={!!errors.email}
                                        feedback={errors.email}
                                        required
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <div className="mb-3">
                                        <label className="form-label">Número de Teléfono *</label>
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
                                                className="tour-user-form-phone"
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
                            <h5 className="mb-3 text-primary">Datos del Sistema</h5>
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormSelect
                                        className="tour-user-form-role"
                                        label="Rol *"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                    >
                                        <option value="civil">Civil</option>
                                        <option value="functionary">Funcionario</option>
                                        <option value="officer">Oficial</option>
                                        <option value="administrator">Administrador</option>
                                    </CFormSelect>
                                </CCol>
                                <CCol md={6}>
                                    <CFormSelect
                                        className="tour-user-form-status"
                                        label="Estado *"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="active">Activo</option>
                                        <option value="suspended">Suspendido</option>
                                        <option value="inactive">Inactivo</option>
                                    </CFormSelect>
                                </CCol>
                                {!initial && (
                                    <>
                                        <CCol md={6}>
                                            <CFormInput
                                                className="tour-user-form-password"
                                                label="Contraseña *"
                                                type="password"
                                                placeholder="Mínimo 6 caracteres"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                invalid={!!errors.password}
                                                feedback={errors.password}
                                            />
                                        </CCol>
                                        <CCol md={6}>
                                            <CFormInput
                                                className="tour-user-form-confirm-password"
                                                label="Confirmar Contraseña *"
                                                type="password"
                                                placeholder="Repita la contraseña"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                invalid={!!errors.confirmPassword}
                                                feedback={errors.confirmPassword}
                                            />
                                        </CCol>
                                    </>
                                )}
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
                        <CButton
                            type="button"
                            color="primary"
                            className="colorbutton"
                            style={colorbutton}
                            onClick={handleNext}
                            disabled={saving}
                        >
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
                                <>{initial ? 'Actualizar' : 'Crear'} Usuario</>
                            )}
                        </CButton>
                    )}

                    <CButton type="button" color="light" onClick={onClose} className="ms-auto">
                        Cancelar
                    </CButton>
                </CModalFooter>
            </CForm>
        </CModal>
    );
};

export default UserForm;