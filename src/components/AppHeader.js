import React, { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilContrast,
  cilEnvelopeOpen,
  cilList,
  cilMenu,
  cilMoon,
  cilSun,
  cilShieldAlt,
} from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'

const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  useEffect(() => {
    const handleScroll = () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    }

    document.addEventListener('scroll', handleScroll)
    return () => document.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <CHeader position="sticky" className="mb-4 p-0 shadow-sm border-0" ref={headerRef} style={{ zIndex: 1030 }}>
      <div style={{ height: '4px', width: '100%', background: 'linear-gradient(90deg, #1a237e 0%, #0d47a1 100%)' }}></div>

      <CContainer className="border-bottom px-4 py-2" fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px', color: 'var(--cui-header-color)' }}
          className="border-0"
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        <CHeaderNav className="d-none d-md-flex align-items-center gap-4 ms-3">
          <CNavItem>
            <CNavLink
              to="/dashboard"
              as={NavLink}
              className="fw-semibold"
              style={({ isActive }) => ({
                fontWeight: isActive ? '700' : '500'
              })}
            >
              Dashboard
            </CNavLink>
          </CNavItem>
          {sessionStorage.getItem('user') && JSON.parse(sessionStorage.getItem('user')).role === 'administrator' && (
            <CNavItem>
              <CNavLink
                to="/users"
                as={NavLink}
                className="fw-semibold"
                style={({ isActive }) => ({
                  fontWeight: isActive ? '700' : '500'
                })}
              >
                Users
              </CNavLink>
            </CNavItem>
          )}
        </CHeaderNav>

        <CHeaderNav className="ms-auto">
        </CHeaderNav>

        <CHeaderNav className="align-items-center gap-2">
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-25"></div>
          </li>

          <CNavItem>
            <CNavLink
              as="button"
              type="button"
              className="px-2 border-0 bg-transparent text-secondary"
              onClick={() => setColorMode(colorMode === 'dark' ? 'light' : 'dark')}
              style={{ cursor: 'pointer' }}
              title={`Switch to ${colorMode === 'dark' ? 'light' : 'dark'} mode`}
            >
              <CIcon icon={colorMode === 'dark' ? cilSun : cilMoon} size="lg" />
            </CNavLink>
          </CNavItem>

          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-25"></div>
          </li>

          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
      <CContainer className="px-4 py-2 border-bottom" fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader