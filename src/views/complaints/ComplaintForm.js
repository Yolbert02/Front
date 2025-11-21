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
    CProgress
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPaperclip, cilImage, cilFile, cilVideo, cilTrash } from '@coreui/icons'
import { listOfficers } from 'src/services/officers'

const ComplaintForm = ({ visible, onClose, onSave, initial = null }) => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [complainantName, setComplainantName] = useState('')
    const [complainantPhone, setComplainantPhone] = useState('')
    const [complainantEmail, setComplainantEmail] = useState('')
    const [location, setLocation] = useState('')
    const [assignedOfficerId, setAssignedOfficerId] = useState('')
    const [status, setStatus] = useState('Received')
    const [priority, setPriority] = useState('Medium')
    const [incidentDate, setIncidentDate] = useState('')
    const [evidence, setEvidence] = useState([])
    const [officers, setOfficers] = useState([])
    const [uploadProgress, setUploadProgress] = useState({})

    // Cargar oficiales cuando se abre el modal
    useEffect(() => {
        if (visible) {
            loadOfficers()
            
            if (initial) {
                // Edit mode
                setTitle(initial.title || '')
                setDescription(initial.description || '')
                setComplainantName(initial.complainantName || '')
                setComplainantPhone(initial.complainantPhone || '')
                setComplainantEmail(initial.complainantEmail || '')
                setLocation(initial.location || '')
                setAssignedOfficerId(initial.assignedOfficerId || '')
                setStatus(initial.status || 'Received')
                setPriority(initial.priority || 'Medium')
                setIncidentDate(initial.incidentDate || '')
                setEvidence(initial.evidence || [])
            } else {
                // New complaint mode
                setTitle('')
                setDescription('')
                setComplainantName('')
                setComplainantPhone('')
                setComplainantEmail('')
                setLocation('')
                setAssignedOfficerId('')
                setStatus('Received')
                setPriority('Medium')
                setIncidentDate(new Date().toISOString().split('T')[0])
                setEvidence([])
            }
            setUploadProgress({})
        }
    }, [visible, initial])

    const loadOfficers = async () => {
        try {
            const allOfficers = await listOfficers()
            // Filter only active officers
            const activeOfficers = allOfficers.filter(officer => officer.status === 'Active')
            setOfficers(activeOfficers)
        } catch (error) {
            console.error('Error loading officers:', error)
            setOfficers([])
        }
    }

    // Simulate file upload with progress
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

    // Handle file upload
    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files)
        
        for (const file of files) {
            const fileId = Date.now() + Math.random()
            
            // Add file to evidence immediately with uploading state
            const newEvidence = {
                id: fileId,
                name: file.name,
                type: file.type,
                size: file.size,
                url: URL.createObjectURL(file),
                uploadedAt: new Date().toISOString(),
                status: 'uploading'
            }
            
            setEvidence(prev => [...prev, newEvidence])
            
            // Simulate upload progress
            await simulateUpload(fileId)
            
            // Update status to completed
            setEvidence(prev => 
                prev.map(item => 
                    item.id === fileId 
                        ? { ...item, status: 'completed' }
                        : item
                )
            )
        }
        event.target.value = '' // Reset input
    }

    // Remove evidence
    const removeEvidence = (evidenceId) => {
        setEvidence(prev => prev.filter(item => item.id !== evidenceId))
        setUploadProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[evidenceId]
            return newProgress
        })
    }

    // Get file icon based on type
    const getFileIcon = (fileType) => {
        if (fileType.includes('image')) return cilImage
        if (fileType.includes('video')) return cilVideo
        return cilFile
    }

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        
        // Basic validations
        if (!title.trim() || !description.trim() || !complainantName.trim() || !location.trim()) {
            alert('Title, Description, Complainant Name, and Location are required')
            return
        }

        // Find selected officer name
        const selectedOfficer = officers.find(o => o.id === parseInt(assignedOfficerId))
        const assignedOfficerName = selectedOfficer ? `${selectedOfficer.name} ${selectedOfficer.lastName}` : ''

        const payload = { 
            title: title.trim(),
            description: description.trim(),
            complainantName: complainantName.trim(),
            complainantPhone: complainantPhone.trim(),
            complainantEmail: complainantEmail.trim(),
            location: location.trim(),
            assignedOfficerId: assignedOfficerId ? parseInt(assignedOfficerId) : null,
            assignedOfficerName,
            status,
            priority,
            incidentDate,
            evidence: evidence.filter(item => item.status === 'completed') // Only include completed uploads
        }
        
        onSave(payload)
    }

    return (
        <CModal size="lg" visible={visible} onClose={onClose}>
            <CModalHeader>
                <CModalTitle>{initial ? 'Edit Complaint' : 'New Complaint'}</CModalTitle>
            </CModalHeader>
            <CForm onSubmit={handleSubmit}>
                <CModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {/* Complaint Information */}
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
                                label="Incident Date"
                                type="date"
                                value={incidentDate}
                                onChange={(e) => setIncidentDate(e.target.value)}
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormInput 
                                label="Location *"
                                placeholder="Exact address of the incident"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
                            />
                        </CCol>
                    </CRow>

                    {/* Complainant Information */}
                    <h6 className="mb-3 mt-4 text-primary">Complainant Information</h6>
                    <CRow className="g-3">
                        <CCol md={6}>
                            <CFormInput 
                                label="Complainant Name *"
                                placeholder="Full name"
                                value={complainantName}
                                onChange={(e) => setComplainantName(e.target.value)}
                                required
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormInput 
                                label="Phone Number"
                                placeholder="Contact number"
                                value={complainantPhone}
                                onChange={(e) => setComplainantPhone(e.target.value)}
                            />
                        </CCol>
                    </CRow>

                    <div className="mt-3">
                        <CFormInput 
                            label="Email Address"
                            type="email"
                            placeholder="email@example.com"
                            value={complainantEmail}
                            onChange={(e) => setComplainantEmail(e.target.value)}
                        />
                    </div>

                    {/* Assignment and Status */}
                    <h6 className="mb-3 mt-4 text-primary">Assignment and Status</h6>
                    <CRow className="g-3">
                        <CCol md={6}>
                            <CFormSelect 
                                label="Assigned Officer"
                                value={assignedOfficerId}
                                onChange={(e) => setAssignedOfficerId(e.target.value)}
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
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                            </CFormSelect>
                        </CCol>
                        <CCol md={3}>
                            <CFormSelect 
                                label="Status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="Received">Received</option>
                                <option value="Under Investigation">Under Investigation</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                                <option value="Rejected">Rejected</option>
                            </CFormSelect>
                        </CCol>
                    </CRow>

                    {/* Multimedia Evidence */}
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

                    <div className="mt-3">
                        <small className="text-muted">* Required fields</small>
                    </div>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={onClose}>Cancel</CButton>
                    <CButton type="submit" color="primary">
                        {initial ? 'Update' : 'Create'} Complaint
                    </CButton>
                </CModalFooter>
            </CForm>
        </CModal>
    )
}

export default ComplaintForm