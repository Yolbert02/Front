import React, { useState } from 'react'
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

const Register = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    email: '',
    documentPrefix: 'V',
    documentNumber: '',
    document: '',
    phonePrefix: '0414',
    phoneNumber: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const validate = () => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!formData.first_name.trim()) return 'First name is required';
    if (!nameRegex.test(formData.first_name)) return 'First name cannot contain numbers';
    if (!formData.last_name.trim()) return 'Last name is required';
    if (!nameRegex.test(formData.last_name)) return 'Last name cannot contain numbers';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';
    
    if (!formData.documentNumber.trim()) return 'Document is required';
    if (formData.documentNumber.length < 7 || formData.documentNumber.length > 8) return 'Document must be between 7 and 8 digits';
    
    if (!formData.phoneNumber.trim()) return 'Phone number is required';
    if (!/^\d{7}$/.test(formData.phoneNumber)) return 'Phone number must be exactly 7 digits';
    
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true)

    try {
      setTimeout(() => {
        alert('Registration successful!')
        navigate('/login')
      }, 1000)

    } catch (err) {
      setError('Registration error')
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    let cleanedValue = value;
    
    // Auto-clean names
    if (field === 'first_name' || field === 'last_name') {
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
                    <h2 className="text-primary">Create Account</h2>
                    <p className="text-body-secondary">User Registration</p>
                  </div>

                  {error && (
                    <CAlert color="danger" className="py-2">
                      <small>{error}</small>
                    </CAlert>
                  )}

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="First Name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      disabled={loading}
                      required
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Last Name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      disabled={loading}
                      required
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilEnvelopeClosed} />
                    </CInputGroupText>
                    <CFormInput
                      type="email"
                      placeholder="Email"
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
                      placeholder="Document (7-8 digits)"
                      value={formData.documentNumber}
                      onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                      disabled={loading}
                      required
                    />
                  </CInputGroup>

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
                      placeholder="Phone Number (7 digits)"
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
                      placeholder="Password"
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
                      placeholder="Confirm Password"
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
                        'Create Account'
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
                      Return Login
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