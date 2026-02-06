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
import { containerStyles, textStyles, colorbutton, upgradebutton } from 'src/styles/darkModeStyles'

const ComplaintForm = ({ visible, onClose, onSave, initial = null }) => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [complainant_name, setComplainantName] = useState('')
    const [complainant_phone, setComplainantPhone] = useState('')
    const [complainant_email, setComplainantEmail] = useState('')
    const [location, setLocation] = useState('')
    const [assignedOfficerId, setAssignedOfficerId] = useState('')
    const [status, setStatus] = useState('received')
    const [priority, setPriority] = useState('medium')
    const [incidentDate, setIncidentDate] = useState('')
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

    const userStr = sessionStorage.getItem('user')
    const userRole = userStr ? JSON.parse(userStr).role : 'civil'

    useEffect(() => {
        if (visible) {
            setStep(1)
            loadOfficers()
            loadZones()

            if (initial) {
                setTitle(initial.title || '')
                setDescription(initial.description || '')
                setComplainantName(initial.complainant_name || '')
                setComplainantPhone(initial.complainant_phone || '')
                setComplainantEmail(initial.complainant_email || '')
                setLocation(initial.location || '')
                setAssignedOfficerId(initial.assignedOfficerId || '')
                setStatus(initial.status || 'received')
                setPriority(initial.priority || 'medium')
                setIncidentDate(initial.incidentDate ? new Date(initial.incidentDate).toISOString().split('T')[0] : '')
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
                setComplainantName('')
                setComplainantPhone('')
                setComplainantEmail('')
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
        }
    }, [visible, initial])

    const validateStep = (currentStep) => {
        if (currentStep === 1) {
            if (!title.trim() || !description.trim() || !incidentDate) {
                return false
            }
            return true
        }
        if (currentStep === 2) {
            if (!complainant_name.trim()) {
                return false
            }
            return true
        }
        if (currentStep === 3) {
            if (!address.trim()) {
                return false
            }
            return true
        }
        if (currentStep === 4) {
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
                complainant_phone: complainant_phone.trim(),
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
                                    required
                                />
                            </div>

                            <CRow className="g-3 mt-2">
                                <CCol md={6}>
                                    <CFormInput
                                        label="Incident Date *"
                                        type="date"
                                        value={incidentDate}
                                        onChange={(e) => setIncidentDate(e.target.value)}
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
                                <CCol md={6}>
                                    <CFormInput
                                        label="Complainant Name *"
                                        placeholder="Full name"
                                        value={complainant_name}
                                        onChange={(e) => setComplainantName(e.target.value)}
                                        required
                                    />
                                </CCol>
                                <CCol md={6}>
                                    <CFormInput
                                        label="Phone Number"
                                        placeholder="Contact number"
                                        value={complainant_phone}
                                        onChange={(e) => setComplainantPhone(e.target.value)}
                                    />
                                </CCol>
                            </CRow>

                            <div className="mt-3">
                                <CFormInput
                                    label="Email Address"
                                    type="email"
                                    placeholder="email@example.com"
                                    value={complainant_email}
                                    onChange={(e) => setComplainantEmail(e.target.value)}
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