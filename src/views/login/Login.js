import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
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
import { cilLockLocked, cilUser } from '@coreui/icons'
import { login } from 'src/services/auth' // ✅ Importar el servicio actualizado

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!username.trim() || !password.trim()) {
      setError('Please complete all fields.')
      setLoading(false)
      return
    }

    try {
      const result = await login(username, password)
      
      if (result.success) {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Login error')
    } finally {
      setLoading(false)
    }
  }

  const fillDemoCredentials = (type) => {
    if (type === 'admin') {
      setUsername('admin')
      setPassword('admin123')
    } else if (type === 'user') {
      setUsername('user')
      setPassword('user123')
    }
    setError('')
  }

  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8} lg={6} xl={5}>
            <CCardGroup>
              <CCard className="p-4 shadow">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <div className="text-center mb-4">
                      <h2 className="text-primary">Sistema Judicial</h2>
                      <p className="text-body-secondary">Iniciar Sesión</p>
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
                        placeholder="Usuario" 
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                        placeholder="Contraseña"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </CInputGroup>
                    
                    <CRow>
                      <CCol xs={6}>
                        <CButton 
                          color="primary" 
                          className="px-4 w-100" 
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <CSpinner component="span" size="sm" className="me-2" />
                              Ingresando...
                            </>
                          ) : (
                            'Ingresar'
                          )}
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-end">
                        <small className="text-muted d-block">
                          Usuario: <strong>admin</strong>
                        </small>
                        <small className="text-muted">
                          Contraseña: <strong>admin123</strong>
                        </small>
                      </CCol>
                    </CRow>

                    <div className="mt-3 text-center">
                      <small className="text-muted">
                        ¿Primera vez? Prueba las credenciales de demo
                      </small>
                      <div className="d-flex gap-2 justify-content-center mt-2">
                        <CButton 
                          size="sm" 
                          color="outline-primary"
                          onClick={() => fillDemoCredentials('admin')}
                          disabled={loading}
                        >
                          Admin
                        </CButton>
                        <CButton 
                          size="sm" 
                          color="outline-secondary"
                          onClick={() => fillDemoCredentials('user')}
                          disabled={loading}
                        >
                          Usuario
                        </CButton>
                      </div>
                    </div>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login