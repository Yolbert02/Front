import React, { useState, useEffect } from 'react';
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

const UserForm = ({ visible, onClose, onSave, initial = null }) => {
    const [step, setStep] = useState(1);
    const [dniPrefix, setDniPrefix] = useState('V');
    const [dniNumber, setDniNumber] = useState('');
    const [dni, setDni] = useState('');
    const [document_image, setDocumentImage] = useState(null);
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [phonePrefix, setPhonePrefix] = useState('0414');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('civil');
    const [status, setStatus] = useState('active');
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

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
                setFirstName(initial.first_name || '');
                setLastName(initial.last_name || '');
                setPassword('');
                setPhone(initial.phone || '');
                setEmail(initial.email || '');
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
                
                // ... (phone logic)
            } else {
                setDniPrefix('V');
                setDniNumber('');
                setDocumentImage(null);
                setFirstName('');
                setLastName('');
                setPassword('');
                setPhonePrefix('0414');
                setPhoneNumber('');
                setEmail('');
                setRole('civil');
                setStatus('active');
            }
            setErrors({});
        }
    }, [visible, initial]);

    const handleDniNumberChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').substring(0, 8);
        setDniNumber(value);
    };

    const handleDocumentImageChange = (e) => {
        setDocumentImage(e.target.files[0] || null);
    };

    const validateStep = (currentStep) => {
        const newErrors = {};
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

        if (currentStep === 1) {
            if (!first_name.trim()) {
                newErrors.first_name = 'First name is required';
            } else if (!nameRegex.test(first_name.trim())) {
                newErrors.first_name = 'Name cannot contain numbers or special characters';
            }

            if (!last_name.trim()) {
                newErrors.last_name = 'Last name is required';
            } else if (!nameRegex.test(last_name.trim())) {
                newErrors.last_name = 'Last name cannot contain numbers or special characters';
            }

            if (!dniNumber.trim()) {
                newErrors.dni = 'DNI is required';
            } else if (dniNumber.length < 7 || dniNumber.length > 8) {
                newErrors.dni = 'DNI must be between 7 and 8 digits';
            }
        }

        if (currentStep === 2) {
            if (!email.trim()) newErrors.email = 'Email is required';
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
            
            if (!phoneNumber.trim()) {
                newErrors.phone = 'Phone number is required';
            } else if (!/^\d{7}$/.test(phoneNumber.trim())) {
                newErrors.phone = 'Phone number must be exactly 7 digits';
            }
        }

        if (currentStep === 3) {
            if (!initial && !password.trim()) newErrors.password = 'Password is required';
            if (password.trim() && password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = (e) => {
        if (e) e.preventDefault();
        if (validateStep(step)) {
            setStep(step + 1);
        } else {
            setErrors({ ...errors });
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
                first_name: first_name.trim(),
                last_name: last_name.trim(),
                phone: `${phonePrefix}${phoneNumber.trim()}`,
                email: email.trim(),
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

    return (
        <CModal size="lg" visible={visible} onClose={onClose}>
            <CModalHeader>
                <CModalTitle>
                    {initial ? 'Edit User' : 'New User'} - Step {step} of 3
                </CModalTitle>
            </CModalHeader>
            <CForm onSubmit={handleSubmit}>
                <CModalBody>
                    {hasErrors && (
                        <CAlert color="danger" className="mb-3">
                            Please fix the errors below before proceeding.
                        </CAlert>
                    )}

                    {step === 1 && (
                        <>
                            <h5 className="mb-3 text-primary">Personal Data</h5>
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormInput
                                        label="First Name *"
                                        placeholder="John"
                                        value={first_name}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        invalid={!!errors.first_name}
                                        feedback={errors.first_name}
                                        required
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormInput
                                        label="Last Name *"
                                        placeholder="Doe"
                                        value={last_name}
                                        onChange={(e) => setLastName(e.target.value)}
                                        invalid={!!errors.last_name}
                                        feedback={errors.last_name}
                                        required
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <div className="mb-3">
                                        <label className="form-label">DNI *</label>
                                        <div className="input-group">
                                            <CFormSelect
                                                style={{ maxWidth: '70px' }}
                                                value={dniPrefix}
                                                onChange={(e) => setDniPrefix(e.target.value)}
                                            >
                                                <option value="V">V</option>
                                                <option value="E">E</option>
                                            </CFormSelect>
                                            <CFormInput
                                                placeholder="12345678"
                                                value={dniNumber}
                                                onChange={handleDniNumberChange}
                                                invalid={!!errors.dni}
                                                required
                                            />
                                        </div>
                                        {errors.dni && <div className="text-danger small mt-1">{errors.dni}</div>}
                                    </div>
                                </CCol>
                                <CCol md={6}>
                                    <CFormInput
                                        label={`Document Image ${initial ? '(Optional for Edit)' : '(Optional)'}`}
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
                            <h5 className="mb-3 text-primary">Contact</h5>
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormInput
                                        label="Email *"
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
                                        <label className="form-label">Phone Number *</label>
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
                            <h5 className="mb-3 text-primary">System Data</h5>
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormSelect
                                        label="Role *"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                    >
                                        <option value="civil">Civil</option>
                                        <option value="functionary">Functionary</option>
                                        <option value="officer">Officer</option>
                                        <option value="administrator">Administrator</option>
                                    </CFormSelect>
                                </CCol>
                                <CCol md={6}>
                                    <CFormSelect
                                        label="Status *"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="active">Active</option>
                                        <option value="suspended">Suspended</option>
                                        <option value="inactive">Inactive</option>
                                    </CFormSelect>
                                </CCol>
                                <CCol md={12}>
                                    <CFormInput
                                        label={`Password * ${initial ? '(Leave blank to keep existing)' : ''}`}
                                        type="password"
                                        placeholder="Minimum 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        invalid={!!errors.password}
                                        feedback={errors.password}
                                        required={!initial}
                                    />
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
                        <CButton
                            type="button"
                            color="primary"
                            className="colorbutton"
                            style={colorbutton}
                            onClick={handleNext}
                            disabled={saving}
                        >
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
                                <>{initial ? 'Update' : 'Create'} User</>
                            )}
                        </CButton>
                    )}

                    <CButton type="button" color="light" onClick={onClose} className="ms-auto">
                        Cancel
                    </CButton>
                </CModalFooter>
            </CForm>
        </CModal>
    );
};

export default UserForm;