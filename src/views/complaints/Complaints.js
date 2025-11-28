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
import { cilPlus, cilPencil, cilTrash, cilInfo } from '@coreui/icons'
import ComplaintForm from './ComplaintForm'
import InfoComplaint from './InfoComplaint'
import { listComplaints, createComplaint, updateComplaint, deleteComplaint } from 'src/services/complaints'
import ConfirmationModal from 'src/components/ConfirmationModal'

const Complaints = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [showInfo, setShowInfo] = useState(false)
    const [editing, setEditing] = useState(null)
    const [selectedComplaint, setSelectedComplaint] = useState(null)

    const [deleteModal, setDeleteModal] = useState({
        visible: false,
        complaintId: null,
        complaintTitle: ''
    })

    useEffect(() => { 
        console.log('Complaints component mounted')
        fetchData() 
    }, [])

    async function fetchData() { 
        console.log('Fetching complaints...')
        setLoading(true)
        try {
            const res = await listComplaints()
            console.log('Complaints loaded:', res)
            setData(res || [])
        } catch (error) {
            console.error('Error fetching complaints:', error)
            setData([])
        } finally {
            setLoading(false)
        }
    }

    async function handleSave(payload) {
        console.log('Saving complaint:', payload)
        try {
            if (editing && editing.id) {
                await updateComplaint(editing.id, payload)
            } else {
                await createComplaint(payload)
            }
            setShowForm(false)
            setEditing(null)
            await fetchData()
        } catch (error) {
            console.error('Error saving complaint:', error)
            alert('Error saving complaint: ' + error.message)
        }
    }

    const showDeleteConfirmation = (id, title) => {
        setDeleteModal({
            visible: true,
            complaintId: id,
            complaintTitle: title
        })
    }

    async function handleDelete(id) {
        try {
            await deleteComplaint(id)
            await fetchData()
            console.log('Complaint deleted successfully')
        } catch (error) {
            console.error('Error deleting complaint:', error)
            alert('Error deleting complaint: ' + error.message)
        }
    }

    const confirmDelete = () => {
        if (deleteModal.complaintId) {
            handleDelete(deleteModal.complaintId)
        }
        setDeleteModal({ visible: false, complaintId: null, complaintTitle: '' })
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Received': { color: 'primary', text: 'Received' },
            'Under Investigation': { color: 'warning', text: 'Under Investigation' },
            'Resolved': { color: 'success', text: 'Resolved' },
            'Closed': { color: 'secondary', text: 'Closed' },
            'Rejected': { color: 'danger', text: 'Rejected' }
        }
        
        const config = statusConfig[status] || { color: 'secondary', text: status }
        return <CBadge color={config.color}>{config.text}</CBadge>
    }

    const getPriorityBadge = (priority) => {
        const priorityConfig = {
            'Low': { color: 'success', text: 'Low' },
            'Medium': { color: 'warning', text: 'Medium' },
            'High': { color: 'danger', text: 'High' },
            'Urgent': { color: 'danger', text: 'Urgent' }
        }
        
        const config = priorityConfig[priority] || { color: 'secondary', text: priority }
        return <CBadge color={config.color}>{config.text}</CBadge>
    }

    const handleShowInfo = (complaint) => {
        setSelectedComplaint(complaint)
        setShowInfo(true)
    }

    return (
        <CContainer fluid>
            <CRow>
                <CCol>
                    <CCard>
                        <CCardHeader>
                            <div className="d-flex justify-content-between align-items-center">
                                <h4 className="mb-0">Complaints Management</h4>
                                <CButton 
                                    color="primary" 
                                    onClick={() => { 
                                        setEditing(null); 
                                        setShowForm(true) 
                                    }}
                                >
                                    <CIcon icon={cilPlus} className="me-2" />
                                    New Complaint
                                </CButton>
                            </div>
                        </CCardHeader>
                        <CCardBody>
                            {loading ? (
                                <div className="text-center py-4">
                                    <CSpinner color="primary" />
                                    <div className="mt-2">Loading complaints...</div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-3 text-muted">
                                        Showing {data.length} complaint(s)
                                    </div>
                                    
                                    {data.length > 0 ? (
                                        <CTable hover responsive>
                                            <CTableHead>
                                                <CTableRow>
                                                    <CTableHeaderCell>ID</CTableHeaderCell>
                                                    <CTableHeaderCell>Title</CTableHeaderCell>
                                                    <CTableHeaderCell>Complainant</CTableHeaderCell>
                                                    <CTableHeaderCell>Location</CTableHeaderCell>
                                                    <CTableHeaderCell>Assigned Officer</CTableHeaderCell>
                                                    <CTableHeaderCell>Priority</CTableHeaderCell>
                                                    <CTableHeaderCell>Status</CTableHeaderCell>
                                                    <CTableHeaderCell style={{ width: '150px' }}>Actions</CTableHeaderCell>
                                                </CTableRow>
                                            </CTableHead>
                                            <CTableBody>
                                                {data.map(complaint => (
                                                    <CTableRow key={complaint.id}>
                                                        <CTableDataCell>#{complaint.id}</CTableDataCell>
                                                        <CTableDataCell>
                                                            <strong>{complaint.title}</strong>
                                                        </CTableDataCell>
                                                        <CTableDataCell>
                                                            {complaint.complainantName}
                                                            <br />
                                                            <small className="text-muted">{complaint.complainantPhone}</small>
                                                        </CTableDataCell>
                                                        <CTableDataCell>
                                                            <small>{complaint.location}</small>
                                                        </CTableDataCell>
                                                        <CTableDataCell>
                                                            {complaint.assignedOfficerName || 'Not assigned'}
                                                        </CTableDataCell>
                                                        <CTableDataCell>
                                                            {getPriorityBadge(complaint.priority)}
                                                        </CTableDataCell>
                                                        <CTableDataCell>
                                                            {getStatusBadge(complaint.status)}
                                                        </CTableDataCell>
                                                        <CTableDataCell>
                                                            <div className="d-flex gap-2">
                                                                <CButton 
                                                                    size="sm" 
                                                                    color="success" 
                                                                    variant="outline"
                                                                    onClick={() => handleShowInfo(complaint)}
                                                                    title="View complaint details"
                                                                >
                                                                    <CIcon icon={cilInfo} />
                                                                </CButton>
                                                                <CButton 
                                                                    size="sm" 
                                                                    color="primary" 
                                                                    variant="outline"
                                                                    onClick={() => { 
                                                                        setEditing(complaint); 
                                                                        setShowForm(true) 
                                                                    }}
                                                                >
                                                                    <CIcon icon={cilPencil} />
                                                                </CButton>
                                                                <CButton 
                                                                    size="sm" 
                                                                    color="danger" 
                                                                    variant="outline"
                                                                    onClick={() => showDeleteConfirmation(complaint.id, complaint.title)}
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
                                                <h5>No complaints found</h5>
                                                <p>Start by adding a new complaint to the system.</p>
                                                <CButton 
                                                    color="primary" 
                                                    onClick={() => { 
                                                        setEditing(null); 
                                                        setShowForm(true) 
                                                    }}
                                                >
                                                    Add First Complaint
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

            <ComplaintForm 
                visible={showForm} 
                onClose={() => {
                    setShowForm(false)
                    setEditing(null)
                }} 
                onSave={handleSave} 
                initial={editing} 
            />

            <InfoComplaint 
                visible={showInfo}
                onClose={() => {
                    setShowInfo(false)
                    setSelectedComplaint(null)
                }}
                complaint={selectedComplaint}
            />
            <ConfirmationModal
                visible={deleteModal.visible}
                onClose={() => setDeleteModal({ visible: false, complaintId: null, complaintTitle: '' })}
                onConfirm={confirmDelete}
                title="Delete Complaint"
                message={`Are you sure you want to delete the complaint "${deleteModal.complaintTitle}"? This action cannot be undone.`}
                confirmText="Delete"
                type="danger"
            />
        </CContainer>
    )
}

export default Complaints