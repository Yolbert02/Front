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
    CRow,
    CCol,
    CProgress,
    CBadge,
    CListGroup,
    CListGroupItem
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilGlobeAlt,
    cilChart,
    cilList,
    cilArrowRight,
    cilArrowLeft,
    cilWarning,
    cilCheckCircle,
    cilXCircle,
    cilStar,
    cilCloudDownload,
    cilFolderOpen
} from '@coreui/icons'
import { modalStyles, cardStyles, containerStyles } from 'src/styles/darkModeStyles'

const InfoGlobalZone = ({ visible, onClose, zones = [], complaints = [] }) => {
    const dispatch = useDispatch()
    const [step, setStep] = useState(1) // 1 = Resumen general, 2 = Por estado, 3 = Por prioridad
    const [stats, setStats] = useState({
        totalComplaints: 0,
        byStatus: {},
        byPriority: {},
        byZone: [],
        mostProblematicZone: null,
        zonesWithMostComplaints: [],
        averageComplaintsPerZone: 0
    })

    // Reset step when modal opens
    useEffect(() => {
        if (visible) {
            setStep(1)
        }
    }, [visible])

    // Calculate statistics
    useEffect(() => {
        if (visible && zones.length > 0 && complaints.length > 0) {
            calculateStatistics()
        }
    }, [visible, zones, complaints])

    const calculateStatistics = () => {
        // Initialize stats with lowercase keys to match the database/service
        const byStatus = {
            'received': 0,
            'under_investigation': 0,
            'resolved': 0,
            'closed': 0,
            'rejected': 0
        }

        const byPriority = {
            'low': 0,
            'medium': 0,
            'high': 0,
            'urgent': 0
        }

        const byZone = zones.map(zone => {
            const zoneComplaints = complaints.filter(c =>
                c.zone?.toLowerCase().includes(zone.name.toLowerCase()) ||
                c.location?.toLowerCase().includes(zone.name.toLowerCase())
            )

            const zoneStatusStats = { ...byStatus }
            Object.keys(zoneStatusStats).forEach(key => zoneStatusStats[key] = 0)

            const zonePriorityStats = { ...byPriority }
            Object.keys(zonePriorityStats).forEach(key => zonePriorityStats[key] = 0)

            zoneComplaints.forEach(complaint => {
                const s = complaint.status?.toLowerCase()
                const p = complaint.priority?.toLowerCase()
                if (zoneStatusStats[s] !== undefined) {
                    zoneStatusStats[s]++
                }
                if (zonePriorityStats[p] !== undefined) {
                    zonePriorityStats[p]++
                }
            })

            return {
                ...zone,
                total: zoneComplaints.length,
                statusStats: zoneStatusStats,
                priorityStats: zonePriorityStats
            }
        })

        // Calculate global stats
        let totalComplaints = 0
        let mostProblematicZone = null
        let maxComplaints = 0

        byZone.forEach(zone => {
            totalComplaints += zone.total
            if (zone.total > maxComplaints) {
                maxComplaints = zone.total
                mostProblematicZone = zone
            }
        })

        // Count global status and priority
        complaints.forEach(complaint => {
            const s = complaint.status?.toLowerCase()
            const p = complaint.priority?.toLowerCase()
            if (byStatus[s] !== undefined) {
                byStatus[s]++
            }
            if (byPriority[p] !== undefined) {
                byPriority[p]++
            }
        })

        // Sort zones by complaints (descending)
        const zonesWithMostComplaints = [...byZone]
            .sort((a, b) => b.total - a.total)
            .slice(0, 5) // Top 5 zones

        const averageComplaintsPerZone = byZone.length > 0
            ? Math.round((totalComplaints / byZone.length) * 10) / 10
            : 0

        setStats({
            totalComplaints,
            byStatus,
            byPriority,
            byZone,
            mostProblematicZone,
            zonesWithMostComplaints,
            averageComplaintsPerZone
        })
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'resolved': return 'success'
            case 'under_investigation': return 'warning'
            case 'received': return 'info'
            case 'rejected': return 'danger'
            case 'closed': return 'secondary'
            default: return 'primary'
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'low': return 'success'
            case 'medium': return 'warning'
            case 'high': return 'danger'
            case 'urgent': return 'dark'
            default: return 'primary'
        }
    }

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'resolved': return cilCheckCircle
            case 'rejected': return cilXCircle
            case 'received': return cilFolderOpen
            default: return cilWarning
        }
    }

    const formatLabel = (str) => {
        if (!str) return ''
        return str.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1)
        }
    }

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1)
        }
    }

    const formatPercentage = (value, total) => {
        if (total === 0) return '0%'
        return `${Math.round((value / total) * 100)}%`
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
        <CModal size="lg" visible={visible} onClose={onClose}>
            <CModalHeader style={modalStyles.header}>
                <CModalTitle>
                    <CIcon icon={cilGlobeAlt} className="me-2" />
                    Global Zone Statistics - Step {step} of 3
                </CModalTitle>
            </CModalHeader>
            <CModalBody style={modalStyles.bodyScrollable}>
                {step === 1 && (
                    <>
                        {/* Summary Card */}
                        <CCard className="mb-4 border-0 shadow-sm" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilChart} className="me-2" />
                                    Global Overview
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CRow className="text-center">
                                    <CCol md={3} className="mb-4">
                                        <div className="p-3 border rounded" style={containerStyles.secondaryBg}>
                                            <h2 className="text-primary">{stats.totalComplaints}</h2>
                                            <p className="text-muted mb-0">Total Complaints</p>
                                        </div>
                                    </CCol>
                                    <CCol md={3} className="mb-4">
                                        <div className="p-3 border rounded" style={containerStyles.secondaryBg}>
                                            <h2 className="text-warning">{stats.byZone.length}</h2>
                                            <p className="text-muted mb-0">Active Zones</p>
                                        </div>
                                    </CCol>
                                    <CCol md={3} className="mb-4">
                                        <div className="p-3 border rounded" style={containerStyles.secondaryBg}>
                                            <h2 className="text-success">{stats.averageComplaintsPerZone}</h2>
                                            <p className="text-muted mb-0">Avg. per Zone</p>
                                        </div>
                                    </CCol>
                                    <CCol md={3} className="mb-4">
                                        <div className="p-3 border rounded" style={containerStyles.secondaryBg}>
                                            <h2 className="text-danger">
                                                {stats.mostProblematicZone?.total || 0}
                                            </h2>
                                            <p className="text-muted mb-0">Highest Zone</p>
                                            <small className="text-muted">
                                                {stats.mostProblematicZone?.name || 'N/A'}
                                            </small>
                                        </div>
                                    </CCol>
                                </CRow>

                                {/* Top 5 Zones */}
                                <h6 className="mb-3 mt-4">
                                    <CIcon icon={cilStar} className="me-2" />
                                    Top 5 Zones by Complaints
                                </h6>
                                {stats.zonesWithMostComplaints.map((zone, index) => (
                                    <div key={zone.id} className="mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <div className="d-flex align-items-center">
                                                <span className="badge bg-primary me-2">{index + 1}</span>
                                                <strong>{zone.name}</strong>
                                                <div
                                                    className="ms-2"
                                                    style={{
                                                        width: '12px',
                                                        height: '12px',
                                                        backgroundColor: zone.color,
                                                        borderRadius: '3px'
                                                    }}
                                                />
                                            </div>
                                            <span className="badge bg-secondary">{zone.total} complaints</span>
                                        </div>
                                        <CProgress
                                            value={(zone.total / stats.totalComplaints) * 100}
                                            color={index === 0 ? 'danger' : index === 1 ? 'warning' : 'info'}
                                            size="sm"
                                        />
                                        <small className="text-muted">
                                            {formatPercentage(zone.total, stats.totalComplaints)} of total complaints
                                        </small>
                                    </div>
                                ))}
                            </CCardBody>
                        </CCard>
                    </>
                )}

                {step === 2 && (
                    <>
                        {/* Status Distribution - Todo en una sola lista */}
                        <CCard className="mb-4 border-0 shadow-sm" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilList} className="me-2" />
                                    Global Status Distribution
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <div className="text-center mb-4">
                                    <h4 className="text-primary">{stats.totalComplaints}</h4>
                                    <p className="text-muted mb-0">Total Complaints Analyzed</p>
                                </div>

                                <CListGroup flush>
                                    {Object.entries(stats.byStatus).map(([status, count]) => (
                                        <CListGroupItem
                                            key={status}
                                            className="px-0 py-3"
                                            style={containerStyles.lightBg}
                                        >
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <div className="d-flex align-items-center">
                                                    <CIcon
                                                        icon={getStatusIcon(status)}
                                                        className={`me-3 text-${getStatusColor(status)}`}
                                                        size="lg"
                                                    />
                                                    <div>
                                                        <strong>{formatLabel(status)}</strong>
                                                        <div className="small text-muted">
                                                            {count} complaints
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <div className="fw-bold">
                                                        {formatPercentage(count, stats.totalComplaints)}
                                                    </div>
                                                    <CBadge color={getStatusColor(status)}>
                                                        {count}
                                                    </CBadge>
                                                </div>
                                            </div>
                                            {/* Barra de progreso integrada en la misma lista */}
                                            <div className="mt-2">

                                                <CProgress
                                                    value={stats.totalComplaints > 0 ? (count / stats.totalComplaints * 100) : 0}
                                                    color={getStatusColor(status)}
                                                    size="sm"
                                                />
                                            </div>
                                        </CListGroupItem>
                                    ))}
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </>
                )}

                {step === 3 && (
                    <>
                        {/* Priority Distribution - 2 tarjetas por fila, más grandes, sin resumen */}
                        <CCard className="mb-4 border-0 shadow-sm" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilWarning} className="me-2" />
                                    Global Priority Distribution
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <div className="text-center mb-4">
                                    <h4 className="text-primary">{stats.totalComplaints}</h4>
                                    <p className="text-muted mb-0">Total Complaints Analyzed</p>
                                </div>

                                <CRow className="g-4">
                                    {Object.entries(stats.byPriority).map(([priority, count]) => (
                                        <CCol xs={12} sm={6} key={priority}>
                                            <div
                                                className="p-4 border rounded h-100"
                                                style={{
                                                    ...containerStyles.secondaryBg,
                                                    borderColor: `var(--cui-${getPriorityColor(priority)})`,
                                                    borderLeftWidth: '4px',
                                                    borderLeftColor: `var(--cui-${getPriorityColor(priority)})`,
                                                    minHeight: '180px'
                                                }}
                                            >
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div>
                                                        <h5 className="mb-1">{formatLabel(priority)}</h5>
                                                        <div className="small text-muted">
                                                            Priority Level
                                                        </div>
                                                    </div>
                                                    <span className="badge bg-primary fs-6">{count}</span>
                                                </div>

                                                <CProgress
                                                    value={stats.totalComplaints > 0 ? (count / stats.totalComplaints * 100) : 0}
                                                    color={getPriorityColor(priority)}
                                                    size="lg"
                                                    className="mb-3"
                                                />

                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="small">
                                                        <strong>Percentage:</strong>
                                                    </div>
                                                    <div className="fw-bold text-primary">
                                                        {formatPercentage(count, stats.totalComplaints)}
                                                    </div>
                                                </div>

                                                <div className="mt-2 text-center">
                                                    <small className="text-muted">
                                                        {count} out of {stats.totalComplaints} complaints
                                                    </small>
                                                </div>
                                            </div>
                                        </CCol>
                                    ))}
                                </CRow>
                            </CCardBody>
                        </CCard>
                    </>
                )}
            </CModalBody>
            <CModalFooter style={modalStyles.footer}>
                <div className="d-flex justify-content-between w-100">
                    <div>
                        {step > 1 && (
                            <CButton type="button" color="secondary" onClick={handleBack}>
                                <CIcon icon={cilArrowLeft} className="me-2" />
                                Back
                            </CButton>
                        )}
                    </div>

                    <div className="d-flex align-items-center">
                        <CButton
                            size="lg"
                            variant="outline"
                            className="text-success me-2"
                            onClick={() => downloadXLS(InfoGlobalZone.id)}
                            title="Download XLS"
                        >
                            <CIcon icon={cilCloudDownload} />
                        </CButton>

                        {step < 3 ? (
                            <CButton type="button" color="primary" onClick={handleNext}>
                                Next
                                <CIcon icon={cilArrowRight} className="ms-2" />
                            </CButton>
                        ) : (
                            <CButton type="button" color="secondary" onClick={onClose}>
                                Close
                            </CButton>
                        )}
                    </div>
                </div>
            </CModalFooter>
        </CModal>
    )
}

export default InfoGlobalZone