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
    CSpinner,
} from '@coreui/react'
import { CChartDoughnut } from '@coreui/react-chartjs'
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
    cilLocationPin,
    cilTask,
    cilUser,
    cilBadge,
} from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import { listComplaints } from 'src/services/complaints'
import { listOfficers } from 'src/services/officers'
import { getOfficerDashboardStats } from 'src/services/reports'
import { getCurrentUser } from 'src/services/auth'

// ─── Helpers ────────────────────────────────────────────────────────────────
const statusLabel = (s) => ({ received: 'Recibida', under_investigation: 'En investigación', closed: 'Cerrada', resolved: 'Resuelta' }[s] || s)
const statusColor = (s) => ({ received: '#6366f1', under_investigation: '#f59e0b', closed: '#10b981', resolved: '#10b981' }[s] || '#94a3b8')
const priorityColor = (p) => ({ high: '#ef4444', medium: '#f59e0b', low: '#10b981' }[p] || '#94a3b8')

// ─── Shared Styles ────────────────────────────────────────────────────────────
const heroBase = {
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    position: 'relative',
}
const statIconStyle = (color) => ({
    width: '56px', height: '56px', borderRadius: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: `linear-gradient(135deg, ${color}33 0%, ${color}11 100%)`,
    color: color, marginBottom: '1rem'
})

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color, total, loaded }) => {
    const pct = total > 0 ? Math.round((Number(value) / total) * 100) : 0
    return (
        <CCol sm={6} lg={3}>
            <CCard className="border-0 shadow-sm h-100 welcome-stat-card"
                style={{ borderRadius: '24px', transition: 'all 0.3s ease', background: 'var(--cui-card-bg)' }}>
                <CCardBody className="p-4">
                    <div style={statIconStyle(color)}>
                        <CIcon icon={icon} size="xl" />
                    </div>
                    <div className="text-muted small fw-semibold text-uppercase mb-1" style={{ letterSpacing: '0.5px' }}>{label}</div>
                    <h2 className="fw-bold mb-0" style={{ fontSize: '2rem', color: 'var(--cui-body-color)' }}>{value}</h2>
                    <div className="mt-3">
                        <div style={{ height: '6px', background: `${color}22`, borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{
                                backgroundColor: color,
                                width: loaded ? `${pct}%` : '0%',
                                height: '100%',
                                borderRadius: '10px',
                                transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }} />
                        </div>
                    </div>
                </CCardBody>
            </CCard>
        </CCol>
    )
}

// ─── Officer Leaderboard ──────────────────────────────────────────────────────
const OfficerLeaderboard = ({ officerStats, loaded, navigate }) => (
    <CCol lg={8}>
        <div className="d-flex justify-content-between align-items-end mb-4 px-2">
            <div>
                <h3 className="fw-bold mb-1">Oficiales con Mejor Desempeño</h3>
                <p className="text-muted mb-0 small">Meritocracia en tiempo real basada en la velocidad de resolución.</p>
            </div>
            <CButton variant="ghost" color="primary" onClick={() => navigate('/Officers')}>
                Ver Todo <CIcon icon={cilArrowRight} />
            </CButton>
        </div>
        <div className="pe-2">
            {officerStats.slice(0, 4).map((officer, index) => (
                <CCard key={officer.id || index} className="overflow-hidden border-0 shadow-sm"
                    style={{ borderRadius: '16px', marginBottom: '1rem', transition: 'all 0.3s ease' }}>
                    <CCardBody className="p-3">
                        <div className="d-flex align-items-center">
                            <div className="me-3 position-relative">
                                <CBadge color={index === 0 ? 'warning' : 'secondary'}
                                    className="position-absolute translate-middle-y top-0 start-100 rounded-circle"
                                    style={{ padding: '5px 8px' }}>#{index + 1}</CBadge>
                                <CAvatar
                                    src={`https://ui-avatars.com/api/?name=${officer.name}+${officer.lastName}&background=1a237e&color=fff`}
                                    size="lg" style={{ border: '3px solid var(--cui-card-bg)' }} />
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="fw-bold mb-0">{officer.name} {officer.lastName}</h6>
                                <small className="text-muted">{officer.rank} • {officer.unit}</small>
                            </div>
                            <div className="text-center px-3 border-start" style={{ borderColor: 'var(--cui-border-color-translucent)' }}>
                                <div className="fw-bold">{officer.assignedCount}</div>
                                <small className="text-muted">Casos</small>
                            </div>
                            <div className="text-center px-3 border-start" style={{ borderColor: 'var(--cui-border-color-translucent)' }}>
                                <div className="fw-bold text-success">{officer.resolvedCount}</div>
                                <small className="text-muted">Resueltos</small>
                            </div>
                            <div className="text-center px-3 border-start d-none d-sm-block"
                                style={{ width: '100px', borderColor: 'var(--cui-border-color-translucent)' }}>
                                <div className="fw-bold text-primary">{officer.efficiency}%</div>
                                <div style={{ height: '3px', background: 'var(--cui-primary-opacity-10)', borderRadius: '10px', overflow: 'hidden', marginTop: '4px' }}>
                                    <div style={{
                                        backgroundColor: 'var(--cui-primary)',
                                        width: loaded ? `${officer.efficiency}%` : '0%',
                                        height: '100%', transition: 'width 1.5s ease'
                                    }} />
                                </div>
                            </div>
                        </div>
                    </CCardBody>
                </CCard>
            ))}
            {officerStats.length === 0 && (
                <div className="text-center py-4 text-muted">
                    <CIcon icon={cilPeople} size="3xl" className="mb-2 opacity-25" />
                    <p className="mb-0">No hay oficiales registrados aún.</p>
                </div>
            )}
        </div>
    </CCol>
)

// ─── Donut Chart Sidebar ─────────────────────────────────────────────────────
const DonutSidebar = ({ statusData }) => (
    <CCol lg={4}>
        <CCard className="border-0 shadow-lg" style={{ borderRadius: '24px', background: '#0f172a' }}>
            <CCardHeader className="bg-transparent border-0 pt-4 px-4">
                <h5 className="fw-bold text-white mb-0">Distribución de Casos</h5>
            </CCardHeader>
            <CCardBody className="p-4 pt-2">
                <CChartDoughnut
                    data={{
                        labels: ['Recibidos', 'En Investigación', 'Resueltos', 'Otros', 'Rechazados'],
                        datasets: [{
                            backgroundColor: ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#94a3b8'],
                            hoverBackgroundColor: ['#818cf8', '#fbbf24', '#34d399', '#f87171', '#cbd5e1'],
                            borderWidth: 0,
                            data: statusData,
                        }],
                    }}
                    options={{ cutout: '75%', plugins: { legend: { display: false } } }}
                />
                <div className="mt-4">
                    {[
                        { label: 'Recibidos', color: '#6366f1', val: statusData[0] || 0 },
                        { label: 'En Investigación', color: '#f59e0b', val: statusData[1] || 0 },
                        { label: 'Resueltos', color: '#10b981', val: statusData[2] || 0 },
                    ].map(item => (
                        <div key={item.label} className="d-flex justify-content-between align-items-center mb-2">
                            <div className="d-flex align-items-center">
                                <div className="rounded-circle me-2" style={{ width: 10, height: 10, background: item.color }} />
                                <span className="text-light small">{item.label}</span>
                            </div>
                            <span className="text-light fw-bold small">{item.val}</span>
                        </div>
                    ))}
                </div>
            </CCardBody>
        </CCard>
    </CCol>
)

// ─── CIVIL DASHBOARD ──────────────────────────────────────────────────────────
const CivilDashboard = ({ user, navigate }) => {
    const [stats, setStats] = useState({
        total: 0, resolved: 0, pending: 0, investigating: 0, highPriority: 0,
        statusData: [0, 0, 0, 0, 0], officerStats: [], loaded: false
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allComplaints, allOfficers] = await Promise.all([listComplaints(), listOfficers()])
                const total = allComplaints.length
                const resolved = allComplaints.filter(c => c.status === 'resolved' || c.status === 'closed').length
                const investigating = allComplaints.filter(c => c.status === 'under_investigation').length
                const highPriority = allComplaints.filter(c => c.priority === 'high').length
                const statusCounts = { received: 0, under_investigation: 0, resolved: 0, dismissed: 0, rejected: 0 }
                allComplaints.forEach(c => { if (statusCounts[c.status] !== undefined) statusCounts[c.status]++ })
                const officerPerformance = allOfficers.map(officer => {
                    const assigned = allComplaints.filter(c => c.assignedOfficerId === officer.id)
                    const solved = assigned.filter(c => c.status === 'resolved' || c.status === 'closed').length
                    return { ...officer, assignedCount: assigned.length, resolvedCount: solved, efficiency: assigned.length > 0 ? Math.round((solved / assigned.length) * 100) : 0 }
                }).sort((a, b) => b.resolvedCount - a.resolvedCount)
                setStats({ total, resolved, investigating, highPriority, statusData: Object.values(statusCounts), officerStats: officerPerformance, loaded: true })
            } catch (err) {
                console.error('Civil dashboard error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="fade-in px-2 pb-5">
            {/* Hero */}
            <CRow className="mb-4 pt-3">
                <CCol xs={12}>
                    <div style={{ ...heroBase, background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }} className="p-5 text-white shadow-lg">
                        <div className="position-absolute" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', top: '-100px', left: '-100px', zIndex: 0 }} />
                        <div className="position-relative" style={{ zIndex: 1 }}>
                            <CBadge color="primary" className="p-2 px-3 rounded-pill mb-3"
                                style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.5)' }}>
                                <CIcon icon={cilUser} className="me-1" /> Portal Ciudadano
                            </CBadge>
                            <h1 className="display-5 fw-bold mb-2" style={{ letterSpacing: '-1px' }}>
                                Bienvenido, <span style={{ color: '#818cf8' }}>{user?.first_name || 'Ciudadano'}</span>
                            </h1>
                            <p className="lead mb-4" style={{ maxWidth: '560px', color: '#cbd5e1' }}>
                                Monitorea el estado de la seguridad pública, sigue el desempeño de los oficiales y presenta tus denuncias en tiempo real.
                            </p>
                            <div className="d-flex gap-3 flex-wrap">
                                <CButton color="primary" size="lg" className="px-5 rounded-pill border-0"
                                    style={{ background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)' }}
                                    onClick={() => navigate('/complaints')}>
                                    Presentar Denuncia
                                </CButton>
                                <CButton variant="outline" color="light" size="lg" className="px-4 rounded-pill border-opacity-25"
                                    onClick={() => navigate('/Zones')}>
                                    <CIcon icon={cilLocationPin} className="me-2" /> Mapa en Vivo
                                </CButton>
                            </div>
                        </div>
                    </div>
                </CCol>
            </CRow>

            {loading ? (
                <div className="text-center py-5"><CSpinner color="primary" /></div>
            ) : (
                <>
                    <CRow className="mb-5 g-4">
                        <StatCard label="Casos Totales" value={stats.total} icon={cilNotes} color="#6366f1" total={stats.total} loaded={stats.loaded} />
                        <StatCard label="Resueltos" value={stats.resolved} icon={cilCheckCircle} color="#10b981" total={stats.total} loaded={stats.loaded} />
                        <StatCard label="En Investigación" value={stats.investigating} icon={cilWarning} color="#f59e0b" total={stats.total} loaded={stats.loaded} />
                        <StatCard label="Prioridad Alta" value={stats.highPriority} icon={cilChartLine} color="#ef4444" total={stats.total} loaded={stats.loaded} />
                    </CRow>
                    <CRow className="g-5">
                        <OfficerLeaderboard officerStats={stats.officerStats} loaded={stats.loaded} navigate={navigate} />
                        <DonutSidebar statusData={stats.statusData} />
                    </CRow>
                </>
            )}
            <style>{`.welcome-stat-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important; }`}</style>
        </div>
    )
}

// ─── OFFICER DASHBOARD ────────────────────────────────────────────────────────
const OfficerDashboard = ({ user, navigate }) => {
    const [data, setData] = useState(null)
    const [loaded, setLoaded] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getOfficerDashboardStats()
            .then(d => { setData(d); setTimeout(() => setLoaded(true), 200) })
            .catch(e => console.error('Officer stats error:', e))
            .finally(() => setLoading(false))
    }, [])

    const counts = data?.counts || {}
    const recentCases = data?.recentCases || []

    return (
        <div className="fade-in px-2 pb-5">
            {/* Hero */}
            <CRow className="mb-4 pt-3">
                <CCol xs={12}>
                    <div style={{ ...heroBase, background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }} className="p-5 text-white shadow-lg">
                        <div className="position-absolute" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', top: '-100px', right: '-100px', zIndex: 0 }} />
                        <div className="position-relative" style={{ zIndex: 1 }}>
                            <CBadge color="success" className="p-2 px-3 rounded-pill mb-3"
                                style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.5)' }}>
                                <CIcon icon={cilBadge} className="me-1" /> Panel de Oficial
                            </CBadge>
                            <h1 className="display-5 fw-bold mb-2" style={{ letterSpacing: '-1px' }}>
                                Oficial <span style={{ color: '#34d399' }}>{user?.first_name || ''} {user?.last_name || ''}</span>
                            </h1>
                            <p className="lead mb-4" style={{ maxWidth: '560px', color: '#cbd5e1' }}>
                                Gestiona tus casos asignados, monitorea el estado de cada investigación y mantén tu eficiencia al máximo.
                            </p>
                            <div className="d-flex gap-3 flex-wrap">
                                <CButton color="success" size="lg" className="px-5 rounded-pill border-0"
                                    style={{ background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)' }}
                                    onClick={() => navigate('/complaints')}>
                                    Ver Denuncias
                                </CButton>
                                <CButton variant="outline" color="light" size="lg" className="px-4 rounded-pill border-opacity-25"
                                    onClick={() => navigate('/Officers')}>
                                    <CIcon icon={cilPeople} className="me-2" /> Mis Colegas
                                </CButton>
                            </div>
                        </div>
                    </div>
                </CCol>
            </CRow>

            {loading ? (
                <div className="text-center py-5"><CSpinner color="success" /></div>
            ) : (
                <>
                    <CRow className="mb-5 g-4">
                        <StatCard label="Casos Totales" value={counts.total || 0} icon={cilTask} color="#6366f1" total={counts.total || 0} loaded={loaded} />
                        <StatCard label="Resueltos" value={counts.resolved || 0} icon={cilCheckCircle} color="#10b981" total={counts.total || 0} loaded={loaded} />
                        <StatCard label="En Investigación" value={counts.investigating || 0} icon={cilWarning} color="#f59e0b" total={counts.total || 0} loaded={loaded} />
                        <StatCard label="Eficiencia" value={`${counts.efficiency || 0}%`} icon={cilChartLine} color="#34d399" total={100} loaded={loaded} />
                    </CRow>

                    <CRow className="g-4">
                        <CCol lg={8}>
                            <CCard className="border-0 shadow-sm" style={{ borderRadius: '20px' }}>
                                <CCardHeader className="bg-transparent border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                                    <h5 className="fw-bold mb-0">Mis Casos Asignados</h5>
                                    <CButton variant="ghost" color="primary" size="sm" onClick={() => navigate('/complaints')}>
                                        Ver todos <CIcon icon={cilArrowRight} />
                                    </CButton>
                                </CCardHeader>
                                <CCardBody className="px-4 pb-4">
                                    {recentCases.length === 0 ? (
                                        <div className="text-center py-5 text-muted">
                                            <CIcon icon={cilTask} size="3xl" className="mb-3 opacity-25" />
                                            <p className="mb-0">No tienes casos asignados actualmente.</p>
                                        </div>
                                    ) : recentCases.map((c, i) => (
                                        <div key={c.id} className="d-flex align-items-center py-3"
                                            style={{ borderBottom: i < recentCases.length - 1 ? '1px solid var(--cui-border-color-translucent)' : 'none' }}>
                                            <div className="me-3 rounded-circle d-flex align-items-center justify-content-center"
                                                style={{ width: 40, height: 40, background: `${priorityColor(c.priority)}20`, flexShrink: 0 }}>
                                                <CIcon icon={cilTask} style={{ color: priorityColor(c.priority) }} />
                                            </div>
                                            <div className="flex-grow-1 overflow-hidden">
                                                <div className="fw-semibold text-truncate">{c.title}</div>
                                                <small className="text-muted">{c.zone} · Denunciante: {c.complainant}</small>
                                            </div>
                                            <CBadge style={{ background: statusColor(c.status), color: '#fff', borderRadius: '20px', padding: '4px 10px', flexShrink: 0 }}>
                                                {statusLabel(c.status)}
                                            </CBadge>
                                        </div>
                                    ))}
                                </CCardBody>
                            </CCard>
                        </CCol>
                        <CCol lg={4}>
                            <CCard className="border-0 shadow-lg" style={{ borderRadius: '24px', background: '#0f172a' }}>
                                <CCardHeader className="bg-transparent border-0 pt-4 px-4">
                                    <h5 className="fw-bold text-white mb-0">Distribución de Casos</h5>
                                </CCardHeader>
                                <CCardBody className="p-4 pt-2">
                                    <CChartDoughnut
                                        data={{
                                            labels: ['Recibidos', 'En Investigación', 'Resueltos'],
                                            datasets: [{
                                                backgroundColor: ['#6366f1', '#f59e0b', '#10b981'],
                                                hoverBackgroundColor: ['#818cf8', '#fbbf24', '#34d399'],
                                                borderWidth: 0,
                                                data: [counts.received || 0, counts.investigating || 0, counts.resolved || 0],
                                            }],
                                        }}
                                        options={{ cutout: '75%', plugins: { legend: { display: false } } }}
                                    />
                                    <div className="mt-4">
                                        {[
                                            { label: 'Recibidos', color: '#6366f1', val: counts.received || 0 },
                                            { label: 'En Investigación', color: '#f59e0b', val: counts.investigating || 0 },
                                            { label: 'Resueltos', color: '#10b981', val: counts.resolved || 0 },
                                        ].map(item => (
                                            <div key={item.label} className="d-flex justify-content-between align-items-center mb-2">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded-circle me-2" style={{ width: 10, height: 10, background: item.color }} />
                                                    <span className="text-light small">{item.label}</span>
                                                </div>
                                                <span className="text-light fw-bold small">{item.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 p-3 rounded-3" style={{ background: 'rgba(52,211,153,0.08)', border: '1px dashed rgba(52,211,153,0.3)' }}>
                                        <div className="text-success fw-bold text-center" style={{ fontSize: '2rem' }}>{counts.efficiency || 0}%</div>
                                        <div className="text-muted text-center small">Tasa de resolución</div>
                                    </div>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    </CRow>
                </>
            )}
            <style>{`.welcome-stat-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important; }`}</style>
        </div>
    )
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
const AdminDashboard = ({ user, navigate }) => {
    const [stats, setStats] = useState({
        total: 0, resolved: 0, pending: 0, investigating: 0, highPriority: 0,
        statusData: [0, 0, 0, 0, 0], officerStats: [], loaded: false
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allComplaints, allOfficers] = await Promise.all([listComplaints(), listOfficers()])
                const total = allComplaints.length
                const resolved = allComplaints.filter(c => c.status === 'resolved' || c.status === 'closed').length
                const investigating = allComplaints.filter(c => c.status === 'under_investigation').length
                const highPriority = allComplaints.filter(c => c.priority === 'high').length
                const statusCounts = { received: 0, under_investigation: 0, resolved: 0, dismissed: 0, rejected: 0 }
                allComplaints.forEach(c => { if (statusCounts[c.status] !== undefined) statusCounts[c.status]++ })
                const officerPerformance = allOfficers.map(officer => {
                    const assigned = allComplaints.filter(c => c.assignedOfficerId === officer.id)
                    const solved = assigned.filter(c => c.status === 'resolved' || c.status === 'closed').length
                    return { ...officer, assignedCount: assigned.length, resolvedCount: solved, efficiency: assigned.length > 0 ? Math.round((solved / assigned.length) * 100) : 0 }
                }).sort((a, b) => b.resolvedCount - a.resolvedCount)
                setStats({ total, resolved, investigating, highPriority, statusData: Object.values(statusCounts), officerStats: officerPerformance, loaded: true })
            } catch (err) {
                console.error('Admin dashboard error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="fade-in px-2 pb-5">
            {/* Hero */}
            <CRow className="mb-4 pt-3">
                <CCol xs={12}>
                    <div style={{ ...heroBase, background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }} className="p-5 text-white shadow-lg welcome-card-tour">
                        <div className="position-absolute" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', top: '-100px', left: '-100px', zIndex: 0 }} />
                        <CRow className="position-relative" style={{ zIndex: 1 }}>
                            <CCol md={8}>
                                <div className="d-flex align-items-center mb-3">
                                    <CBadge color="primary" className="p-2 px-3 rounded-pill me-2"
                                        style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.5)' }}>
                                        <CIcon icon={cilShieldAlt} className="me-1" /> Sistema Activo
                                    </CBadge>
                                </div>
                                <h1 className="display-4 fw-bold mb-3" style={{ letterSpacing: '-1.5px' }}>
                                    Mando Judicial <span style={{ color: '#818cf8' }}>Inteligente</span>
                                </h1>
                                <p className="lead mb-4 fs-5" style={{ maxWidth: '600px', color: '#fff' }}>
                                    Orqueste la seguridad pública con integración de datos en tiempo real.
                                </p>
                                <div className="d-flex gap-3 mt-4 flex-wrap">
                                    <CButton color="primary" size="lg" className="px-5 rounded-pill shadow-lg border-0"
                                        style={{ background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)' }}
                                        onClick={() => navigate('/complaints')}>Presentar Denuncia</CButton>
                                    <CButton variant="outline" color="light" size="lg" className="px-4 rounded-pill border-opacity-25"
                                        onClick={() => navigate('/Zones')}>
                                        <CIcon icon={cilLocationPin} className="me-2" /> Mapa en Vivo
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

            {loading ? (
                <div className="text-center py-5"><CSpinner color="primary" /></div>
            ) : (
                <>
                    <CRow className="mb-5 g-4">
                        <StatCard label="Casos Totales" value={stats.total} icon={cilNotes} color="#6366f1" total={stats.total} loaded={stats.loaded} />
                        <StatCard label="Resueltos" value={stats.resolved} icon={cilCheckCircle} color="#10b981" total={stats.total} loaded={stats.loaded} />
                        <StatCard label="En Investigación" value={stats.investigating} icon={cilWarning} color="#f59e0b" total={stats.total} loaded={stats.loaded} />
                        <StatCard label="Prioridad Alta" value={stats.highPriority} icon={cilChartLine} color="#ef4444" total={stats.total} loaded={stats.loaded} />
                    </CRow>
                    <CRow className="g-5">
                        <OfficerLeaderboard officerStats={stats.officerStats} loaded={stats.loaded} navigate={navigate} />
                        <DonutSidebar statusData={stats.statusData} />
                    </CRow>
                </>
            )}
            <style>{`.welcome-stat-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important; } .smaller { font-size: 0.75rem; }`}</style>
        </div>
    )
}

// ─── MAIN ROUTER ──────────────────────────────────────────────────────────────
const Welcome = () => {
    const navigate = useNavigate()
    const user = getCurrentUser()
    const role = user?.role

    if (role === 'civil') return <CivilDashboard user={user} navigate={navigate} />
    if (role === 'oficial') return <OfficerDashboard user={user} navigate={navigate} />
    return <AdminDashboard user={user} navigate={navigate} />
}

export default Welcome
