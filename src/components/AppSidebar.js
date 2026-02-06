import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'

import logo from 'src/assets/brand/Mylogo.png'
import navigation from '../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  // Filter navigation by role
  const userStr = sessionStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const userRole = user ? user.role : 'civil'

  const filteredNavigation = navigation.filter(item => {
    if (!item.roles) return true // Show if no roles defined
    return item.roles.includes(userRole)
  })

  return (
    <CSidebar
      className="border-end border-dark"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
      style={{
        background: 'linear-gradient(180deg, #0a0e23 0%, #1a237e 100%)',
        boxShadow: '4px 0 15px rgba(0,0,0,0.3)',
        borderRight: 'none'
      }}
    >
      <CSidebarHeader className="border-bottom border-secondary border-opacity-25 py-4 d-flex flex-column align-items-center">
        <CSidebarBrand to="/" className="text-decoration-none justify-content-center">
          <div className="sidebar-brand-full">
            <div className="d-flex flex-column align-items-center my-3">
              <div
                className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-lg mb-2"
                style={{
                  width: '100px',
                  height: '100px',
                  padding: '10px',
                  border: '3px solid rgba(255,255,255,0.2)'
                }}
              >
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    height: '100%',
                    width: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>
              <div className="text-center">
                <h6 className="m-0 fw-bolder text-white text-uppercase" style={{ letterSpacing: '2px' }}>POLICE DEPT</h6>
                <small className="text-white-50" style={{ fontSize: '0.7rem' }}>MANAGEMENT SYSTEM</small>
              </div>
            </div>
          </div>

          <div className="sidebar-brand-narrow">
            <div className="d-flex align-items-center justify-content-center my-2">
              <div
                className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow"
                style={{
                  width: '40px',
                  height: '40px',
                  padding: '4px',
                }}
              >
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    height: '100%',
                    width: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>
            </div>
          </div>

        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none position-absolute top-0 end-0 m-3 text-white"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>

      <AppSidebarNav items={filteredNavigation} />

      <CSidebarFooter className="border-top border-secondary border-opacity-25 d-none d-lg-flex justify-content-center py-2">
        <CSidebarToggler
          className="bg-transparent"
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar >
  )
}

export default React.memo(AppSidebar)