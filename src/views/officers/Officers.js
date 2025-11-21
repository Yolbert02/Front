import React, { useEffect, useState } from 'react'
import { 
    CButton, 
    CTable, 
    CTableHead, 
    CTableRow, 
    CTableHeaderCell, 
    CTableBody, 
    CTableDataCell, 
    CCard, 
    CCardBody,
    CCardHeader,
    CBadge,
    CContainer,
    CRow,
    CCol,
    CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons'
import OfficerForm from './OfficerForm'
import AvatarLetter from 'src/components/AvatarLetter'
import { listOfficers, createOfficer, updateOfficer, deleteOfficer } from 'src/services/officers'

const Officers = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)

    useEffect(() => { 
        console.log('Officers component mounted')
        fetchData() 
    }, [])

    async function fetchData() { 
        console.log('Fetching officers...')
        setLoading(true)
        try {
            const res = await listOfficers()
            console.log('Officers loaded:', res)
            setData(res || [])
        } catch (error) {
            console.error('Error fetching officers:', error)
            setData([])
        } finally {
            setLoading(false)
        }
    }

    async function handleSave(payload) {
        console.log('Saving officer:', payload)
        try {
            if (editing && editing.id) {
                await updateOfficer(editing.id, payload)
            } else {
                await createOfficer(payload)
            }
            setShowForm(false)
            setEditing(null)
            await fetchData()
        } catch (error) {
            console.error('Error saving officer:', error)
            alert('Error saving officer: ' + error.message)
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('Are you sure you want to delete this officer?')) return
        
        try {
            await deleteOfficer(id)
            await fetchData()
        } catch (error) {
            console.error('Error deleting officer:', error)
            alert('Error deleting officer: ' + error.message)
        }
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Active': { color: 'success', text: 'Active' },
            'Inactive': { color: 'danger', text: 'Inactive' },
            'Training': { color: 'warning', text: 'Training' },
            'Suspended': { color: 'secondary', text: 'Suspended' }
        }
        
        const config = statusConfig[status] || { color: 'secondary', text: status }
        return <CBadge color={config.color}>{config.text}</CBadge>
    }

    return (
        <CContainer fluid>
            <CRow>
                <CCol>
                    <CCard>
                        <CCardHeader>
                            <div className="d-flex justify-content-between align-items-center">
                                <h4 className="mb-0">Officers Management</h4>
                                <CButton 
                                    color="primary" 
                                    onClick={() => { 
                                        console.log('New officer button clicked')
                                        setEditing(null); 
                                        setShowForm(true) 
                                    }}
                                >
                                    <CIcon icon={cilPlus} className="me-2" />
                                    New Officer
                                </CButton>
                            </div>
                        </CCardHeader>
                        <CCardBody>
                            {loading ? (
                                <div className="text-center py-4">
                                    <CSpinner color="primary" />
                                    <div className="mt-2">Loading officers...</div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-3 text-muted">
                                        Showing {data.length} officer(s)
                                    </div>
                                    
                                    {data.length > 0 ? (
                                        <CTable hover responsive>
                                            <CTableHead>
                                                <CTableRow>
                                                    <CTableHeaderCell style={{ width: '70px' }}></CTableHeaderCell>
                                                    <CTableHeaderCell>ID</CTableHeaderCell>
                                                    <CTableHeaderCell>Name</CTableHeaderCell>
                                                    <CTableHeaderCell>Last Name</CTableHeaderCell>
                                                    <CTableHeaderCell>ID Number</CTableHeaderCell>
                                                    <CTableHeaderCell>Unit</CTableHeaderCell>
                                                    <CTableHeaderCell>Status</CTableHeaderCell>
                                                    <CTableHeaderCell style={{ width: '150px' }}>Actions</CTableHeaderCell>
                                                </CTableRow>
                                            </CTableHead>
                                            <CTableBody>
                                                {data.map(officer => (
                                                    <CTableRow key={officer.id}>
                                                        <CTableDataCell>
                                                            <AvatarLetter 
                                                                name={officer.name} 
                                                                lastName={officer.lastName} 
                                                            />
                                                        </CTableDataCell>
                                                        <CTableDataCell>#{officer.id}</CTableDataCell>
                                                        <CTableDataCell>
                                                            <strong>{officer.name}</strong>
                                                        </CTableDataCell>
                                                        <CTableDataCell>{officer.lastName || '-'}</CTableDataCell>
                                                        <CTableDataCell>{officer.idNumber || '-'}</CTableDataCell>
                                                        <CTableDataCell>{officer.unit}</CTableDataCell>
                                                        <CTableDataCell>
                                                            {getStatusBadge(officer.status)}
                                                        </CTableDataCell>
                                                        <CTableDataCell>
                                                            <div className="d-flex gap-2">
                                                                <CButton 
                                                                    size="sm" 
                                                                    color="primary" 
                                                                    variant="outline"
                                                                    onClick={() => { 
                                                                        console.log('Editing officer:', officer)
                                                                        setEditing(officer); 
                                                                        setShowForm(true) 
                                                                    }}
                                                                >
                                                                    <CIcon icon={cilPencil} />
                                                                </CButton>
                                                                <CButton 
                                                                    size="sm" 
                                                                    color="danger" 
                                                                    variant="outline"
                                                                    onClick={() => handleDelete(officer.id)}
                                                                >
                                                                    <CIcon icon={cilTrash} />
                                                                </CButton>
                                                            </div>
                                                        </CTableDataCell>
                                                    </CTableRow>
                                                ))}
                                            </CTableBody>
                                        </CTable>
                                    ) : (
                                        <div className="text-center py-5">
                                            <div className="text-muted">
                                                <h5>No officers found</h5>
                                                <p>Start by adding a new officer to the system.</p>
                                                <CButton 
                                                    color="primary" 
                                                    onClick={() => { 
                                                        setEditing(null); 
                                                        setShowForm(true) 
                                                    }}
                                                >
                                                    Add First Officer
                                                </CButton>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <OfficerForm 
                visible={showForm} 
                onClose={() => {
                    console.log('Closing form')
                    setShowForm(false)
                    setEditing(null)
                }} 
                onSave={handleSave} 
                initial={editing} 
            />
        </CContainer>
    )
}

export default Officers