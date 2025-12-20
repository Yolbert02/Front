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
    const [dni, setDni] = useState('');
    const [document_image, setDocumentImage] = useState(null);
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [password, setPassword] = useState('');
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
                setDni(initial.dni || '');
                setDocumentImage(null);
                setFirstName(initial.first_name || '');
                setLastName(initial.last_name || '');
                setPassword('');
                setPhone(initial.phone || '');
                setEmail(initial.email || '');
                setRole(initial.role || 'civil');
                setStatus(initial.status || 'active');
            } else {
                setDni('V-');
                setDocumentImage(null);
                setFirstName('');
                setLastName('');
                setPassword('');
                setPhone('');
                setEmail('');
                setRole('civil');
                setStatus('active');
            }
            setErrors({});
        }
    }, [visible, initial]);

    const handleDniChange = (e) => {
        let value = e.target.value.toUpperCase();

        if (!value.startsWith('V-')) {
            value = 'V-' + value.replace(/V-|\s/g, '');
        }

        if (value === 'V') {
            value = 'V-';
        }

        const docValue = value.substring(2);
        const cleanedDocValue = docValue.replace(/[^A-Z0-9]/g, '');

        setDni('V-' + cleanedDocValue);
    };

    const handleDocumentImageChange = (e) => {
        setDocumentImage(e.target.files[0] || null);
    };

    const validateStep = (currentStep) => {
        const newErrors = {};

        if (currentStep === 1) {
            if (!first_name.trim()) newErrors.first_name = 'First name is required';
            if (!last_name.trim()) newErrors.last_name = 'Last name is required';
            if (!dni.trim() || dni.trim() === 'V-') newErrors.dni = 'DNI is required';
            if (!initial && !document_image) newErrors.document_image = 'Document image is required';
        }

        if (currentStep === 2) {
            if (!email.trim()) newErrors.email = 'Email is required';
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
            if (!phone.trim()) newErrors.phone = 'Phone number is required';
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
            const formData = new FormData();

            formData.append('dni', dni.trim());
            formData.append('first_name', first_name.trim());
            formData.append('last_name', last_name.trim());
            formData.append('phone', phone.trim());
            formData.append('email', email.trim());
            formData.append('role', role.toLowerCase());
            formData.append('status', status.toLowerCase());

            if (password.trim()) {
                formData.append('password', password.trim());
            }

            if (document_image) {
                formData.append('document_image', document_image);
            }

            await onSave(formData);

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
                            <h5 className="mb-3 text-primary">Datos Personales</h5>
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
                                    <CFormInput
                                        label="DNI *"
                                        placeholder="V-12345678"
                                        value={dni}
                                        onChange={handleDniChange}
                                        invalid={!!errors.dni}
                                        feedback={errors.dni}
                                        required
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormInput
                                        label={`Document Image * ${initial ? '(Optional for Edit)' : ''}`}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleDocumentImageChange}
                                        invalid={!!errors.document_image}
                                        feedback={errors.document_image}
                                        required={!initial}
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
                                    <CFormInput
                                        label="Phone Number *"
                                        placeholder="0414-1234567"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        invalid={!!errors.phone}
                                        feedback={errors.phone}
                                        required
                                    />
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