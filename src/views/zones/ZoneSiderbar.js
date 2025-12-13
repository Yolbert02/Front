import React, { useState, useEffect } from 'react'
import {
    CAccordion,
    CAccordionBody,
    CAccordionHeader,
    CAccordionItem,
    CCard,
    CCardBody,
    CCardHeader,
    CListGroup,
    CListGroupItem,
    CBadge,
    CSpinner,
    CButton
} from '@coreui/react'
import { CIcon } from '@coreui/icons-react'
import { cilMap, cilWarning, cilInfo, cilLocationPin, cilListRich } from '@coreui/icons'
import { listComplaints } from 'src/services/complaints'
import './ZoneSiderbar.css'
import InfoComplaint from '../complaints/InfoComplaint'

const ZoneSiderbar = ({ onLocate }) => {
    const [complaints, setComplaints] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedComplaint, setSelectedComplaint] = useState(null)
    const [showComplaintInfo, setShowComplaintInfo] = useState(false)

    const zones = [
        { id: 1, name: 'Pueblo Nuevo', color: '#4caf50' },
        { id: 2, name: 'Barrio Obrero', color: '#2196f3' },
        { id: 3, name: 'Centro', color: '#f44336' },
        { id: 4, name: 'Santa Teresa', color: '#9c27b0' },
        { id: 5, name: 'La Concordia', color: '#ff9800' }
    ]

    useEffect(() => {
        fetchComplaints()
    }, [])

    const fetchComplaints = async () => {
        try {
            const data = await listComplaints()
            setComplaints(data || [])
        } catch (error) {
            console.error('Error fetching complaints:', error)
            setComplaints([])
        } finally {
            setLoading(false)
        }
    }

    const getZoneComplaints = (zoneName) => {
        if (!complaints.length) return []

        return complaints.filter(complaint => {
            if (!complaint.location) return false
            return complaint.location.toLowerCase().includes(zoneName.toLowerCase())
        })
    }

    const handleInfoClick = (complaint) => {
        setSelectedComplaint(complaint)
        setShowComplaintInfo(true)
    }

    if (loading) {
        return (
            <CCard className="mb-4 shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ height: '5px', background: 'linear-gradient(90deg, #1a237e 0%, #0d47a1 100%)' }}></div>
                <CCardBody className="text-center py-5">
                    <CSpinner color="primary" />
                    <p className="mt-3 text-muted">Loading complaints...</p>
                </CCardBody>
            </CCard>
        )
    }

    return (
        <>
            <CCard className="mb-4 shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ height: '5px', background: 'linear-gradient(90deg, #1a237e 0%, #0d47a1 100%)' }}></div>
                <CCardHeader className="border-bottom-0 pt-4 pb-3 px-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <div>
                            <h4 className="mb-1 fw-bold" style={{ letterSpacing: '-0.5px' }}>
                                <CIcon icon={cilListRich} className="me-2 text-primary" />
                                Zone Panel
                            </h4>
                            <p className="text-muted mb-0 small">
                                Zone indicators • {complaints.length} complaints
                            </p>
                        </div>
                    </div>
                </CCardHeader>
                <CCardBody className="px-4 pb-4">
                    <CAccordion className="custom-accordion">
                        {zones.map((zone) => {
                            const zoneComplaints = getZoneComplaints(zone.name)

                            return (
                                <CAccordionItem key={zone.id} itemKey={zone.id}>
                                    <CAccordionHeader
                                        className="custom-accordion-header zone-header d-flex justify-content-between align-items-center"
                                        style={{ '--zone-color': zone.color }}
                                    >
                                        <span>{zone.name}</span>

                                    </CAccordionHeader>
                                    <CAccordionBody>
                                        {zoneComplaints.length > 0 ? (
                                            <CListGroup flush>
                                                {zoneComplaints.map((complaint) => (
                                                    <CListGroupItem
                                                        key={complaint.id}
                                                        className="border-0 px-0 py-2 complaint-item d-flex justify-content-between align-items-center"
                                                    >
                                                        <div className="flex-grow-1">
                                                            <strong className="d-block complaint-title" style={{ fontSize: '0.9rem' }}>
                                                                {complaint.title || 'Untitled'}
                                                            </strong>
                                                            <small className="text-muted d-block mt-1">
                                                                ID: #{complaint.id}
                                                            </small>
                                                        </div>

                                                        <div className="d-flex gap-2 ms-3">
                                                            <CButton
                                                                size="sm"
                                                                color="light"
                                                                className="text-success shadow-sm"
                                                                title="View Location"
                                                                shape="rounded-pill"
                                                                onClick={() => onLocate && onLocate(complaint)}
                                                            >
                                                                <CIcon icon={cilLocationPin} />
                                                            </CButton>

                                                            <CButton
                                                                size="sm"
                                                                color="light"
                                                                className="text-info shadow-sm"
                                                                onClick={() => handleInfoClick(complaint)}
                                                                title="View Details"
                                                                shape="rounded-pill"
                                                            >
                                                                <CIcon icon={cilInfo} />
                                                            </CButton>
                                                        </div>
                                                    </CListGroupItem>
                                                ))}
                                            </CListGroup>
                                        ) : (
                                            <div className="text-center text-muted py-2">
                                                <CIcon icon={cilWarning} className="me-2 opacity-50" />
                                                No complaints
                                            </div>
                                        )}
                                    </CAccordionBody>
                                </CAccordionItem>
                            )
                        })}
                    </CAccordion>
                </CCardBody>
            </CCard>

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

export default ZoneSiderbar