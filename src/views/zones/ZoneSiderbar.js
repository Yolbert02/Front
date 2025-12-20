import React, { useState, useEffect } from 'react'
import {
    CAccordion,
    CAccordionBody,
    CAccordionHeader,
    CAccordionItem,
    CCard,
    CCardBody,
    CCardHeader,
    CCardFooter,
    CListGroup,
    CListGroupItem,
    CBadge,
    CSpinner,
    CButton
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMap, cilWarning, cilInfo, cilLocationPin, cilListRich, cilChart } from '@coreui/icons'
import { listComplaints } from 'src/services/complaints'
import './ZoneSiderbar.css'
import InfoComplaint from '../complaints/InfoComplaint'
import SearchInput from 'src/components/SearchInput'
import InfoGlobalZone from './InfoGlobalZone'

const ZoneSiderbar = ({ onLocate }) => {
    const [complaints, setComplaints] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedComplaint, setSelectedComplaint] = useState(null)
    const [showComplaintInfo, setShowComplaintInfo] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [showGlobalStats, setShowGlobalStats] = useState(false)

    const zones = [
        { id: 1, name: 'Pueblo Nuevo', color: '#4caf50', colorBody: '#388e3c' },
        { id: 2, name: 'Barrio Obrero', color: '#2196f3', colorBody: '#1976d2' },
        { id: 3, name: 'Centro', color: '#f44336', colorBody: '#d32f2f' },
        { id: 4, name: 'Santa Teresa', color: '#9c27b0', colorBody: '#7b1fa2' },
        { id: 5, name: 'La Concordia', color: '#ff9800', colorBody: '#f57c00' }
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

    const getSearchResults = () => {
        if (!searchTerm) return []
        const searchLower = searchTerm.toLowerCase()
        return complaints.filter(complaint =>
            complaint.id?.toString().includes(searchTerm) ||
            complaint.location?.toLowerCase().includes(searchLower) ||
            complaint.title?.toLowerCase().includes(searchLower)
        )
    }

    const renderComplaintItem = (complaint) => {
        const zone = zones.find(z => complaint.location && complaint.location.toLowerCase().includes(z.name.toLowerCase()))
        const zoneColor = zone ? zone.colorBody : '#ccc'

        return (
            <CListGroupItem
                key={complaint.id}
                className="border-0 px-0 py-2 complaint-item d-flex justify-content-between align-items-center"
            >
                <div className="flex-grow-1">
                    <div className="zone-body"
                        style={{ '--zone-color': zoneColor }}>
                        <strong className="d-block complaint-title" style={{ fontSize: '0.9rem' }}>
                            {complaint.title || 'Untitled'}
                        </strong>
                        <small className="text-muted d-block mt-1">
                            ID: #{complaint.id} {complaint.zone && `• ${complaint.zone}`}
                        </small>
                    </div>
                </div>

                <div className="d-flex gap-2 ms-3">
                    <CButton
                        size="sm"
                        className="text-success shadow-sm"
                        title="View Location"
                        shape="rounded-pill"
                        onClick={() => onLocate && onLocate(complaint)}
                    >
                        <CIcon icon={cilLocationPin} />
                    </CButton>

                    <CButton
                        size="sm"
                        className="text-info shadow-sm"
                        onClick={() => handleInfoClick(complaint)}
                        title="View Details"
                        shape="rounded-pill"
                    >
                        <CIcon icon={cilInfo} />
                    </CButton>
                </div>
            </CListGroupItem>
        )
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
                    <div className="mb-4">
                        <SearchInput
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {searchTerm ? (
                        <div className="search-results">
                            {getSearchResults().length > 0 ? (
                                <CListGroup flush>
                                    {getSearchResults().map(renderComplaintItem)}
                                </CListGroup>
                            ) : (
                                <div className="text-center text-muted py-4">
                                    <CIcon icon={cilWarning} className="me-2 opacity-50" />
                                    No results found for "{searchTerm}"
                                </div>
                            )}
                        </div>
                    ) : (
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
                                                    {zoneComplaints.map(renderComplaintItem)}
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
                    )}
                </CCardBody>
                <CCardFooter>
                    <div className='d-flex justify-content-end'>
                        <CButton
                            size="lg"
                            onClick={() => setShowGlobalStats(true)}
                            title="View Details"
                            className="text-info shadow-lg"
                        >
                            <CIcon icon={cilInfo} />
                        </CButton>
                    </div>
                </CCardFooter>
            </CCard>

            <InfoComplaint
                visible={showComplaintInfo}
                onClose={() => {
                    setShowComplaintInfo(false)
                    setSelectedComplaint(null)
                }}
                complaint={selectedComplaint}
            />

            <InfoGlobalZone
                visible={showGlobalStats}
                onClose={() => setShowGlobalStats(false)}
                zones={zones}
                complaints={complaints}
            />
        </>
    )
}

export default ZoneSiderbar