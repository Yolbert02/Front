import React, { useEffect, useState } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CContainer,
    CRow,
    CCol,
    CButton,
    CForm,
    CFormInput,
    CFormTextarea,
    CFormSwitch,
    CAlert,
    CSpinner,
    CBadge,
    CImage,
    CFormSelect
} from '@coreui/react'
import { colorbutton } from 'src/styles/darkModeStyles'
import CIcon from '@coreui/icons-react'
import { cilUser, cilCamera, cilSave, cilLockLocked, cilBell, cilShieldAlt } from '@coreui/icons'
import { getProfile, updateProfile, updateProfilePicture, changePassword } from 'src/services/profile'

const Profile = () => {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('personal')
    const [message, setMessage] = useState({ type: '', text: '' })
    const [formData, setFormData] = useState({})
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [phonePrefix, setPhonePrefix] = useState('0414')
    const [phoneNumber, setPhoneNumber] = useState('')

    useEffect(() => {
        loadProfileData()
    }, [])

    const loadProfileData = async () => {
        setLoading(true)
        try {
            const data = await getProfile()
            setProfile(data)
            setFormData({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                gmail: data.gmail || '',
                number_phone: data.number_phone || '',
                bio: data.bio || '',
                department: data.department || '',
                location: data.location || '',
            })

            // Parse initial phone
            const initialPhone = data.number_phone || ''
            const prefixMatch = initialPhone.match(/^(0414|0424|0412|0416|0426)/)
            if (prefixMatch) {
                setPhonePrefix(prefixMatch[0])
                setPhoneNumber(initialPhone.substring(prefixMatch[0].length))
            } else {
                setPhonePrefix('0414')
                setPhoneNumber(initialPhone)
            }
        } catch (error) {
            console.error('Error loading profile:', error)
            setMessage({ type: 'danger', text: 'Error al cargar el perfil' })
        } finally {
            setLoading(false)
        }
    }

    const handleProfilePictureChange = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'danger', text: 'Por favor, seleccione un archivo de imagen' })
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'danger', text: 'El tamaño de la imagen debe ser inferior a 5MB' })
            return
        }

        try {
            setSaving(true)
            const reader = new FileReader()
            reader.onload = async (e) => {
                const imageData = e.target.result
                const updatedProfile = await updateProfilePicture(imageData)
                setProfile(updatedProfile)
                setMessage({ type: 'success', text: 'Foto de perfil actualizada con éxito' })
            }
            reader.readAsDataURL(file)
        } catch (error) {
            console.error('Error updating profile picture:', error)
            setMessage({ type: 'danger', text: 'Error al actualizar la foto de perfil' })
        } finally {
            setSaving(false)
        }
    }

    const handleSaveProfile = async (e) => {
        e.preventDefault()
        
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        if (formData.first_name && !nameRegex.test(formData.first_name.trim())) {
            setMessage({ type: 'danger', text: 'El nombre no puede contener números' })
            return
        }
        if (formData.last_name && !nameRegex.test(formData.last_name.trim())) {
            setMessage({ type: 'danger', text: 'El apellido no puede contener números' })
            return
        }

        if (phoneNumber && !/^\d{7}$/.test(phoneNumber.trim())) {
            setMessage({ type: 'danger', text: 'El número de teléfono debe tener exactamente 7 dígitos' })
            return
        }

        setSaving(true)
        setMessage({ type: '', text: '' })

        try {
            const dataToSave = {
                ...formData,
                number_phone: `${phonePrefix}${phoneNumber.trim()}`
            }
            const updatedProfile = await updateProfile(dataToSave)
            setProfile(updatedProfile)
            setMessage({ type: 'success', text: 'Perfil actualizado con éxito' })
        } catch (error) {
            console.error('Error updating profile:', error)
            setMessage({ type: 'danger', text: 'Error al actualizar el perfil' })
        } finally {
            setSaving(false)
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'danger', text: 'Las nuevas contraseñas no coinciden' })
            return
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'danger', text: 'La contraseña debe tener al menos 6 caracteres' })
            return
        }

        setSaving(true)
        try {
            const result = await changePassword(passwordData.currentPassword, passwordData.newPassword)
            setMessage({ type: 'success', text: result.message })
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })
        } catch (error) {
            console.error('Error changing password:', error)
            setMessage({ type: 'danger', text: 'Error al cambiar la contraseña' })
        } finally {
            setSaving(false)
        }
    }

    const getRoleBadge = (role) => {
        const roleConfig = {
            'administrador': { color: 'danger', text: 'Administrador' },
            'oficial': { color: 'primary', text: 'Oficial' },
            'funcionario': { color: 'info', text: 'Funcionario' },
            'civil': { color: 'success', text: 'Civil' }
        }

        const config = roleConfig[role] || { color: 'secondary', text: role }
        return <CBadge color={config.color}>{config.text}</CBadge>
    }

    if (loading) {
        return (
            <CContainer fluid>
                <div className="text-center py-5">
                    <CSpinner color="primary" />
                    <div className="mt-3">Cargando perfil...</div>
                </div>
            </CContainer>
        )
    }

    return (
        <CContainer fluid>
            <CRow>
                <CCol lg={4} md={12}>
                    <CCard className="mb-4 tour-profile-card">
                        <CCardBody className="text-center">
                            <div className="position-relative d-inline-block">
                                <div className="position-relative">
                                    <div className="rounded-circle p-1 mb-3 mx-auto" style={{
                                        width: 158,
                                        height: 158,
                                        background: 'linear-gradient(45deg, #1a237e, #0d47a1)',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
                                    }}>
                                        {profile?.profile_picture ? (
                                            <div
                                                className="rounded-circle"
                                                style={{
                                                    width: '150px',
                                                    height: '150px',
                                                    backgroundImage: `url(${profile.profile_picture})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    border: '3px solid white'
                                                }}
                                            />
                                        ) : (
                                            <div
                                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                                                style={{ width: 150, height: 150, border: '3px solid white' }}
                                            >
                                                <CIcon icon={cilUser} size="3xl" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <label
                                    htmlFor="profile-picture-upload"
                                    className="btn btn-primary btn-sm rounded-circle position-absolute"
                                    style={{ bottom: '20px', right: '20px', cursor: 'pointer' }}
                                    title="Cambiar foto de perfil"
                                >
                                    <CIcon icon={cilCamera} />
                                    <input
                                        id="profile-picture-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfilePictureChange}
                                        style={{ display: 'none' }}
                                        disabled={saving}
                                    />
                                </label>
                            </div>

                            <h4>{profile?.first_name} {profile?.last_name}</h4>
                            <p className="text-muted">{profile?.gmail}</p>
                            {profile?.role && getRoleBadge(profile.role)}

                            <div className="mt-3 text-start">
                                <p><strong>Documento:</strong> {profile?.document}</p>
                                <p><strong>Teléfono:</strong> {profile?.number_phone}</p>
                                <p><strong>Departamento:</strong> {profile?.department || 'No especificado'}</p>
                                <p><strong>Ubicación:</strong> {profile?.location || 'No especificado'}</p>
                                <p><strong>Miembro desde:</strong> {profile?.join_date || '2024'}</p>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>

                <CCol lg={8} md={12}>
                    <CCard>
                        <CCardHeader>
                            <div className="d-flex border-bottom">
                                <CButton
                                    color="link"
                                    className={`me-3 ${activeTab === 'personal' ? 'text-primary border-primary border-bottom' : 'text-muted'}`}
                                    onClick={() => setActiveTab('personal')}
                                    style={{ textDecoration: 'none', borderRadius: 0 }}
                                >
                                    <CIcon icon={cilUser} className="me-2" />
                                    Información Personal
                                </CButton>
                                <CButton
                                    color="link"
                                    className={`${activeTab === 'security' ? 'text-primary border-primary border-bottom' : 'text-muted'}`}
                                    onClick={() => setActiveTab('security')}
                                    style={{ textDecoration: 'none', borderRadius: 0 }}
                                >
                                    <CIcon icon={cilLockLocked} className="me-2" />
                                    Seguridad
                                </CButton>
                            </div>
                        </CCardHeader>

                        <CCardBody>
                            {message.text && (
                                <CAlert color={message.type} className="mb-3">
                                    {message.text}
                                </CAlert>
                            )}
                            {activeTab === 'personal' && (
                                <CForm onSubmit={handleSaveProfile}>
                                    <h5 className="mb-4">Información Personal</h5>

                                    <CRow className="g-3">
                                        <CCol md={6}>
                                            <CFormInput
                                                label="Nombre *"
                                                value={formData.first_name || ''}
                                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value.replace(/[0-9]/g, '') })}
                                                required
                                            />
                                        </CCol>
                                        <CCol md={6}>
                                            <CFormInput
                                                label="Apellido *"
                                                value={formData.last_name || ''}
                                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value.replace(/[0-9]/g, '') })}
                                                required
                                            />
                                        </CCol>
                                    </CRow>
                                    <CRow className="g-3 mt-2">
                                        <CCol md={6}>
                                            <CFormInput
                                                label="Correo Electrónico *"
                                                type="email"
                                                value={formData.gmail || ''}
                                                onChange={(e) => setFormData({ ...formData, gmail: e.target.value })}
                                                required
                                            />
                                        </CCol>
                                        <CCol md={6}>
                                            <div className="mb-3">
                                                <label className="form-label">Número de Teléfono</label>
                                                <div className="input-group">
                                                    <CFormSelect
                                                        style={{ maxWidth: '100px' }}
                                                        value={phonePrefix}
                                                        onChange={(e) => setPhonePrefix(e.target.value)}
                                                    >
                                                        <option value="0414">0414</option>
                                                        <option value="0424">0424</option>
                                                        <option value="0412">0412</option>
                                                        <option value="0416">0416</option>
                                                        <option value="0426">0426</option>
                                                    </CFormSelect>
                                                    <CFormInput
                                                        placeholder="1234567"
                                                        value={phoneNumber}
                                                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').substring(0, 7))}
                                                    />
                                                </div>
                                            </div>
                                        </CCol>
                                    </CRow>
                                    <div className="mt-3">
                                        <CFormInput
                                            label="Departamento"
                                            value={formData.department || ''}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            placeholder="Su departamento o unidad"
                                        />
                                    </div>
                                    <div className="mt-3">
                                        <CFormInput
                                            label="Ubicación"
                                            value={formData.location || ''}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="Su ciudad y país"
                                        />
                                    </div>
                                    <div className="mt-3">
                                        <CFormTextarea
                                            label="Biografía"
                                            rows="3"
                                            value={formData.bio || ''}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            placeholder="Cuéntanos sobre ti..."
                                        />
                                    </div>
                                    <div className="mt-4">
                                        <CButton 
                                            type="submit" 
                                            color="primary colorbutton" 
                                            style={colorbutton}
                                            disabled={saving}
                                            shape="rounded-pill"
                                            className="px-4 py-2"
                                        >
                                            {saving ? <CSpinner size="sm" /> : <CIcon icon={cilSave} className="me-2" />}
                                            {saving ? ' Guardando...' : ' Guardar Cambios'}
                                        </CButton>
                                    </div>
                                </CForm>
                            )}
                            {activeTab === 'security' && (
                                <CForm onSubmit={handleChangePassword}>
                                    <h5 className="mb-4">Ajustes de Seguridad</h5>
                                    <div className="mb-3">
                                        <CFormInput
                                            type="password"
                                            label="Contraseña Actual"
                                            placeholder="Ingrese su contraseña actual"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <CFormInput
                                            type="password"
                                            label="Nueva Contraseña"
                                            placeholder="Mínimo 6 caracteres"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <CFormInput
                                            type="password"
                                            label="Confirmar Nueva Contraseña"
                                            placeholder="Repita su nueva contraseña"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <CButton type="submit" color="primary" disabled={saving} style={{
                                        background: 'linear-gradient(45deg, #1a237e, #0d47a1)',
                                        border: 'none',
                                        borderRadius: '50px',
                                        padding: '10px 25px'
                                    }}>
                                        {saving ? <CSpinner size="sm" /> : <CIcon icon={cilSave} className="me-2" />}
                                        {saving ? ' Actualizando...' : ' Cambiar Contraseña'}
                                    </CButton>
                                </CForm>
                            )}
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </CContainer>
    )
}

export default Profile