import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CListGroup,
    CListGroupItem,
    CBadge,
    CRow,
    CCol,
    CProgress
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLocationPin, cilWarning, cilArrowRight, cilArrowLeft, cilCloudDownload } from '@coreui/icons'
import InfoComplaint from '../complaints/InfoComplaint'
import { modalStyles, cardStyles } from 'src/styles/darkModeStyles'

const InfoZone = ({ visible, onClose, zone, complaints = [] }) => {
    const dispatch = useDispatch()
    const [selectedComplaint, setSelectedComplaint] = useState(null)
    const [showComplaintInfo, setShowComplaintInfo] = useState(false)
    const [step, setStep] = useState(1)

    useEffect(() => {
        if (visible) {
            setStep(1)
        }
    }, [visible])

    if (!zone) return null

    const zoneComplaints = complaints.filter((c) =>
        c.zone?.toLowerCase().includes(zone.name.toLowerCase()) ||
        c.location?.toLowerCase().includes(zone.name.toLowerCase()),
    )

    const statusStats = {
        'Received': 0,
        'Under Investigation': 0,
        'Resolved': 0,
        'Closed': 0,
        'Rejected': 0
    }

    const priorityStats = {
        'Low': 0,
        'Medium': 0,
        'High': 0,
        'Urgent': 0
    }

    zoneComplaints.forEach(complaint => {
        if (statusStats[complaint.status] !== undefined) {
            statusStats[complaint.status]++
        }
        if (priorityStats[complaint.priority] !== undefined) {
            priorityStats[complaint.priority]++
        }
    })

    const totalComplaints = zoneComplaints.length

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return 'success'
            case 'Under Investigation': return 'warning'
            case 'Received': return 'info'
            case 'Rejected': return 'danger'
            case 'Closed': return 'secondary'
            default: return 'primary'
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Low': return 'success'
            case 'Medium': return 'warning'
            case 'High': return 'danger'
            case 'Urgent': return 'dark'
            default: return 'primary'
        }
    }

    const handleComplaintClick = (complaint) => {
        setSelectedComplaint(complaint)
        setShowComplaintInfo(true)
    }

    const handleNext = () => {
        setStep(step + 1)
    }

    const handleBack = () => {
        setStep(step - 1)
    }

    const downloadXLS = (id) => {
        dispatch({
            type: 'set',
            appAlert: {
                visible: true,
                color: 'success',
                message: 'Your XLS downloaded successfully',
            },
        })
    }

    return (
        <>
            <CModal size="lg" visible={visible} onClose={onClose}>
                <CModalHeader style={modalStyles.header}>
                    <CModalTitle>
                        <CIcon icon={cilLocationPin} className="me-2" />
                        Zone: {zone.name} - Step {step} of 3
                    </CModalTitle>
                </CModalHeader>
                <CModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {step === 1 && (
                        <>
                            <CCard className="mb-4 border-0 shadow-sm" style={cardStyles.card}>
                                <CCardHeader className="border-0" style={cardStyles.header}>
                                    <h6 className="mb-0">Statistics by Status</h6>
                                </CCardHeader>
                                <CCardBody style={cardStyles.body}>
                                    <div className="text-center mb-3">
                                        <h3 className="text-primary">{totalComplaints}</h3>
                                        <p className="text-muted mb-0">Total Complaints</p>
                                    </div>

                                    <h6 className="mb-3">Distribution by Status:</h6>
                                    <CRow className="g-3">
                                        {Object.entries(statusStats).map(([status, count]) => (
                                            <CCol xs={12} sm={6} key={status}>
                                                <div className="p-3 border rounded h-100">
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <strong>{status}</strong>
                                                        <span className="badge bg-primary">{count}</span>
                                                    </div>
                                                    <CProgress
                                                        value={totalComplaints > 0 ? (count / totalComplaints * 100) : 0}
                                                        color={getStatusColor(status)}
                                                        size="sm"
                                                    />
                                                    <small className="text-muted mt-1 d-block">
                                                        {totalComplaints > 0 ? Math.round((count / totalComplaints * 100)) : 0}% of total
                                                    </small>
                                                </div>
                                            </CCol>
                                        ))}
                                    </CRow>
                                </CCardBody>
                            </CCard>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <CCard className="mb-4 border-0 shadow-sm" style={cardStyles.card}>
                                <CCardHeader className="border-0" style={cardStyles.header}>
                                    <h6 className="mb-0">Statistics by Priority</h6>
                                </CCardHeader>
                                <CCardBody style={cardStyles.body}>
                                    <div className="text-center mb-3">
                                        <h3 className="text-primary">{totalComplaints}</h3>
                                        <p className="text-muted mb-0">Total Complaints</p>
                                    </div>

                                    <h6 className="mb-3">Distribution by Priority:</h6>
                                    <CRow className="g-3">
                                        {Object.entries(priorityStats).map(([priority, count]) => (
                                            <CCol xs={12} sm={6} key={priority}>
                                                <div className="p-3 border rounded h-100">
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <strong>{priority}</strong>
                                                        <span className="badge bg-primary">{count}</span>
                                                    </div>
                                                    <CProgress
                                                        value={totalComplaints > 0 ? (count / totalComplaints * 100) : 0}
                                                        color={getPriorityColor(priority)}
                                                        size="sm"
                                                    />
                                                    <small className="text-muted mt-1 d-block">
                                                        {totalComplaints > 0 ? Math.round((count / totalComplaints * 100)) : 0}% of total
                                                    </small>
                                                </div>
                                            </CCol>
                                        ))}
                                    </CRow>
                                </CCardBody>
                            </CCard>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <CCard className="mb-4 border-0 shadow-sm" style={cardStyles.card}>
                                <CCardHeader className="border-0" style={cardStyles.header}>
                                    <h6 className="mb-0">Complaints List ({totalComplaints})</h6>
                                </CCardHeader>
                                <CCardBody style={cardStyles.body}>
                                    {zoneComplaints.length > 0 ? (
                                        <CListGroup>
                                            {zoneComplaints.map((complaint) => (
                                                <CListGroupItem
                                                    key={complaint.id}
                                                    component="button"
                                                    onClick={() => handleComplaintClick(complaint)}
                                                    className="d-flex justify-content-between align-items-center mb-2"
                                                    style={{
                                                        backgroundColor: 'var(--cui-list-group-bg)',
                                                        color: 'var(--cui-body-color)',
                                                        borderColor: 'var(--cui-border-color)'
                                                    }}
                                                >
                                                    <div>
                                                        <strong>#{complaint.id} - {complaint.title}</strong>
                                                        <br />
                                                        <small className="text-muted">{complaint.location}</small>
                                                        <div className="mt-1">
                                                            <CBadge
                                                                color={getPriorityColor(complaint.priority)}
                                                                className="me-2"
                                                            >
                                                                {complaint.priority}
                                                            </CBadge>
                                                            <CBadge color={getStatusColor(complaint.status)}>
                                                                {complaint.status}
                                                            </CBadge>
                                                        </div>
                                                    </div>
                                                </CListGroupItem>
                                            ))}
                                        </CListGroup>
                                    ) : (
                                        <div className="text-center text-muted py-4">
                                            <CIcon icon={cilWarning} size="xl" className="mb-2 opacity-25" />
                                            <div>No complaints found for this zone.</div>
                                        </div>
                                    )}
                                </CCardBody>
                            </CCard>
                        </>
                    )}
                </CModalBody>
                <CModalFooter>
                    {step > 1 && (
                        <CButton type="button" color="secondary" onClick={handleBack}>
                            Back
                        </CButton>
                    )}
                    {step < 3 ? (
                        <CButton type="button" color="primary" onClick={handleNext}>
                            Next
                        </CButton>
                    ) : null}
                    <div className="ms-auto d-flex align-items-center">
                        <CButton
                            size="lg"
                            variant="outline"
                            className="text-success me-2"
                            onClick={() => downloadXLS(zone.id)}
                            title="Download XLS"
                        >
                            <CIcon icon={cilCloudDownload} />
                        </CButton>
                        <CButton type="button" color="secondary" onClick={onClose}>
                            Cancel
                        </CButton>
                    </div>
                </CModalFooter>
            </CModal>

            <InfoComplaint
                visible={showComplaintInfo}
                onClose={() => {
                    setShowComplaintInfo(false)
                    setSelectedComplaint(null)
                }}
                complaint={selectedComplaint}
            />
        </>
    )
}

export default InfoZone