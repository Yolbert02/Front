import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilExternalLink,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilUser,
  cilPeople,
  cilLibrary,
  cilInstitution,
  cilHome,
  cilFindInPage
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {component: CNavItem,
    name: 'Users',
    to: '/users',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Oficiales',
    to: '/officers',
    icon: <CIcon icon={cilFindInPage} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Complains',
    to: '/complaints',
    icon: <CIcon icon={cilLibrary} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Assignment Judgment',
    to: '/notification',
    icon: <CIcon icon={cilInstitution} customClassName="nav-icon" />,
  },
  {component: CNavItem,
    name: 'Login',
    to: '/Login',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
{component: CNavItem,
    name: 'Register',
    to: '/register',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  }
]

export default _nav
