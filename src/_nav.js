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
  cilMap,
  cilFindInPage,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    roles: ['administrator', 'oficial', 'functionary', 'civil']
  },
  {
    component: CNavItem,
    name: 'Officers',
    to: '/officers',
    icon: <CIcon icon={cilFindInPage} customClassName="nav-icon" />,
    roles: ['administrator', 'oficial', 'functionary']
  },
  {
    component: CNavItem,
    name: 'Complaints',
    to: '/complaints',
    icon: <CIcon icon={cilLibrary} customClassName="nav-icon" />,
    roles: ['administrator', 'oficial', 'functionary', 'civil']
  },
  {
    component: CNavItem,
    name: 'Assignments',
    to: '/assignments',
    icon: <CIcon icon={cilInstitution} customClassName="nav-icon" />,
    roles: ['administrator', 'oficial', 'functionary', 'civil']
  },
  {
    component: CNavItem,
    name: 'Zones',
    to: '/zones',
    icon: <CIcon icon={cilMap} customClassName="nav-icon" />,
    roles: ['administrator', 'oficial', 'functionary', 'civil']
  }
]

export default _nav
