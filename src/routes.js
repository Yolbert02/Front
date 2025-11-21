import { element, exact } from 'prop-types'
import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

const Officers = React.lazy(() => import('./views/officers/Officers'))
const Complaints = React.lazy(() => import('./views/complaints/Complaints'))
const Users = React.lazy(() => import('./views/users/Users'))
const Profile = React.lazy(() => import('./views/profile/Profile'))
const Notifications = React.lazy(() => import('./views/notification/Notifications'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/widgets', name: 'Widgets', element: Widgets },
  { path: '/Officers', name: 'Officers', element: Officers  },
  { path: '/Complaints', name: 'Complaints', element: Complaints, exact: true  },
  { path: '/users', name: 'Users', element: Users, exact: true },
  { path: '/profile', name: 'Profile', element: Profile, exact: true },
  { path: '/notification', name: 'Notifications', element: Notifications, exact: true }
]

export default routes
