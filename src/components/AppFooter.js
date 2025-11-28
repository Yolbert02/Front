import React from 'react'
import { CFooter, CContainer, CRow, CCol, CLink } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBalanceScale, cilShieldAlt } from '@coreui/icons'

const AppFooter = () => {
  const currentYear = new Date().getFullYear()

  return (
    <CFooter className="bg-light mt-auto border-top">
      <CContainer>
        <CRow className="py-3 align-items-center">
          <CCol md={6} className="mb-2 mb-md-0">
            <div className="d-flex align-items-center">
              <CIcon icon={cilBalanceScale} className="text-primary me-2" />
              <span className="fw-semibold">Sistema Judicial Integral</span>
            </div>
          </CCol>
          <CCol md={6} className="text-md-end">
            <div className="d-flex flex-column flex-md-row justify-content-md-end align-items-center small text-muted">
              <div className="d-flex align-items-center mb-2 mb-md-0 me-md-3">
                <CIcon icon={cilShieldAlt} className="me-1" />
                <span>Sistema Seguro</span>
              </div>
              <div>
                <span className="me-3">
                  &copy; {currentYear} Todos los derechos reservados
                </span>
                <CLink href="/privacy" className="text-decoration-none text-muted me-2">
                  Privacidad
                </CLink>
                <CLink href="/terms" className="text-decoration-none text-muted">
                  Términos
                </CLink>
              </div>
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </CFooter>
  )
}

export default AppFooter