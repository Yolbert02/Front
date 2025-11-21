import React from 'react'
import { CAvatar } from '@coreui/react'

const AvatarLetter = ({ name = '', lastName = '', src, color = 'primary', textColor = 'white', size }) => {
  const initials = `${(name || '').trim()[0] || ''}${(lastName || '').trim()[0] || ''}`.toUpperCase()
  if (src) {
    return <CAvatar src={src} size={size} />
  }
  return (
    <CAvatar color={color} textColor={textColor} size={size}>
      {initials || 'U'}
    </CAvatar>
  )
}

export default AvatarLetter
