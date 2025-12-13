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
    CImage
} from '@coreui/react'
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
        } catch (error) {
            console.error('Error loading profile:', error)
            setMessage({ type: 'danger', text: 'Error loading profile' })
        } finally {
            setLoading(false)
        }
    }

    const handleProfilePictureChange = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'danger', text: 'Please select an image file' })
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'danger', text: 'Image size should be less than 5MB' })
            return
        }

        try {
            setSaving(true)
            const reader = new FileReader()
            reader.onload = async (e) => {
                const imageData = e.target.result
                const updatedProfile = await updateProfilePicture(imageData)
                setProfile(updatedProfile)
                setMessage({ type: 'success', text: 'Profile picture updated successfully' })
            }
            reader.readAsDataURL(file)
        } catch (error) {
            console.error('Error updating profile picture:', error)
            setMessage({ type: 'danger', text: 'Error updating profile picture' })
        } finally {
            setSaving(false)
        }
    }

    const handleSaveProfile = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            const updatedProfile = await updateProfile(formData)
            setProfile(updatedProfile)
            setMessage({ type: 'success', text: 'Profile updated successfully' })
        } catch (error) {
            console.error('Error updating profile:', error)
            setMessage({ type: 'danger', text: 'Error updating profile' })
        } finally {
            setSaving(false)
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'danger', text: 'New passwords do not match' })
            return
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'danger', text: 'Password must be at least 6 characters' })
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
            setMessage({ type: 'danger', text: 'Error changing password' })
        } finally {
            setSaving(false)
        }
    }

    const getRoleBadge = (role) => {
        const roleConfig = {
            'administrador': { color: 'danger', text: 'Administrator' },
            'oficial': { color: 'primary', text: 'Officer' },
            'funcionario': { color: 'info', text: 'Official' },
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
                    <div className="mt-3">Loading profile...</div>
                </div>
            </CContainer>
        )
    }

    return (
        <CContainer fluid>
            <CRow>
                <CCol lg={4} md={12}>
                    <CCard className="mb-4">
                        <CCardBody className="text-center">
                            <div className="position-relative d-inline-block">
                                {profile?.profile_picture ? (
                                    <CImage
                                        src={profile.profile_picture}
                                        alt="Profile"
                                        className="rounded-circle mb-3"
                                        width={150}
                                        height={150}
                                        style={{ objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div
                                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white mb-3 mx-auto"
                                        style={{ width: 150, height: 150 }}
                                    >
                                        <CIcon icon={cilUser} size="3xl" />
                                    </div>
                                )}
                                <label
                                    htmlFor="profile-picture-upload"
                                    className="btn btn-primary btn-sm rounded-circle position-absolute"
                                    style={{ bottom: '20px', right: '20px', cursor: 'pointer' }}
                                    title="Change profile picture"
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
                                <p><strong>Document:</strong> {profile?.document}</p>
                                <p><strong>Phone:</strong> {profile?.number_phone}</p>
                                <p><strong>Department:</strong> {profile?.department || 'Not specified'}</p>
                                <p><strong>Location:</strong> {profile?.location || 'Not specified'}</p>
                                <p><strong>Member since:</strong> {profile?.join_date || '2024'}</p>
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
                                >
                                    <CIcon icon={cilUser} className="me-2" />
                                    Personal Information
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
                                    <h5 className="mb-4">Personal Information</h5>

                                    <CRow className="g-3">
                                        <CCol md={6}>
                                            <CFormInput
                                                label="First Name *"
                                                value={formData.first_name || ''}
                                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                required
                                            />
                                        </CCol>
                                        <CCol md={6}>
                                            <CFormInput
                                                label="Last Name *"
                                                value={formData.last_name || ''}
                                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                required
                                            />
                                        </CCol>
                                    </CRow>
                                    <CRow className="g-3 mt-2">
                                        <CCol md={6}>
                                            <CFormInput
                                                label="Email *"
                                                type="email"
                                                value={formData.gmail || ''}
                                                onChange={(e) => setFormData({ ...formData, gmail: e.target.value })}
                                                required
                                            />
                                        </CCol>
                                        <CCol md={6}>
                                            <CFormInput
                                                label="Phone Number"
                                                value={formData.number_phone || ''}
                                                onChange={(e) => setFormData({ ...formData, number_phone: e.target.value })}
                                            />
                                        </CCol>
                                    </CRow>
                                    <div className="mt-3">
                                        <CFormInput
                                            label="Department"
                                            value={formData.department || ''}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            placeholder="Your department or unit"
                                        />
                                    </div>
                                    <div className="mt-3">
                                        <CFormInput
                                            label="Location"
                                            value={formData.location || ''}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="Your city and country"
                                        />
                                    </div>
                                    <div className="mt-3">
                                        <CFormTextarea
                                            label="Bio"
                                            rows="3"
                                            value={formData.bio || ''}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>
                                    <div className="mt-4">
                                        <CButton type="submit" color="primary" disabled={saving}>
                                            {saving ? <CSpinner size="sm" /> : <CIcon icon={cilSave} />}
                                            {saving ? ' Saving...' : ' Save Changes'}
                                        </CButton>
                                    </div>
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