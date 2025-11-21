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
import { cilLockLocked, cilUser, cilShieldAlt } from '@coreui/icons'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDemoInfo, setShowDemoInfo] = useState(false)

  const navigate = useNavigate()


  const demoUsers = {
    admin: { username: 'admin', password: '1234', role: 'admin' }
  }

  const simulateLogin = (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulamos una verificación de credenciales
        if (username === demoUsers.admin.username && password === demoUsers.admin.password) {
          resolve({ 
            success: true, 
            user: { 
              name: 'Administrador', 
              role: 'admin',
              avatar: null
            } 
          })
        } {
          reject({ 
            success: false, 
            error: 'Incorrect credentials' 
          })
        }
      }, 1500)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validaciones 
    if (!username.trim() || !password.trim()) {
      setError('Please complete all fields.')
      setLoading(false)
      return
    }

    try {
      const result = await simulateLogin(username, password)
      
      if (result.success) {
        sessionStorage.setItem('isAuthenticated', 'true')
        sessionStorage.setItem('user', JSON.stringify(result.user))
        
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.error || 'Login error')
    } finally {
      setLoading(false)
    }
  }

  const fillDemoCredentials = (role) => {
    if (role === 'admin') {
      setUsername(demoUsers.admin.username)
      setPassword(demoUsers.admin.password)
    }
    setError('')
  }

  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center login-background">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8} lg={6} xl={5}>
            <CCardGroup>
              <CCard className="p-4 shadow">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <div className="text-center mb-4">
                      <img src="src/views/login/Mylogo.png" alt="Logo" className="mb-2"
                        style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                      />
                      <h2 className="text-primary">Welcome</h2>
                      <p className="text-body-secondary">Login</p>
                    </div>
                    {/* Errores */}
                    {error && (
                      <CAlert color="danger" className="py-2">
                        <small>{error}</small>
                      </CAlert>
                    )}
                    {/* Campo Usuario */}
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
                    {/* Contraseña */}
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
                    {/* Botones */}
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
                        <CButton 
                          color="link" 
                          className="px-0"
                          onClick={() => setShowDemoInfo(!showDemoInfo)}
                          disabled={loading}
                        >
                          Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>
                    {/* Recuperacion de contrasena*/}
                    {showDemoInfo && (
                      <div className="mt-3 p-3 bg-light rounded">
                        <h6 className="mb-2">Recover password</h6>
                        <div className="d-grid gap-2">
                          <CFormInput 
                        placeholder="Email" 
                        autoComplete="email"
                        required
                      />
                        <CButton 
                          color="primary" 
                          disabled={loading}
                        >
                          Send code
                        </CButton>
                        </div>
                      </div>
                    )}
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