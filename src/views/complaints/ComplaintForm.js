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
    CBadge,
    CProgress,
    CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPaperclip, cilImage, cilFile, cilVideo, cilTrash, cilLocationPin } from '@coreui/icons'
import { listOfficers } from 'src/services/officers'
import { listZones } from 'src/services/zones'
import { listUsers } from 'src/services/users'
import { containerStyles, textStyles, colorbutton, upgradebutton } from 'src/styles/darkModeStyles'

const ComplaintForm = ({ visible, onClose, onSave, initial = null }) => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [complainant_name, setComplainantName] = useState('')
    const [complainant_phone_prefix, setComplainantPhonePrefix] = useState('0414')
    const [complainant_phone_number, setComplainantPhoneNumber] = useState('')
    const [complainant_phone, setComplainantPhone] = useState('')
    const [complainant_email, setComplainantEmail] = useState('')
    const [location, setLocation] = useState('')
    const [assignedOfficerId, setAssignedOfficerId] = useState('')
    const [status, setStatus] = useState('received')
    const [priority, setPriority] = useState('medium')
    const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0])
    const [evidence, setEvidence] = useState([])
    const [officers, setOfficers] = useState([])
    const [zones, setZones] = useState([])
    const [uploadProgress, setUploadProgress] = useState({})
    const [saving, setSaving] = useState(false)

    const [country, setCountry] = useState('Venezuela')
    const [state, setState] = useState('Táchira')
    const [parish, setParish] = useState('')
    const [municipality, setMunicipality] = useState('San Cristóbal')
    const [city, setCity] = useState('')
    const [zone, setZone] = useState('')
    const [address, setAddress] = useState('')

    const [step, setStep] = useState(1)
    const [users, setUsers] = useState([])
    const [selectedUserId, setSelectedUserId] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)

    const userStr = sessionStorage.getItem('user')
    const currentUserSession = userStr ? JSON.parse(userStr) : null
    const userRole = currentUserSession ? currentUserSession.role : 'civil'
    const isAdminOrOfficer = ['administrador', 'oficial'].includes(userRole?.toLowerCase())

    useEffect(() => {
        if (visible) {
            setStep(1)
            loadOfficers()
            loadZones()
            if (isAdminOrOfficer) {
                loadUsers()
            }

            const userStr = sessionStorage.getItem('user')
            const currentUser = userStr ? JSON.parse(userStr) : null

            if (initial) {
                setTitle(initial.title || '')
                setDescription(initial.description || '')
                setComplainantName(initial.complainant_name || '')
                
                // Parse initial phone
                const initialPhone = (initial.complainant_phone || '').replace(/\D/g, '')
                const prefixMatch = initialPhone.match(/^(0414|0424|0412|0416|0426)/)
                if (prefixMatch) {
                    setComplainantPhonePrefix(prefixMatch[0])
                    setComplainantPhoneNumber(initialPhone.substring(prefixMatch[0].length).substring(0, 7))
                } else {
                    setComplainantPhonePrefix('0414')
                    setComplainantPhoneNumber(initialPhone.substring(0, 7))
                }

                setComplainantEmail(initial.complainant_email || '')
                setLocation(initial.location || '')
                setAssignedOfficerId(initial.assignedOfficerId || '')
                setStatus(initial.status || 'received')
                setPriority(initial.priority || 'medium')
                setIncidentDate(initial.incidentDate ? new Date(initial.incidentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
                setEvidence(initial.evidence || [])

                setCountry(initial.country || 'Venezuela')
                setState(initial.state || 'Táchira')
                setParish(initial.parish || '')
                setMunicipality(initial.municipality || 'San Cristóbal')
                setCity(initial.city || '')
                setZone(initial.zoneId || initial.Id_zone || '')
                setAddress(initial.address || initial.location || initial.address_detail || '')
            } else {
                setTitle('')
                setDescription('')
                
                // Si el usuario está logueado, auto-completar sus datos
                if (currentUser) {
                    setComplainantName(`${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim())
                    
                    const userPhone = (currentUser.phone || '').replace(/\D/g, '')
                    const userPhoneMatch = userPhone.match(/^(0414|0424|0412|0416|0426)/)
                    if (userPhoneMatch) {
                        setComplainantPhonePrefix(userPhoneMatch[0])
                        setComplainantPhoneNumber(userPhone.substring(userPhoneMatch[0].length).substring(0, 7))
                    } else {
                        setComplainantPhonePrefix('0414')
                        setComplainantPhoneNumber(userPhone.substring(0, 7))
                    }
                    
                    setComplainantEmail(currentUser.email || '')
                } else {
                    setComplainantName('')
                    setComplainantPhonePrefix('0414')
                    setComplainantPhoneNumber('')
                    setComplainantEmail('')
                }
                
                setLocation('')
                setAssignedOfficerId('')
                setStatus('received')
                setPriority('medium')
                setIncidentDate(new Date().toISOString().split('T')[0])
                setEvidence([])

                setCountry('Venezuela')
                setState('Táchira')
                setParish('')
                setMunicipality('San Cristóbal')
                setCity('')
                setZone('')
                setAddress('')
            }
            setUploadProgress({})
            setErrors({})
        }
    }, [visible, initial])

    const [errors, setErrors] = useState({})

    const validateStep = (currentStep) => {
        const newErrors = {}
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        
        // Verificar si el usuario está autenticado
        const userStr = sessionStorage.getItem('user')
        if (!userStr) {
            newErrors.auth = 'You must be logged in to create or edit a complaint'
            setErrors(newErrors)
            return false
        }

        if (currentStep === 1) {
            if (!title.trim()) newErrors.title = 'Title is required'
            if (!description.trim()) newErrors.description = 'Description is required'
            if (!incidentDate) newErrors.incidentDate = 'Date is required'
        }
        
        if (currentStep === 2) {
            if (!complainant_name || !complainant_name.trim()) {
                newErrors.complainant_name = 'Complainant name is required'
            }

            const hasEmail = complainant_email && complainant_email.trim()
            const hasPhone = complainant_phone_number && complainant_phone_number.trim()

            if (!hasEmail && !hasPhone) {
                newErrors.contact = 'At least one contact method (email or phone) is required'
            }

            if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(complainant_email.trim())) {
                newErrors.complainant_email = 'Invalid email format'
            }

            if (hasPhone && !/^\d{7}$/.test(complainant_phone_number.trim())) {
                newErrors.complainant_phone = 'Phone number must be exactly 7 digits'
            }
        }
        
        if (currentStep === 3) {
            if (!zone) newErrors.zone = 'Zone is required'
            if (!address.trim()) newErrors.address = 'Street address is required'
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

    const loadOfficers = async () => {
        try {
            const allOfficers = await listOfficers()
            const activeOfficers = allOfficers.filter(officer => officer.status?.toLowerCase() === 'active')
            setOfficers(activeOfficers)
        } catch (error) {
            console.error('Error loading officers:', error)
            setOfficers([])
        }
    }

    const loadZones = async () => {
        try {
            const allZones = await listZones()
            setZones(allZones || [])
        } catch (error) {
            console.error('Error loading zones:', error)
            setZones([])
        }
    }

    const loadUsers = async () => {
        try {
            const allUsers = await listUsers()
            setUsers(allUsers || [])
        } catch (error) {
            console.error('Error loading users:', error)
            setUsers([])
        }
    }

    const handleUserSelect = (userId) => {
        const user = users.find(u => String(u.id) === String(userId))
        if (user) {
            setComplainantName(`${user.first_name || ''} ${user.last_name || ''}`.trim())
            setComplainantEmail(user.email || '')
            setSelectedUserId(userId)
            
            // Parse phone
            const phone = (user.phone || '').replace(/\D/g, '')
            const prefixMatch = phone.match(/^(0414|0424|0412|0416|0426)/)
            if (prefixMatch) {
                setComplainantPhonePrefix(prefixMatch[0])
                setComplainantPhoneNumber(phone.substring(prefixMatch[0].length).substring(0, 7))
            } else {
                setComplainantPhonePrefix('0414')
                setComplainantPhoneNumber(phone.substring(0, 7))
            }
        }
        setShowSuggestions(false)
    }

    const handleNameChange = (value) => {
        const cleanValue = value.replace(/[0-9]/g, '')
        setComplainantName(cleanValue)
        
        if (isAdminOrOfficer && cleanValue.length > 1) {
            const filtered = users.filter(u => 
                `${u.first_name} ${u.last_name}`.toLowerCase().includes(cleanValue.toLowerCase()) ||
                (u.email && u.email.toLowerCase().includes(cleanValue.toLowerCase()))
            )
            setSuggestions(filtered)
            setShowSuggestions(true)
        } else {
            setSuggestions([])
            setShowSuggestions(false)
        }
        
        // Clear selected user if they manually type something else
        setSelectedUserId('')
    }

    const simulateUpload = (fileId) => {
        return new Promise((resolve) => {
            let progress = 0
            const interval = setInterval(() => {
                progress += Math.random() * 15
                if (progress >= 100) {
                    progress = 100
                    clearInterval(interval)
                    resolve()
                }
                setUploadProgress(prev => ({
                    ...prev,
                    [fileId]: Math.min(progress, 100)
                }))
            }, 200)
        })
    }

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files)

        for (const file of files) {
            const fileId = Date.now() + Math.random()

            // Read file as Base64/DataURL
            const reader = new FileReader()
            reader.readAsDataURL(file)

            reader.onload = async (e) => {
                const base64Data = e.target.result

                const newEvidence = {
                    id: fileId,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: base64Data, // Now using real Base64 data
                    uploadedAt: new Date().toISOString(),
                    status: 'uploading'
                }

                setEvidence(prev => [...prev, newEvidence])

                await simulateUpload(fileId)

                setEvidence(prev =>
                    prev.map(item =>
                        item.id === fileId
                            ? { ...item, status: 'completed' }
                            : item
                    )
                )
            }
        }
        event.target.value = ''
    }

    const removeEvidence = (evidenceId) => {
        setEvidence(prev => prev.filter(item => item.id !== evidenceId))
        setUploadProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[evidenceId]
            return newProgress
        })
    }

    const getFileIcon = (fileType) => {
        if (fileType.includes('image')) return cilImage
        if (fileType.includes('video')) return cilVideo
        return cilFile
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!validateStep(step)) {
            return
        }

        setSaving(true)

        try {
            const zoneName = zones.find(z => z.id === parseInt(zone))?.name || ''
            const fullAddress = `${address}, ${zoneName}, ${city}, ${municipality}${parish ? ', ' + parish : ''}, ${state}, ${country}`

            let latitude = null
            let longitude = null

            if (fullAddress.trim()) {
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress.trim())}`)
                    if (response.ok) {
                        const data = await response.json()
                        if (data && data.length > 0) {
                            latitude = parseFloat(data[0].lat)
                            longitude = parseFloat(data[0].lon)
                        }
                    }
                } catch (error) {
                    console.error("Geocoding failed:", error)
                }
            }

            const selectedOfficer = officers.find(o => o.id === parseInt(assignedOfficerId))
            const assignedOfficerName = selectedOfficer ? `${selectedOfficer.name} ${selectedOfficer.lastName}` : ''

            const payload = {
                title: title.trim(),
                description: description.trim(),
                complainant_name: complainant_name.trim(),
                complainant_phone: `${complainant_phone_prefix}${complainant_phone_number.trim()}`,
                complainant_email: complainant_email.trim(),
                location: address.trim(), // Use ONLY the street address for address_detail
                full_address: fullAddress, // Keep the full string for other uses if needed
                country: country.trim(),
                state: state.trim(),
                parish: parish.trim(),
                municipality: municipality.trim(),
                city: city.trim(),
                Id_zone: parseInt(zone) || null,
                zone: zones.find(z => z.id === parseInt(zone))?.name || '',
                address: address.trim(),
                assignedOfficerId: assignedOfficerId ? parseInt(assignedOfficerId) : null,
                assignedOfficerName,
                status: status.toLowerCase(),
                priority: priority.toLowerCase(),
                incidentDate,
                Id_user: isAdminOrOfficer && selectedUserId ? parseInt(selectedUserId) : null,
                latitude,
                longitude,
                evidence: evidence.filter(item => item.status === 'completed')
            }

            console.log('Sending payload:', payload)
            await onSave(payload)
            onClose()
        } catch (error) {
            console.error('Error saving complaint:', error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <CModal size="lg" visible={visible} onClose={onClose}>
            <CModalHeader>
                <CModalTitle>
                    {initial ? 'Edit Complaint' : 'New Complaint'} - Step {step} of 4
                </CModalTitle>
            </CModalHeader>
            <CForm onSubmit={handleSubmit}>
                <CModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {errors.auth && (
                        <CAlert color="danger" className="mb-3">
                            {errors.auth}
                        </CAlert>
                    )}
                    
                    {Object.keys(errors).length > 0 && !errors.auth && (
                        <CAlert color="danger" className="mb-3 py-2">
                            <ul className="mb-0 small">
                                {Object.values(errors).map((err, index) => (
                                    <li key={index}>{err}</li>
                                ))}
                            </ul>
                        </CAlert>
                    )}
                    {step === 1 && (
                        <>
                            <h6 className="mb-3 text-primary">Complaint Information</h6>
                            <CRow className="g-3">
                                <CCol md={12}>
                                    <CFormInput
                                        label="Complaint Title *"
                                        placeholder="Brief description of the incident"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        invalid={!!errors.title}
                                        feedback={errors.title}
                                        required
                                    />
                                </CCol>
                            </CRow>

                            <div className="mt-3">
                                <CFormTextarea
                                    label="Detailed Description *"
                                    placeholder="Provide all relevant details of the incident..."
                                    rows="4"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    invalid={!!errors.description}
                                    feedback={errors.description}
                                    required
                                />
                            </div>

                            <CRow className="g-3 mt-2">
                                <CCol md={6}>
                                    <CFormInput
                                        label="Incident Date *"
                                        type="date"
                                        value={incidentDate}
                                        readOnly
                                        required
                                    />
                                </CCol>
                            </CRow>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h6 className="mb-3 mt-4 text-primary">Complainant Information</h6>
                            


                            <CRow className="g-3">
                                <CCol md={6} style={{ position: 'relative' }}>
                                    <CFormInput
                                        label="Complainant Name *"
                                        placeholder="Full name"
                                        value={complainant_name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        onFocus={() => {
                                            if (isAdminOrOfficer && complainant_name.length > 1) setShowSuggestions(true)
                                        }}
                                        invalid={!!errors.complainant_name}
                                        feedback={errors.complainant_name}
                                        required
                                        readOnly={!isAdminOrOfficer}
                                    />
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div 
                                            className="position-absolute w-100 shadow-sm border rounded bg-white" 
                                            style={{ 
                                                zIndex: 1000, 
                                                top: '100%', 
                                                left: 0, 
                                                maxHeight: '200px', 
                                                overflowY: 'auto' 
                                            }}
                                        >
                                            {suggestions.map(u => (
                                                <div 
                                                    key={u.id}
                                                    className="p-2 border-bottom hover-bg-light cursor-pointer"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleUserSelect(u.id)}
                                                    onMouseOver={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                                    onMouseOut={(e) => e.target.style.backgroundColor = '#fff'}
                                                >
                                                    <div className="fw-bold">{u.first_name} {u.last_name}</div>
                                                    <small className="text-muted">{u.email}</small>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CCol>
                                <CCol md={6}>
                                    <div className="mb-3">
                                        <label className="form-label">Phone Number *</label>
                                        <div className="input-group">
                                            <CFormSelect
                                                style={{ maxWidth: '100px' }}
                                                value={complainant_phone_prefix}
                                                onChange={(e) => setComplainantPhonePrefix(e.target.value)}
                                                disabled={!isAdminOrOfficer}
                                            >
                                                <option value="0414">0414</option>
                                                <option value="0424">0424</option>
                                                <option value="0412">0412</option>
                                                <option value="0416">0416</option>
                                                <option value="0426">0426</option>
                                            </CFormSelect>
                                            <CFormInput
                                                placeholder="1234567"
                                                value={complainant_phone_number}
                                                onChange={(e) => setComplainantPhoneNumber(e.target.value.replace(/\D/g, '').substring(0, 7))}
                                                invalid={!!errors.complainant_phone}
                                                required
                                                readOnly={!isAdminOrOfficer}
                                            />
                                        </div>
                                        {errors.complainant_phone && <div className="text-danger small mt-1">{errors.complainant_phone}</div>}
                                    </div>
                                </CCol>
                            </CRow>

                            <div className="mt-3">
                                <CFormInput
                                    label="Email Address"
                                    type="email"
                                    placeholder="email@example.com"
                                    value={complainant_email}
                                    onChange={(e) => setComplainantEmail(e.target.value)}
                                    invalid={!!errors.complainant_email}
                                    feedback={errors.complainant_email}
                                    readOnly={!isAdminOrOfficer}
                                />
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <h6 className="mb-3 mt-4 text-primary">
                                <CIcon icon={cilLocationPin} className="me-2" />
                                Incident Location Details *
                            </h6>
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormInput
                                        label="Country"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        disabled
                                    />
                                    <small className="text-muted">Currently fixed to Venezuela</small>
                                </CCol>
                                <CCol md={6}>
                                    <CFormInput
                                        label="State"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        disabled
                                    />
                                    <small className="text-muted">Currently fixed to Táchira</small>
                                </CCol>
                            </CRow>

                            <CRow className="g-3 mt-2">
                                <CCol md={6}>
                                    <CFormInput
                                        label="Municipality"
                                        value={municipality}
                                        onChange={(e) => setMunicipality(e.target.value)}
                                        disabled
                                    />
                                    <small className="text-muted">Currently fixed to San Cristóbal</small>
                                </CCol>
                                <CCol md={6}>
                                    <CFormInput
                                        label="Parish"
                                        placeholder="e.g., San Juan Bautista, Pedro María Morantes"
                                        value={parish}
                                        onChange={(e) => setParish(e.target.value)}
                                    />
                                    <small className="text-muted">Enter the parish (parroquia)</small>
                                </CCol>
                            </CRow>

                            <CRow className="g-3 mt-2">
                                <CCol md={6}>
                                    <CFormInput
                                        label="City"
                                        placeholder="e.g., San Cristóbal, Táriba"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                    />
                                    <small className="text-muted">Enter the city name</small>
                                </CCol>
                            </CRow>

                            <CRow className="g-3 mt-2">
                                <CCol md={6}>
                                    <CFormSelect
                                        label="Zone/Neighborhood *"
                                        value={zone}
                                        onChange={(e) => setZone(e.target.value)}
                                        invalid={!!errors.zone}
                                        feedback={errors.zone}
                                        required
                                    >
                                        <option value="">Select a zone</option>
                                        {zones && zones.map(z => (
                                            <option key={z.id} value={z.id}>{z.name}</option>
                                        ))}
                                    </CFormSelect>
                                    <small className="text-muted">Select the specific patrol zone</small>
                                </CCol>
                                <CCol md={6}>
                                    <CFormInput
                                        label="Street Address *"
                                        placeholder="e.g., Carrera 10 #20-30, Plaza Bolívar"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        invalid={!!errors.address}
                                        feedback={errors.address}
                                        required
                                    />
                                    <small className="text-muted">Specific street address or landmark</small>
                                </CCol>
                            </CRow>

                            <div className="mt-3 p-3 rounded" style={containerStyles.previewBox}>
                                <small style={textStyles.previewMuted}>
                                    <strong style={textStyles.previewLabel}>Full Address Preview:</strong><br />
                                    {address && address.trim() ? (
                                        <span style={textStyles.previewText}>
                                            {address}{zone && zones.find(z => z.id === parseInt(zone)) ? `, ${zones.find(z => z.id === parseInt(zone)).name}` : ''}, {city}, {municipality}{parish && parish.trim() ? `, ${parish}` : ''}, {state}, {country}
                                        </span>
                                    ) : (
                                        <span className="fst-italic" style={textStyles.previewPlaceholder}>Enter address details to see preview</span>
                                    )}
                                </small>
                            </div>
                        </>
                    )}

                    {step === 4 && (
                        <>
                            <h6 className="mb-3 mt-4 text-primary">Assignment and Status</h6>
                            {userRole !== 'civil' && (
                                <CRow className="g-3">
                                    <CCol md={6}>
                                        <CFormSelect
                                            label="Assigned Officer"
                                            value={assignedOfficerId}
                                            onChange={(e) => setAssignedOfficerId(e.target.value)}
                                            disabled={userRole !== 'administrator'}
                                        >
                                            <option value="">Select an officer</option>
                                            {officers.map(officer => (
                                                <option key={officer.id} value={officer.id}>
                                                    {officer.name} {officer.lastName} - {officer.unit}
                                                </option>
                                            ))}
                                        </CFormSelect>
                                    </CCol>
                                    <CCol md={3}>
                                        <CFormSelect
                                            label="Priority"
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value)}
                                            disabled={userRole !== 'administrator'}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </CFormSelect>
                                    </CCol>
                                    <CCol md={3}>
                                        <CFormSelect
                                            label="Status"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            disabled={userRole === 'civil'}
                                        >
                                            <option value="received">Received</option>
                                            <option value="under_investigation">Under Investigation</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                            <option value="rejected">Rejected</option>
                                        </CFormSelect>
                                    </CCol>
                                </CRow>
                            )}
                            <h6 className="mb-3 mt-4 text-primary">Multimedia Evidence</h6>
                            <CCard>
                                <CCardBody>
                                    <div className="mb-3">
                                        <CFormInput
                                            type="file"
                                            multiple
                                            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                                            onChange={handleFileUpload}
                                        />
                                        <small className="text-muted">
                                            Supported formats: Images, Videos, PDF, Word documents, Text files
                                        </small>
                                    </div>

                                    {evidence.length > 0 && (
                                        <div>
                                            <h6>Uploaded Files:</h6>
                                            {evidence.map(file => (
                                                <div key={file.id} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                                                    <div className="d-flex align-items-center flex-grow-1">
                                                        <CIcon
                                                            icon={getFileIcon(file.type)}
                                                            className="me-2 text-primary"
                                                        />
                                                        <div className="flex-grow-1">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <span className={file.status === 'uploading' ? 'text-muted' : ''}>
                                                                    {file.name}
                                                                </span>
                                                                <small className="text-muted ms-2">
                                                                    {formatFileSize(file.size)}
                                                                </small>
                                                            </div>
                                                            {file.status === 'uploading' && uploadProgress[file.id] !== undefined && (
                                                                <div className="mt-1">
                                                                    <CProgress
                                                                        value={uploadProgress[file.id]}
                                                                        size="sm"
                                                                        className="mb-1"
                                                                    />
                                                                    <small className="text-muted">
                                                                        Uploading... {Math.round(uploadProgress[file.id])}%
                                                                    </small>
                                                                </div>
                                                            )}
                                                            {file.status === 'completed' && (
                                                                <CBadge color="success" className="mt-1">Uploaded</CBadge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <CButton
                                                        size="sm"
                                                        color="danger"
                                                        variant="outline"
                                                        onClick={() => removeEvidence(file.id)}
                                                        className="ms-2"
                                                    >
                                                        <CIcon icon={cilTrash} />
                                                    </CButton>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {evidence.length === 0 && (
                                        <div className="text-center text-muted py-3">
                                            <CIcon icon={cilPaperclip} size="xl" />
                                            <div>No files uploaded yet</div>
                                            <small>Upload images, videos, or documents as evidence</small>
                                        </div>
                                    )}
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
                    {step < 4 ? (
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
                                <>{initial ? 'Update' : 'Create'} Complaint</>
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

export default ComplaintForm