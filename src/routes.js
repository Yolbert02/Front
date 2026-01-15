import { element, exact } from 'prop-types'
import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Welcome'))

const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

const Officers = React.lazy(() => import('./views/officers/Officers'))
const Complaints = React.lazy(() => import('./views/complaints/Complaints'))
const Users = React.lazy(() => import('./views/users/Users'))
const Profile = React.lazy(() => import('./views/profile/Profile'))
const Assignments = React.lazy(() => import('./views/assignments/Assignments'))
const Zones = React.lazy(() => import('./views/zones/Zones'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/widgets', name: 'Widgets', element: Widgets },
  { path: '/Officers', name: 'Officers', element: Officers },
  { path: '/Complaints', name: 'Complaints', element: Complaints, exact: true },
  { path: '/users', name: 'Users', element: Users, exact: true },
  { path: '/profile', name: 'Profile', element: Profile, exact: true },
  { path: '/assignments', name: 'Assignments', element: Assignments, exact: true },
  { path: '/Zones', name: 'Zones', element: Zones, exact: true }
]

export default routes
