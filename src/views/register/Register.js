import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
  CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilEnvelopeClosed, cilArrowLeft } from '@coreui/icons'
import { authStyles } from 'src/styles/darkModeStyles'
import { checkDniExists, listUsers } from 'src/services/users'

const Register = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    email: '',
    documentPrefix: 'V',
    documentNumber: '',
    document: '',
    phonePrefix: '0414',
    phoneNumber: ''
  })
  const [error, setError] = useState('')
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)
  const [dniStatus, setDniStatus] = useState(null) // null | 'checking' | 'exists' | 'available'
  const [dniOwner, setDniOwner] = useState('')
  const dniCheckTimeout = useRef(null)

  const navigate = useNavigate()

  const validate = () => {
    const newErrors = [];
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!formData.primer_nombre.trim()) newErrors.push('El primer nombre es obligatorio');
    else if (!nameRegex.test(formData.primer_nombre)) newErrors.push('El primer nombre no puede contener números');
    
    if (formData.segundo_nombre.trim() && !nameRegex.test(formData.segundo_nombre)) newErrors.push('El segundo nombre no puede contener números');

    if (!formData.primer_apellido.trim()) newErrors.push('El primer apellido es obligatorio');
    else if (!nameRegex.test(formData.primer_apellido)) newErrors.push('El primer apellido no puede contener números');

    if (formData.segundo_apellido.trim() && !nameRegex.test(formData.segundo_apellido)) newErrors.push('El segundo apellido no puede contener números');
    
    if (!formData.email.trim()) newErrors.push('El correo electrónico es obligatorio');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.push('Formato de correo electrónico no válido');
    
    if (!formData.documentNumber.trim()) newErrors.push('El documento es obligatorio');
    else if (formData.documentNumber.length < 7 || formData.documentNumber.length > 8) newErrors.push('El documento debe tener entre 7 y 8 dígitos');
    else if (dniStatus === 'exists') newErrors.push('Esta cédula ya está registrada en el sistema');
    
    if (!formData.phoneNumber.trim()) newErrors.push('El número de teléfono es obligatorio');
    else if (!/^\d{7}$/.test(formData.phoneNumber)) newErrors.push('El número de teléfono debe tener exactamente 7 dígitos');
    
    if (!formData.password) newErrors.push('La contraseña es obligatoria');
    else if (formData.password.length < 6) newErrors.push('La contraseña debe tener al menos 6 caracteres');
    
    if (formData.password !== formData.confirmPassword) newErrors.push('Las contraseñas no coinciden');
    
    setErrors(newErrors);
    return newErrors.length === 0;
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    
    if (!validate()) {
      return;
    }

    setLoading(true)

    try {
      setTimeout(() => {
        alert('¡Registro exitoso!')
        navigate('/login')
      }, 1000)

    } catch (err) {
      setError('Error en el registro')
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    let cleanedValue = value;
    
    // Auto-clean names
    if (['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido'].includes(field)) {
      cleanedValue = value.replace(/[0-9]/g, '');
    }
    
    // Auto-clean document number
    if (field === 'documentNumber') {
      cleanedValue = value.replace(/\D/g, '').substring(0, 8);
    }

    // Auto-clean phone number
    if (field === 'phoneNumber') {
      cleanedValue = value.replace(/\D/g, '').substring(0, 7);
    }

    setFormData(prev => ({
      ...prev,
      [field]: cleanedValue
    }))

    // Real-time DNI check
    if (field === 'documentNumber' || field === 'documentPrefix') {
      const docNum = field === 'documentNumber' ? cleanedValue : formData.documentNumber;
      const docPrefix = field === 'documentPrefix' ? cleanedValue : formData.documentPrefix;
      
      if (dniCheckTimeout.current) clearTimeout(dniCheckTimeout.current);
      
      if (docNum.length >= 7 && docNum.length <= 8) {
        setDniStatus('checking');
        dniCheckTimeout.current = setTimeout(async () => {
          const docPrefix = field === 'documentPrefix' ? cleanedValue : formData.documentPrefix;
          const docNumVal = field === 'documentNumber' ? cleanedValue : formData.documentNumber;
          const fullDni = `${docPrefix}-${docNumVal}`;
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
            setDniOwner(ownerName || 'Usuario Registrado');
          } else {
            setDniOwner('');
          }
        }, 500);
      } else {
        setDniStatus(null);
        setDniOwner('');
      }
    }
  }

  return (
    <div className="min-vh-100 d-flex flex-row align-items-center" style={authStyles.container}>
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8} lg={6} xl={5}>
            <CCard className="p-4 shadow" style={authStyles.card}>
              <CCardBody style={authStyles.cardBody}>
                <CForm onSubmit={handleSubmit}>
                  <div className="text-center mb-4">
                    <img
                      src="/newicon.png"
                      alt="Logo"
                      className="mb-2"
                      style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                    <h2 className="text-primary">Crear Cuenta</h2>
                    <p className="text-body-secondary">Registro de Usuario</p>
                  </div>

                  {errors.length > 0 && (
                    <CAlert color="danger" className="py-2 mb-4">
                      <ul className="mb-0 small">
                        {errors.map((err, index) => (
                          <li key={index}>{err}</li>
                        ))}
                      </ul>
                    </CAlert>
                  )}

                  <CRow className="g-2 mb-3">
                    <CCol xs={6}>
                      <CInputGroup>
                        <CInputGroupText>
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Primer Nombre *"
                          value={formData.primer_nombre}
                          onChange={(e) => handleInputChange('primer_nombre', e.target.value)}
                          disabled={loading}
                          required
                        />
                      </CInputGroup>
                    </CCol>
                    <CCol xs={6}>
                      <CFormInput
                        placeholder="Segundo Nombre"
                        value={formData.segundo_nombre}
                        onChange={(e) => handleInputChange('segundo_nombre', e.target.value)}
                        disabled={loading}
                      />
                    </CCol>
                  </CRow>

                  <CRow className="g-2 mb-3">
                    <CCol xs={6}>
                      <CInputGroup>
                        <CInputGroupText>
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Primer Apellido *"
                          value={formData.primer_apellido}
                          onChange={(e) => handleInputChange('primer_apellido', e.target.value)}
                          disabled={loading}
                          required
                        />
                      </CInputGroup>
                    </CCol>
                    <CCol xs={6}>
                      <CFormInput
                        placeholder="Segundo Apellido"
                        value={formData.segundo_apellido}
                        onChange={(e) => handleInputChange('segundo_apellido', e.target.value)}
                        disabled={loading}
                      />
                    </CCol>
                  </CRow>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilEnvelopeClosed} />
                    </CInputGroupText>
                    <CFormInput
                      type="email"
                      placeholder="Correo Electrónico"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={loading}
                      required
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CFormSelect
                      style={{ maxWidth: '70px' }}
                      value={formData.documentPrefix}
                      onChange={(e) => handleInputChange('documentPrefix', e.target.value)}
                      disabled={loading}
                    >
                      <option value="V">V</option>
                      <option value="E">E</option>
                    </CFormSelect>
                    <CFormInput
                      placeholder="Documento (7-8 dígitos)"
                      value={formData.documentNumber}
                      onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                      disabled={loading}
                      required
                    />
                  </CInputGroup>
                  {dniStatus === 'checking' && (
                    <div className="text-muted small mb-2" style={{ marginTop: '-8px' }}>
                      <CSpinner size="sm" className="me-1" /> Verificando cédula...
                    </div>
                  )}
                  {dniStatus === 'exists' && (
                    <div className="text-danger small mb-2" style={{ marginTop: '-8px' }}>
                      ⚠️ Esta cédula ya está registrada (Pertenece a: <strong>{dniOwner || 'Desconocido'}</strong>)
                    </div>
                  )}
                  {dniStatus === 'available' && (
                    <div className="text-success small mb-2" style={{ marginTop: '-8px' }}>
                      ✅ Cédula disponible
                    </div>
                  )}

                  <CInputGroup className="mb-3">
                    <CFormSelect
                      style={{ maxWidth: '100px' }}
                      value={formData.phonePrefix}
                      onChange={(e) => handleInputChange('phonePrefix', e.target.value)}
                      disabled={loading}
                    >
                      <option value="0414">0414</option>
                      <option value="0424">0424</option>
                      <option value="0412">0412</option>
                      <option value="0416">0416</option>
                      <option value="0426">0426</option>
                    </CFormSelect>
                    <CFormInput
                      placeholder="Número de Teléfono (7 dígitos)"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      disabled={loading}
                      required
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Contraseña"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      disabled={loading}
                      required
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Confirmar Contraseña"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      disabled={loading}
                      required
                    />
                  </CInputGroup>

                  <div className="d-grid mb-3">
                    <CButton
                      color="primary"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <CSpinner component="span" size="sm" className="me-2" />
                          Registrando...
                        </>
                      ) : (
                        'Crear Cuenta'
                      )}
                    </CButton>
                  </div>

                  <div className="text-center">
                    <CButton
                      color="link"
                      onClick={() => navigate('/login')}
                      disabled={loading}
                    >
                      <CIcon icon={cilArrowLeft} className="me-2" />
                      Volver al Inicio de Sesión
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register