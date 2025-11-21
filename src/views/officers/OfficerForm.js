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
    CCol 
} from '@coreui/react'

const OfficerForm = ({ visible, onClose, onSave, initial = null }) => {
    const [name, setName] = useState('')
    const [lastName, setLastName] = useState('')
    const [idNumber, setIdNumber] = useState('')
    const [unit, setUnit] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [status, setStatus] = useState('Active')

    // Resetear el formulario cuando se abre/cierra
    useEffect(() => {
        if (visible) {
            if (initial) {
                // Modo edición
                console.log('Editing officer:', initial)
                setName(initial.name || '')
                setLastName(initial.lastName || '')
                setIdNumber(initial.idNumber || '')
                setUnit(initial.unit || '')
                setEmail(initial.email || '')
                setPhone(initial.phone || '')
                setStatus(initial.status || 'Active')
            } else {
                // Modo nuevo - limpiar todo
                console.log('Creating new officer')
                setName('')
                setLastName('')
                setIdNumber('')
                setUnit('')
                setEmail('')
                setPhone('')
                setStatus('Active')
            }
        }
    }, [visible, initial])

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Form submitted with:', { name, lastName, idNumber, unit, email, phone, status })
        
        // Validaciones básicas
        if (!name.trim() || !lastName.trim()) {
            alert('Name and Last Name are required')
            return
        }

        const payload = { 
            name: name.trim(),
            lastName: lastName.trim(),
            idNumber: idNumber.trim(),
            unit: unit.trim(),
            email: email.trim(),
            phone: phone.trim(),
            status 
        }
        
        onSave(payload)
    }

    return (
        <CModal size="lg" visible={visible} onClose={onClose}>
            <CModalHeader>
                <CModalTitle>{initial ? 'Edit Officer' : 'New Officer'}</CModalTitle>
            </CModalHeader>
            <CForm onSubmit={handleSubmit}>
                <CModalBody>
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
                    </CRow>

                    <CRow className="g-3 mt-2">
                        <CCol md={6}>
                            <CFormInput 
                                label="ID Number" 
                                placeholder="V-12345678"
                                value={idNumber} 
                                onChange={(e) => setIdNumber(e.target.value)}
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormInput 
                                label="Unit" 
                                placeholder="CICPC - Homicides"
                                value={unit} 
                                onChange={(e) => setUnit(e.target.value)}
                            />
                        </CCol>
                    </CRow>

                    <CRow className="g-3 mt-2">
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

                    <div className="mt-3">
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
                    </div>

                    <div className="mt-3">
                        <small className="text-muted">* Required fields</small>
                    </div>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={onClose}>Cancel</CButton>
                    <CButton type="submit" color="primary">
                        {initial ? 'Update' : 'Create'} Officer
                    </CButton>
                </CModalFooter>
            </CForm>
        </CModal>
    )
}

export default OfficerForm