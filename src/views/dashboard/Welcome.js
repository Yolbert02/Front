import React, { useState, useEffect } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CButton,
    CBadge,
    CAvatar,
    CProgress,
} from '@coreui/react'
import { CChartDoughnut, CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import {
    cilShieldAlt,
    cilNotes,
    cilCheckCircle,
    cilWarning,
    cilPeople,
    cilArrowRight,
    cilChartLine,
    cilDiamond,
    cilLocationPin
} from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import { listComplaints } from 'src/services/complaints'
import { listOfficers } from 'src/services/officers'

const Welcome = () => {
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        total: 0,
        resolved: 0,
        pending: 0,
        investigating: 0,
        statusData: [],
        officerStats: [],
        recentActivity: [],
        loaded: false
    })

    useEffect(() => {
        const timer = setTimeout(() => {
            setStats(prev => ({ ...prev, loaded: true }))
        }, 300)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const allComplaints = await listComplaints()
            const allOfficers = await listOfficers()

            const total = allComplaints.length
            const resolved = allComplaints.filter(c => c.status === 'resolved').length
            const pending = allComplaints.filter(c => c.status === 'received').length
            const investigating = allComplaints.filter(c => c.status === 'under_investigation').length

            const statusCounts = {
                received: 0,
                under_investigation: 0,
                resolved: 0,
                dismissed: 0,
                rejected: 0
            }
            allComplaints.forEach(c => {
                if (statusCounts[c.status] !== undefined) statusCounts[c.status]++
            })

            const officerPerformance = allOfficers.map(officer => {
                const assigned = allComplaints.filter(c => c.assignedOfficerId === officer.id)
                const solved = assigned.filter(c => c.status === 'resolved').length
                return {
                    ...officer,
                    assignedCount: assigned.length,
                    resolvedCount: solved,
                    efficiency: assigned.length > 0 ? Math.round((solved / assigned.length) * 100) : 0
                }
            }).sort((a, b) => b.resolvedCount - a.resolvedCount)

            setStats({
                total,
                resolved,
                pending,
                investigating,
                statusData: Object.values(statusCounts),
                officerStats: officerPerformance,
                recentActivity: allComplaints.slice(0, 5),
                loaded: true
            })
        } catch (error) {
            console.error('Error loading dashboard stats:', error)
        }
    }

    const premiumStyles = {
        hero: {
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            position: 'relative'
        },
        glassCard: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)'
        },
        statIcon: (color) => ({
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${color}33 0%, ${color}11 100%)`,
            color: color,
            marginBottom: '1rem'
        }),
        leaderboardCard: {
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'var(--cui-card-bg)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            marginBottom: '1rem',
            transition: 'all 0.3s ease'
        }
    }

    return (
        <div className="fade-in px-2 pb-5">
            <CRow className="mb-4 pt-3">
                <CCol xs={12}>
                    <div style={premiumStyles.hero} className="p-5 text-white shadow-lg">
                        <div className="position-absolute" style={{
                            width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                            top: '-100px', left: '-100px', zIndex: 0
                        }}></div>

                        <CRow className="position-relative" style={{ zIndex: 1 }}>
                            <CCol md={8}>
                                <div className="d-flex align-items-center mb-3">
                                    <CBadge color="primary" className="p-2 px-3 rounded-pill me-2" style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.5)' }}>
                                        <CIcon icon={cilShieldAlt} className="me-1" /> System Active
                                    </CBadge>
                                </div>
                                <h1 className="display-4 fw-bold mb-3" style={{ letterSpacing: '-1.5px' }}>
                                    Judicial Command <span style={{ color: '#818cf8' }}>Intelligence</span>
                                </h1>
                                <p className="lead mb-4 fs-5" style={{ maxWidth: '600px', color: '#fff' }}>
                                    Orchestrate public safety with real-time data integration. Monitor assignments, analyze crime patterns, and optimize response times.
                                </p>
                                <div className="d-flex gap-3 mt-4">
                                    <CButton
                                        color="primary"
                                        size="lg"
                                        className="px-5 rounded-pill shadow-lg border-0"
                                        style={{ background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)' }}
                                        onClick={() => navigate('/complaints')}
                                    >
                                        File Report
                                    </CButton>
                                    <CButton
                                        variant="outline"
                                        color="light"
                                        size="lg"
                                        className="px-4 rounded-pill border-opacity-25"
                                        onClick={() => navigate('/zones')}
                                    >
                                        <CIcon icon={cilLocationPin} className="me-2" /> Live Map
                                    </CButton>
                                </div>
                            </CCol>
                            <CCol md={4} className="d-none d-md-flex align-items-center justify-content-center">
                                <CIcon icon={cilDiamond} style={{ height: '220px', width: '220px', opacity: 0.1, color: '#818cf8' }} />
                            </CCol>
                        </CRow>
                    </div>
                </CCol>
            </CRow>

            {/* --- QUICK STATS GRID --- */}
            <CRow className="mb-5 g-4">
                {[
                    { label: 'Total Cases', value: stats.total, icon: cilNotes, color: '#6366f1' },
                    { label: 'Resolved', value: stats.resolved, icon: cilCheckCircle, color: '#10b981' },
                    { label: 'Investigation', value: stats.investigating, icon: cilWarning, color: '#f59e0b' },
                    { label: 'High Priority', value: stats.pending, icon: cilChartLine, color: '#ef4444' }
                ].map((item, idx) => {
                    const progressValue = stats.total > 0
                        ? (idx === 0 ? 100 : Math.round((item.value / stats.total) * 100))
                        : 0;

                    return (
                        <CCol sm={6} lg={3} key={idx}>
                            <CCard className="border-0 shadow-sm h-100 welcome-stat-card" style={{ borderRadius: '24px', transition: 'all 0.3s ease', background: 'var(--cui-card-bg)' }}>
                                <CCardBody className="p-4">
                                    <div style={premiumStyles.statIcon(item.color)}>
                                        <CIcon icon={item.icon} size="xl" />
                                    </div>
                                    <div className="text-muted small fw-semibold text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>{item.label}</div>
                                    <h2 className="fw-bold mb-0" style={{ fontSize: '2rem', color: 'var(--cui-body-color)' }}>{item.value}</h2>
                                    <div className="mt-3">
                                        <div style={{ height: '6px', background: `${item.color}22`, borderRadius: '10px', overflow: 'hidden' }}>
                                            <div style={{
                                                backgroundColor: item.color,
                                                width: stats.loaded ? `${progressValue}%` : '0%',
                                                height: '100%',
                                                borderRadius: '10px',
                                                transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                            }}></div>
                                        </div>
                                    </div>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    )
                })}
            </CRow>

            <CRow className="g-5">
                {/* --- PERFORMANCE LEADERBOARD --- */}
                <CCol lg={8}>
                    <div className="d-flex justify-content-between align-items-end mb-4 px-2">
                        <div>
                            <h3 className="fw-bold mb-1">Top Performing Officers</h3>
                            <p className="text-muted mb-0 small">Real-time meritocracy based on case resolution velocity.</p>
                        </div>
                        <CButton variant="ghost" color="primary" onClick={() => navigate('/Officers')}>View All <CIcon icon={cilArrowRight} /></CButton>
                    </div>

                    <div className="pe-2">
                        {stats.officerStats.slice(0, 4).map((officer, index) => (
                            <CCard key={officer.id} style={premiumStyles.leaderboardCard} className="overflow-hidden border-0">
                                <CCardBody className="p-3">
                                    <div className="d-flex align-items-center">
                                        <div className="me-3 position-relative">
                                            <CBadge color={index === 0 ? 'warning' : 'secondary'} className="position-absolute translate-middle-y top-0 start-100 rounded-circle" style={{ padding: '5px 8px' }}>
                                                #{index + 1}
                                            </CBadge>
                                            <CAvatar
                                                src={`https://ui-avatars.com/api/?name=${officer.name}+${officer.lastName}&background=1a237e&color=fff`}
                                                size="lg"
                                                style={{ border: '3px solid var(--cui-card-bg)' }}
                                            />
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className="fw-bold mb-0">{officer.name} {officer.lastName}</h6>
                                            <small className="text-muted">{officer.rank} • {officer.unit}</small>
                                        </div>
                                        <div className="text-center px-3 border-start" style={{ borderColor: 'var(--cui-border-color-translucent)' }}>
                                            <div className="fw-bold" style={{ color: 'var(--cui-body-color)' }}>{officer.assignedCount}</div>
                                            <small className="text-muted smaller">Cases</small>
                                        </div>
                                        <div className="text-center px-3 border-start" style={{ borderColor: 'var(--cui-border-color-translucent)' }}>
                                            <div className="fw-bold text-success">{officer.resolvedCount}</div>
                                            <small className="text-muted smaller">Solved</small>
                                        </div>
                                        <div className="text-center px-3 border-start d-none d-sm-block" style={{ width: '100px', borderColor: 'var(--cui-border-color-translucent)' }}>
                                            <div className="fw-bold text-primary">{officer.efficiency}%</div>
                                            <div style={{ height: '3px', background: 'var(--cui-primary-opacity-10)', borderRadius: '10px', overflow: 'hidden', marginTop: '4px' }}>
                                                <div style={{
                                                    backgroundColor: 'var(--cui-primary)',
                                                    width: stats.loaded ? `${officer.efficiency}%` : '0%',
                                                    height: '100%',
                                                    transition: 'width 1.5s ease'
                                                }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </CCardBody>
                            </CCard>
                        ))}
                    </div>
                </CCol>

                {/* --- ANALYTICS SIDEBAR --- */}
                <CCol lg={4}>
                    <CCard className="border-0 shadow-lg mb-4" style={{ borderRadius: '24px', background: '#0f172a' }}>
                        <CCardHeader className="bg-transparent border-0 pt-4 px-4">
                            <h5 className="fw-bold text-white mb-0">Case Distribution</h5>
                        </CCardHeader>
                        <CCardBody className="p-4 pt-2">
                            <CChartDoughnut
                                data={{
                                    labels: ['Received', 'Internal', 'Resolved', 'Others', 'Rejected'],
                                    datasets: [
                                        {
                                            backgroundColor: ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#94a3b8'],
                                            hoverBackgroundColor: ['#818cf8', '#fbbf24', '#34d399', '#f87171', '#cbd5e1'],
                                            borderWidth: 0,
                                            data: stats.statusData,
                                        },
                                    ],
                                }}
                                options={{
                                    cutout: '75%',
                                    plugins: {
                                        legend: { display: false }
                                    }
                                }}
                            />
                            <div className="mt-4">
                                {['Received', 'Internal', 'Resolved'].map((label, i) => (
                                    <div key={label} className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle me-2" style={{ width: '10px', height: '10px', background: ['#6366f1', '#f59e0b', '#10b981'][i] }}></div>
                                            <span className="text-light small">{label}</span>
                                        </div>
                                        <span className="text-light fw-bold small">{stats.statusData[i] || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </CCardBody>
                    </CCard>

                    {/* Institutional Note - Small Premium */}
                    <div className="p-4 rounded-4" style={{ background: 'linear-gradient(135deg, #10b98115 0%, #10b98105 100%)', border: '1px dashed #10b98144' }}>
                        <div className="d-flex align-items-center mb-2 text-success">
                            <CIcon icon={cilCheckCircle} size="lg" className="me-2" />
                            <span className="fw-bold small">Audit Log Secure</span>
                        </div>
                        <p className="text-muted smaller mb-0">
                            Your session is being monitored per <strong>NIST SP 800-53</strong> protocol. All judicial modifications are non-repudiable.
                        </p>
                    </div>
                </CCol>
            </CRow>

            {/* CSS Overrides para el efecto Hover */}
            <style>{`
        .welcome-stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
        }
        .smaller { font-size: 0.75rem; }
      `}</style>
        </div>
    )
}

export default Welcome
