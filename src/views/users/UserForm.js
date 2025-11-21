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
    CAlert
} from '@coreui/react'

const UserForm = ({ visible, onClose, onSave, initial = null }) => {
    const [document, setDocument] = useState('')
    const [first_name, setFirstName] = useState('')
    const [last_name, setLastName] = useState('')
    const [password, setPassword] = useState('')
    const [number_phone, setNumberPhone] = useState('')
    const [gmail, setGmail] = useState('')
    const [role, setRole] = useState('civil')
    const [status, setStatus] = useState('activo')
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (visible) {
            if (initial) {
                // Edit mode
                setDocument(initial.document || '')
                setFirstName(initial.first_name || '')
                setLastName(initial.last_name || '')
                setPassword(initial.password || '')
                setNumberPhone(initial.number_phone || '')
                setGmail(initial.gmail || '')
                setRole(initial.role || 'civil')
                setStatus(initial.status || 'activo')
            } else {
                // New user mode
                setDocument('')
                setFirstName('')
                setLastName('')
                setPassword('')
                setNumberPhone('')
                setGmail('')
                setRole('civil')
                setStatus('activo')
            }
            setErrors({})
        }
    }, [visible, initial])

    const validateForm = () => {
        const newErrors = {}

        if (!document.trim()) newErrors.document = 'Document is required'
        if (!first_name.trim()) newErrors.first_name = 'First name is required'
        if (!last_name.trim()) newErrors.last_name = 'Last name is required'
        if (!password.trim()) newErrors.password = 'Password is required'
        if (password.length < 6) newErrors.password = 'Password must be at least 6 characters'
        if (!gmail.trim()) newErrors.gmail = 'Email is required'
        if (gmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gmail)) newErrors.gmail = 'Invalid email format'
        if (!number_phone.trim()) newErrors.number_phone = 'Phone number is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }

        const payload = { 
            document: document.trim(),
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            password: password.trim(),
            number_phone: number_phone.trim(),
            gmail: gmail.trim(),
            role,
            status
        }
        
        onSave(payload)
    }

    const hasErrors = Object.keys(errors).length > 0

    return (
        <CModal size="lg" visible={visible} onClose={onClose}>
            <CModalHeader>
                <CModalTitle>{initial ? 'Edit User' : 'New User'}</CModalTitle>
            </CModalHeader>
            <CForm onSubmit={handleSubmit}>
                <CModalBody>
                    {hasErrors && (
                        <CAlert color="danger" className="mb-3">
                            Please fix the errors below before submitting.
                        </CAlert>
                    )}

                    <CRow className="g-3">
                        <CCol md={6}>
                            <CFormInput 
                                label="Document *" 
                                placeholder="V-12345678"
                                value={document} 
                                onChange={(e) => setDocument(e.target.value)}
                                invalid={!!errors.document}
                                feedback={errors.document}
                                required 
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormInput 
                                label="Email *" 
                                type="email"
                                placeholder="user@example.com"
                                value={gmail} 
                                onChange={(e) => setGmail(e.target.value)}
                                invalid={!!errors.gmail}
                                feedback={errors.gmail}
                                required 
                            />
                        </CCol>
                    </CRow>

                    <CRow className="g-3 mt-2">
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
                    </CRow>

                    <CRow className="g-3 mt-2">
                        <CCol md={6}>
                            <CFormInput 
                                label="Password *" 
                                type="password"
                                placeholder="Minimum 6 characters"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                invalid={!!errors.password}
                                feedback={errors.password}
                                required 
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormInput 
                                label="Phone Number *" 
                                placeholder="0414-1234567"
                                value={number_phone} 
                                onChange={(e) => setNumberPhone(e.target.value)}
                                invalid={!!errors.number_phone}
                                feedback={errors.number_phone}
                                required 
                            />
                        </CCol>
                    </CRow>

                    <CRow className="g-3 mt-2">
                        <CCol md={6}>
                            <CFormSelect 
                                label="Role *" 
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="civil">Civil</option>
                                <option value="funcionario">Funcionary</option>
                                <option value="administrador">Administrator</option>
                            </CFormSelect>
                        </CCol>
                        <CCol md={6}>
                            <CFormSelect 
                                label="Status *" 
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="activo">Active</option>
                                <option value="suspendido">Suspended</option>
                                <option value="eliminado">Deleted</option>
                            </CFormSelect>
                        </CCol>
                    </CRow>

                    <div className="mt-3">
                        <small className="text-muted">* Required fields</small>
                    </div>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={onClose}>Cancel</CButton>
                    <CButton type="submit" color="primary">
                        {initial ? 'Update' : 'Create'} User
                    </CButton>
                </CModalFooter>
            </CForm>
        </CModal>
    )
}

export default UserForm