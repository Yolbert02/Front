import React, { useState } from 'react'
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLocationPin, cilWarning, cilCheckCircle, cilXCircle } from '@coreui/icons'
import InfoComplaint from '../complaints/InfoComplaint'
import { modalStyles, cardStyles } from 'src/styles/darkModeStyles'

const InfoZone = ({ visible, onClose, zone, complaints = [] }) => {
    const [selectedComplaint, setSelectedComplaint] = useState(null)
    const [showComplaintInfo, setShowComplaintInfo] = useState(false)

    if (!zone) return null

    const zoneComplaints = complaints.filter((c) =>
        c.location?.toLowerCase().includes(zone.name.toLowerCase()),
    )

    const handleComplaintClick = (complaint) => {
        setSelectedComplaint(complaint)
        setShowComplaintInfo(true)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved':
                return 'success'
            case 'Pending':
                return 'warning'
            case 'Rejected':
                return 'danger'
            default:
                return 'primary'
        }
    }

    return (
        <>
            <CModal size="lg" visible={visible} onClose={onClose}>
                <CModalHeader style={modalStyles.header}>
                    <CModalTitle>
                        <CIcon icon={cilLocationPin} className="me-2" />
                        Zone Details: {zone.name}
                    </CModalTitle>
                </CModalHeader>
                <CModalBody style={modalStyles.body}>
                    <CCard className="mb-3 border-0 shadow-sm" style={cardStyles.card}>
                        <CCardHeader className="border-0" style={cardStyles.header}>
                            <h6 className="mb-0">
                                <span className="me-2" style={{
                                    display: 'inline-block',
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: zone.color,
                                    borderRadius: '3px'
                                }}></span>
                                Zone Status
                            </h6>
                        </CCardHeader>
                        <CCardBody style={cardStyles.body}>
                            <p className="mb-0">
                                Total Complaints: <strong>{zoneComplaints.length}</strong>
                            </p>
                        </CCardBody>
                    </CCard>

                    <h6 className="mb-3">Complaints in this Zone</h6>
                    {zoneComplaints.length > 0 ? (
                        <CListGroup>
                            {zoneComplaints.map((complaint) => (
                                <CListGroupItem
                                    key={complaint.id}
                                    component="button"
                                    onClick={() => handleComplaintClick(complaint)}
                                    className="d-flex justify-content-between align-items-center"
                                    style={{
                                        backgroundColor: 'var(--cui-list-group-bg)',
                                        color: 'var(--cui-body-color)',
                                        borderColor: 'var(--cui-border-color)'
                                    }}
                                >
                                    <div>
                                        <strong>{complaint.title}</strong>
                                        <br />
                                        <small className="text-muted">{complaint.location}</small>
                                    </div>
                                    <CBadge color={getStatusColor(complaint.status)}>{complaint.status}</CBadge>
                                </CListGroupItem>
                            ))}
                        </CListGroup>
                    ) : (
                        <div className="text-center text-muted py-4">
                            <CIcon icon={cilWarning} size="xl" className="mb-2 opacity-25" />
                            <div>No complaints found for this zone.</div>
                        </div>
                    )}
                </CModalBody>
                <CModalFooter style={modalStyles.footer}>
                    <CButton color="secondary" onClick={onClose}>
                        Close
                    </CButton>
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
