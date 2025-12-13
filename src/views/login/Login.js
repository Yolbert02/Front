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
import { cilLockLocked, cilUser, cilShieldAlt, cilUserPlus } from '@coreui/icons'
import { login } from 'src/services/auth'
import { authStyles, containerStyles } from 'src/styles/darkModeStyles'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDemoInfo, setShowDemoInfo] = useState(false)

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
      setError(err.message || 'Error logging')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex flex-row align-items-center login-background" style={authStyles.container}>
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8} lg={6} xl={5}>
            <CCardGroup>
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
                      <h2 className="text-primary">Welcome</h2>
                      <p className="text-body-secondary">Login</p>
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
                        placeholder="Password"
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
                              Entering...
                            </>
                          ) : (
                            'Log in'
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
                          ¿Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>
                    <div className="text-center mt-3">
                      <CButton
                        color="outline-primary"
                        onClick={() => navigate('/register')}
                        className="w-100"
                        disabled={loading}
                      >
                        <CIcon icon={cilUserPlus} className="me-2" />
                        Create Account
                      </CButton>
                    </div>

                    {showDemoInfo && (
                      <div className="mt-3 p-3 rounded" style={containerStyles.lightBg}>
                        <h6 className="mb-2">
                          <CIcon icon={cilShieldAlt} className="me-2" />
                          Recover Password
                        </h6>
                        <div className="d-grid gap-2">
                          <CFormInput
                            placeholder="Email"
                            type="email"
                            autoComplete="email"
                            required
                          />
                          <CButton
                            color="primary"
                            disabled={loading}
                          >
                            Send recovery code
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