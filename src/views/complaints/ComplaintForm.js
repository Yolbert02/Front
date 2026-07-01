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
    CBadge,
    CSpinner,
    CAlert
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPaperclip, cilTrash, cilLocationPin } from '@coreui/icons'
import { listOfficers } from 'src/services/officers'
import { listZones } from 'src/services/zones'
import { listUsers } from 'src/services/users'
import { colorbutton } from 'src/styles/darkModeStyles'
import { CRIME_TYPES } from 'src/constants/crimes'

// Leaflet imports
import { MapContainer, TileLayer, Marker, useMapEvents, Polygon } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon in Leaflet + Webpack/Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function pointInPolygon(point, vs) {
    var x = point[0], y = point[1];
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

const LocationMarker = ({ position, setPosition, zones, setZone, setAddress }) => {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition(e.latlng);
            
            // Find matching zone synchronously so UI updates instantly
            let foundZoneName = '';
            let foundZoneId = null;
            for (const z of zones) {
                if (z.coordinates && z.coordinates.length > 2) {
                    if (pointInPolygon([lat, lng], z.coordinates)) {
                        foundZoneId = z.id;
                        foundZoneName = z.name || '';
                        break;
                    }
                }
            }
            if (foundZoneId) {
                setZone(foundZoneId.toString());
            } else {
                setZone('');
            }

            // Set address IMMEDIATELY with zone + coordinates (user sees it right away)
            const quickAddress = foundZoneName 
                ? `${foundZoneName}, San Cristóbal, Táchira (${lat.toFixed(5)}, ${lng.toFixed(5)})`
                : `San Cristóbal, Táchira (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
            setAddress(quickAddress);

            // Then try to enhance with real street name from Nominatim
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=es`, {
                signal: controller.signal
            })
            .then(res => res.json())
            .then(data => {
                clearTimeout(timeoutId);
                if (data && data.display_name) {
                    setAddress(data.display_name);
                }
            })
            .catch(() => {
                clearTimeout(timeoutId);
                // Keep the quick address already set - no action needed
            });
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

const ComplaintForm = ({ visible, onClose, onSave, initial = null }) => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [complainant_name, setComplainantName] = useState('')
    const [complainant_phone_prefix, setComplainantPhonePrefix] = useState('0414')
    const [complainant_phone_number, setComplainantPhoneNumber] = useState('')
    const [complainant_email, setComplainantEmail] = useState('')
    const [assignedOfficerId, setAssignedOfficerId] = useState('')
    const [status, setStatus] = useState('received')
    const [priority, setPriority] = useState('medium')
    const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0])
    const [evidence, setEvidence] = useState([])
    const [officers, setOfficers] = useState([])
    const [zones, setZones] = useState([])
    const [saving, setSaving] = useState(false)

    // Location states
    const [country, setCountry] = useState('Venezuela')
    const [state, setState] = useState('Táchira')
    const [municipality, setMunicipality] = useState('San Cristóbal')
    const [zone, setZone] = useState('')
    const [address, setAddress] = useState('')
    const [latlng, setLatlng] = useState(null) // {lat, lng}

    const [step, setStep] = useState(1)
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [selectedUserId, setSelectedUserId] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [errors, setErrors] = useState({})

    const userStr = sessionStorage.getItem('user')
    const currentUserSession = userStr ? JSON.parse(userStr) : null
    const userRole = currentUserSession ? currentUserSession.role : 'civil'
    const isAdminOrOfficer = ['administrador', 'oficial', 'administrator', 'officer'].includes(userRole?.toLowerCase())

    // Default center for San Cristóbal, Táchira
    const defaultCenter = [7.7667, -72.2250];

    useEffect(() => {
        if (visible) {
            setStep(1)
            loadOfficers()
            loadZones()
            if (isAdminOrOfficer) {
                loadUsers()
            }

            if (initial) {
                setTitle(initial.title || '')
                setDescription(initial.description || '')
                setComplainantName(initial.complainant_name || '')
                
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
                setAssignedOfficerId(initial.assignedOfficerId || '')
                setStatus(initial.status || 'received')
                setPriority(initial.priority || 'medium')
                setIncidentDate(initial.incidentDate ? new Date(initial.incidentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
                setEvidence(initial.evidence || [])

                setCountry(initial.country || 'Venezuela')
                setState(initial.state || 'Táchira')
                setMunicipality(initial.municipality || 'San Cristóbal')
                setZone(initial.Id_zone || '')
                setAddress(initial.address || '')
                
                if (initial.latitude && initial.longitude) {
                    setLatlng({ lat: initial.latitude, lng: initial.longitude })
                } else {
                    setLatlng(null)
                }
            } else {
                setTitle('')
                setDescription('')
                if (currentUserSession) {
                    setComplainantName(`${currentUserSession.first_name || ''} ${currentUserSession.last_name || ''}`.trim())
                    const userPhone = (currentUserSession.phone || '').replace(/\D/g, '')
                    const userPhoneMatch = userPhone.match(/^(0414|0424|0412|0416|0426)/)
                    if (userPhoneMatch) {
                        setComplainantPhonePrefix(userPhoneMatch[0])
                        setComplainantPhoneNumber(userPhone.substring(userPhoneMatch[0].length).substring(0, 7))
                    } else {
                        setComplainantPhonePrefix('0414')
                        setComplainantPhoneNumber(userPhone.substring(0, 7))
                    }
                    setComplainantEmail(currentUserSession.email || '')
                } else {
                    setComplainantName('')
                    setComplainantPhonePrefix('0414')
                    setComplainantPhoneNumber('')
                    setComplainantEmail('')
                }
                setAssignedOfficerId('')
                setStatus('received')
                setPriority('medium')
                setIncidentDate(new Date().toISOString().split('T')[0])
                setEvidence([])
                setCountry('Venezuela')
                setState('Táchira')
                setMunicipality('San Cristóbal')
                setZone('')
                setAddress('')
                setLatlng(null)
            }
            setErrors({})
        }
    }, [visible, initial])

    const loadOfficers = async () => {
        try {
            const allOfficers = await listOfficers()
            setOfficers(allOfficers.filter(o => o.status?.toLowerCase() === 'active'))
        } catch (error) {
            console.error('Error loading officers:', error)
        }
    }

    const loadZones = async () => {
        try {
            const allZones = await listZones()
            setZones(allZones || [])
        } catch (error) {
            console.error('Error loading zones:', error)
        }
    }

    const loadUsers = async () => {
        try {
            const allUsers = await listUsers()
            setUsers(allUsers || [])
            setFilteredUsers(allUsers || [])
        } catch (error) {
            console.error('Error loading users:', error)
        }
    }

    const handleUserSelect = (userId) => {
        const user = users.find(u => String(u.id) === String(userId))
        if (user) {
            setComplainantName(`${user.first_name || ''} ${user.last_name || ''}`.trim())
            setComplainantEmail(user.email || '')
            setSelectedUserId(userId)
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
            setFilteredUsers(filtered)
            setShowSuggestions(true)
        } else {
            setShowSuggestions(false)
        }
        setSelectedUserId('')
    }

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files)
        for (const file of files) {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = async (e) => {
                const newEvidence = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: e.target.result,
                    uploadedAt: new Date().toISOString(),
                    status: 'completed'
                }
                setEvidence(prev => [...prev, newEvidence])
            }
        }
        event.target.value = ''
    }

    const validateStep = (currentStep) => {
        const newErrors = {}
        if (currentStep === 1) {
            if (!title.trim()) newErrors.title = 'El título es obligatorio'
            if (!description.trim()) newErrors.description = 'La descripción es obligatoria'
        }
        if (currentStep === 2) {
            if (!complainant_name.trim()) newErrors.complainant_name = 'El nombre es obligatorio'
            if (!complainant_email.trim() && !complainant_phone_number.trim()) {
                newErrors.contact = 'Se requiere correo o teléfono'
            }
        }
        if (currentStep === 3 && !initial) {
            if (!zone) newErrors.zone = 'La zona es obligatoria'
            if (!address.trim()) newErrors.address = 'La dirección es obligatoria'
            if (!latlng) newErrors.location = 'Por favor, marque la ubicación en el mapa'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = (e) => {
        if (e) {
            e.preventDefault()
            e.stopPropagation()
        }
        if (validateStep(step)) setStep(step + 1)
    }

    const handleBack = () => setStep(step - 1)

    const handleSubmit = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (step !== 4) return
        if (!validateStep(step)) return
        setSaving(true)
        try {
            const zoneName = zones.find(z => z.id === parseInt(zone))?.name || ''
            const payload = {
                title: title.trim(),
                description: description.trim(),
                complainant_name: complainant_name.trim(),
                complainant_phone: `${complainant_phone_prefix}${complainant_phone_number.trim()}`,
                complainant_email: complainant_email.trim(),
                Id_zone: parseInt(zone),
                zone: zoneName,
                address: address.trim(),
                assignedOfficerId: assignedOfficerId || null,
                status: status.toLowerCase(),
                priority: priority.toLowerCase(),
                incidentDate,
                latitude: latlng ? latlng.lat : null,
                longitude: latlng ? latlng.lng : null,
                evidence: evidence.filter(item => item.status === 'completed')
            }
            await onSave(payload)
            onClose()
        } catch (error) {
            console.error('Error saving complaint:', error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <CModal size="lg" visible={visible} onClose={onClose} backdrop="static" keyboard={false}>
            <CModalHeader>
                <CModalTitle>{initial ? 'Editar Denuncia' : 'Nueva Denuncia'} - Paso {step} de 4</CModalTitle>
            </CModalHeader>
            <CForm onSubmit={handleSubmit}>
                <CModalBody style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                    {Object.keys(errors).length > 0 && (
                        <CAlert color="danger" className="mb-3">
                            <ul className="mb-0 small">
                                {Object.values(errors).map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                        </CAlert>
                    )}

                    {step === 1 && (
                        <>
                            <h6 className="mb-3 text-primary">Información de la Denuncia</h6>
                            <CFormSelect 
                                className="tour-complaint-form-crime"
                                label="Delito *" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                                required
                            >
                                <option value="">Seleccione un delito...</option>
                                {CRIME_TYPES.map(crime => (
                                    <option key={crime.id} value={crime.title}>
                                        {crime.title}
                                    </option>
                                ))}
                            </CFormSelect>
                            
                            {title && CRIME_TYPES.find(c => c.title === title) && (
                                <div className="mt-2 p-2 bg-light rounded text-muted small">
                                    <strong>Descripción del delito: </strong>
                                    {CRIME_TYPES.find(c => c.title === title).description}
                                </div>
                            )}

                            <CFormTextarea 
                                className="tour-complaint-form-description mt-3" 
                                label="Descripción de lo sucedido *" 
                                rows="4" 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                required 
                                placeholder="Escriba aquí los detalles del incidente..."
                            />
                            <CFormInput 
                                className="tour-complaint-form-date mt-3"
                                label="Fecha *" 
                                type="date" 
                                value={incidentDate} 
                                onChange={(e) => setIncidentDate(e.target.value)} 
                                required 
                            />
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h6 className="mb-3 text-primary">Información del Denunciante</h6>
                            <div style={{ position: 'relative' }}>
                                <CFormInput
                                    className="tour-complaint-form-name"
                                    label="Nombre Completo *"
                                    value={complainant_name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    onFocus={() => isAdminOrOfficer && complainant_name.length > 1 && setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    autoComplete="off"
                                />
                                {showSuggestions && filteredUsers.length > 0 && (
                                    <div className="position-absolute w-100 shadow border rounded bg-white" style={{ zIndex: 1050 }}>
                                        {filteredUsers.map(u => (
                                            <div key={u.id} className="p-2 border-bottom" style={{ cursor: 'pointer' }} onMouseDown={() => handleUserSelect(u.id)}>
                                                {u.first_name} {u.last_name} ({u.email})
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <CRow className="mt-3">
                                <CCol md={4}>
                                    <CFormSelect value={complainant_phone_prefix} onChange={(e) => setComplainantPhonePrefix(e.target.value)}>
                                        <option value="0414">0414</option>
                                        <option value="0424">0424</option>
                                        <option value="0412">0412</option>
                                        <option value="0416">0416</option>
                                        <option value="0426">0426</option>
                                    </CFormSelect>
                                </CCol>
                                <CCol md={8}>
                                    <CFormInput 
                                        className="tour-complaint-form-phone"
                                        placeholder="Teléfono" 
                                        value={complainant_phone_number} 
                                        onChange={(e) => setComplainantPhoneNumber(e.target.value.replace(/\D/g, '').substring(0, 7))} 
                                    />
                                </CCol>
                            </CRow>
                            <CFormInput 
                                className="tour-complaint-form-email mt-3"
                                label="Correo" 
                                type="email" 
                                value={complainant_email} 
                                onChange={(e) => setComplainantEmail(e.target.value)} 
                            />
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <h6 className="mb-3 text-primary">
                                <CIcon icon={cilLocationPin} className="me-2" />
                                Ubicación y Mapa
                                {initial && <CBadge color="info" className="ms-2" style={{ fontSize: '0.7rem' }}>Solo lectura</CBadge>}
                            </h6>
                            {initial && (
                                <CAlert color="info" className="mb-3 small">
                                    La ubicación no se puede modificar al editar una denuncia. Presione <strong>Siguiente</strong> para continuar.
                                </CAlert>
                            )}
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <CFormSelect 
                                        className="tour-complaint-form-zone"
                                        label="Zona *" 
                                        value={zone} 
                                        onChange={(e) => setZone(e.target.value)} 
                                        required 
                                        disabled={!!initial}
                                    >
                                        <option value="">Seleccione zona</option>
                                        {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                                    </CFormSelect>
                                </CCol>
                                <CCol md={6}>
                                    <CFormInput 
                                        className="tour-complaint-form-address"
                                        label="Dirección Escrita *" 
                                        value={address} 
                                        onChange={(e) => setAddress(e.target.value)} 
                                        placeholder="Ej: Carrera 10 con Calle 4" 
                                        required 
                                        disabled={!!initial} 
                                    />
                                </CCol>
                            </CRow>
                            
                            <div className="tour-complaint-form-map mt-3 border rounded shadow-sm overflow-hidden">
                                <div className="bg-light p-2 small border-bottom">
                                    <strong>{initial ? 'Ubicación registrada:' : 'Mapa Interactivo:'}</strong> {initial ? 'Esta es la ubicación original de la denuncia.' : 'Haga clic en el mapa para marcar el punto exacto de la denuncia.'}
                                </div>
                                <div style={{ height: '350px', width: '100%' }}>
                                    <MapContainer 
                                        center={latlng || defaultCenter} 
                                        zoom={14} 
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        {zones.map(z => (
                                            z.coordinates && z.coordinates.length > 2 && (
                                                <Polygon 
                                                    key={z.id} 
                                                    positions={z.coordinates} 
                                                    pathOptions={{ color: z.color || 'blue', weight: 2, fillOpacity: 0.2 }} 
                                                />
                                            )
                                        ))}
                                        {initial ? (
                                            latlng && <Marker position={latlng} />
                                        ) : (
                                            <LocationMarker 
                                                position={latlng} 
                                                setPosition={setLatlng} 
                                                zones={zones} 
                                                setZone={setZone} 
                                                setAddress={setAddress} 
                                            />
                                        )}
                                    </MapContainer>
                                </div>
                                {latlng && (
                                    <div className="p-2 bg-success bg-opacity-10 text-success small">
                                        <CIcon icon={cilLocationPin} className="me-1" />
                                        Coordenadas fijadas: {latlng.lat.toFixed(6)}, {latlng.lng.toFixed(6)}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {step === 4 && (
                        <>
                            <h6 className="mb-3 text-primary">Asignación y Evidencia</h6>
                            {userRole !== 'civil' && (
                                <CRow className="g-3">
                                    <CCol md={6}>
                                        <CFormSelect 
                                            className="tour-complaint-form-officer"
                                            label="Oficial" 
                                            value={assignedOfficerId} 
                                            onChange={(e) => setAssignedOfficerId(e.target.value)}
                                        >
                                            <option value="">Sin asignar</option>
                                            {officers.map(o => <option key={o.id} value={o.id}>{o.name} {o.lastName}</option>)}
                                        </CFormSelect>
                                    </CCol>
                                    <CCol md={3}>
                                        <CFormSelect 
                                            className="tour-complaint-form-priority"
                                            label="Prioridad" 
                                            value={priority} 
                                            onChange={(e) => setPriority(e.target.value)}
                                        >
                                            <option value="low">Baja</option>
                                            <option value="medium">Media</option>
                                            <option value="high">Alta</option>
                                            <option value="urgent">Urgente</option>
                                        </CFormSelect>
                                    </CCol>
                                    <CCol md={3}>
                                        <CFormSelect 
                                            className="tour-complaint-form-status"
                                            label="Estado" 
                                            value={status} 
                                            onChange={(e) => setStatus(e.target.value)}
                                        >
                                            <option value="received">Recibida</option>
                                            <option value="under_investigation">Investigación</option>
                                            <option value="resolved">Resuelta</option>
                                            <option value="closed">Cerrada</option>
                                            <option value="rejected">Rechazada</option>
                                        </CFormSelect>
                                    </CCol>
                                </CRow>
                            )}
                            <div className="mt-4">
                                <label className="form-label d-flex align-items-center">
                                    <CIcon icon={cilPaperclip} className="me-2" /> Adjuntar Evidencia
                                </label>
                                <CFormInput 
                                    className="tour-complaint-form-file"
                                    type="file" 
                                    multiple 
                                    onChange={handleFileUpload} 
                                />
                                {evidence.length > 0 && (
                                    <div className="mt-3">
                                        {evidence.map(f => (
                                            <div key={f.id} className="d-flex justify-content-between align-items-center mb-1 p-2 border rounded bg-light">
                                                <span className="small text-truncate">{f.name}</span>
                                                <CButton size="sm" color="danger" variant="outline" onClick={() => setEvidence(prev => prev.filter(e => e.id !== f.id))}>
                                                    <CIcon icon={cilTrash} />
                                                </CButton>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </CModalBody>
                <CModalFooter>
                    {step > 1 && <CButton type="button" color="secondary" onClick={handleBack}>Atrás</CButton>}
                    {step < 4 ? (
                        <CButton type="button" color="primary" onClick={handleNext}>Siguiente</CButton>
                    ) : (
                        <CButton type="submit" color="success" disabled={saving}>
                            {saving ? <CSpinner size="sm" /> : (initial ? 'Actualizar' : 'Crear')}
                        </CButton>
                    )}
                    <CButton type="button" color="light" onClick={onClose} className="ms-auto">Cancelar</CButton>
                </CModalFooter>
            </CForm>
        </CModal>
    )
}

export default ComplaintForm