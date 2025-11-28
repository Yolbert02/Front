import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
  cilAccountLogout,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import { getProfile } from 'src/services/profile'
import { logout } from 'src/services/auth'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
    
    const handleProfilePictureUpdate = (event) => {
      setProfile(prev => ({
        ...prev,
        profile_picture: event.detail.profilePicture
      }))
    }

    const handleProfileUpdate = (event) => {
      setProfile(prev => ({
        ...prev,
        ...event.detail
      }))
    }

    window.addEventListener('profilePictureUpdated', handleProfilePictureUpdate)
    window.addEventListener('profileUpdated', handleProfileUpdate)
    
    return () => {
      window.removeEventListener('profilePictureUpdated', handleProfilePictureUpdate)
      window.removeEventListener('profileUpdated', handleProfileUpdate)
    }
  }, [])

  const loadProfile = async () => {
    try {
      const data = await getProfile()
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile in dropdown:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Error during logout:', error)
      navigate('/login')
    }
  }

  const handleProfileClick = () => {
    navigate('/profile')
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        {profile?.profile_picture ? (
          <CAvatar 
            src={profile.profile_picture} 
            size="md"
            status="success"
            style={{ cursor: 'pointer' }}
          />
        ) : (
          <div 
            className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
            style={{ width: 40, height: 40 }}
          >
            <CIcon icon={cilUser} />
          </div>
        )}
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
          Cuenta
        </CDropdownHeader>
        <CDropdownItem className="d-flex align-items-center" disabled>
          <div className="d-flex align-items-center w-100">
            {profile?.profile_picture ? (
              <CAvatar 
                src={profile.profile_picture} 
                size="sm"
                className="me-2"
              />
            ) : (
              <div 
                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white me-2"
                style={{ width: 24, height: 24 }}
              >
                <CIcon icon={cilUser} size="sm" />
              </div>
            )}
            <div className="flex-grow-1">
              <div className="fw-semibold">
                {profile?.first_name} {profile?.last_name}
              </div>
              <small className="text-muted">{profile?.gmail}</small>
            </div>
          </div>
        </CDropdownItem>
        
        <CDropdownDivider />
        
        <CDropdownItem href="#">
          <CIcon icon={cilBell} className="me-2" />
          Actualizaciones
        </CDropdownItem>
        
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">
          Configuración
        </CDropdownHeader>
        
        <CDropdownItem 
          className="d-flex align-items-center"
          onClick={handleProfileClick}
          style={{ cursor: 'pointer' }}
        >
          <CIcon icon={cilUser} className="me-2" />
          Mi Perfil
        </CDropdownItem>
        
        <CDropdownItem href="#">
          <CIcon icon={cilSettings} className="me-2" />
          Configuración
        </CDropdownItem>

        <CDropdownDivider />
        
        <CDropdownItem 
          className="d-flex align-items-center text-danger"
          onClick={handleLogout}
          style={{ cursor: 'pointer' }}
        >
          <CIcon icon={cilAccountLogout} className="me-2" />
          Cerrar Sesión
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown