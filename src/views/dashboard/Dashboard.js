import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import classNames from 'classnames'

import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cibCcAmex,
  cibCcApplePay,
  cibCcMastercard,
  cibCcPaypal,
  cibCcStripe,
  cibCcVisa,
  cibGoogle,
  cibFacebook,
  cibLinkedin,
  cifBr,
  cifEs,
  cifFr,
  cifIn,
  cifPl,
  cifUs,
  cibTwitter,
  cilCloudDownload,
  cilPeople,
  cilUser,
  cilUserFemale,
} from '@coreui/icons'

import avatar1 from 'src/assets/images/avatars/1.jpg'
import avatar2 from 'src/assets/images/avatars/2.jpg'
import avatar3 from 'src/assets/images/avatars/3.jpg'
import avatar4 from 'src/assets/images/avatars/4.jpg'
import avatar5 from 'src/assets/images/avatars/5.jpg'
import avatar6 from 'src/assets/images/avatars/6.jpg'

import WidgetsBrand from '../widgets/WidgetsBrand'
import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'

import { getDashboardStats, downloadComplaintsExcel } from 'src/services/reports'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [officers, setOfficers] = useState([])
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsData, officersData] = await Promise.all([
        getDashboardStats(),
        listOfficers()
      ])
      setStats(statsData)
      setOfficers(officersData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadExcel = async () => {
    try {
      await downloadComplaintsExcel()
      dispatch({
        type: 'set',
        appAlert: {
          visible: true,
          color: 'success',
          message: 'Your XLS downloaded successfully',
        },
      })
    } catch (error) {
      console.error('Error downloading XLS:', error)
      dispatch({
        type: 'set',
        appAlert: {
          visible: true,
          color: 'danger',
          message: 'Error downloading Excel report',
        },
      })
    }
  }

  const progressExample = stats ? [
    { title: 'Total Users', value: `${stats.counts.users}`, percent: 100, color: 'success' },
    { title: 'Total Complaints', value: `${stats.counts.complaints}`, percent: 100, color: 'info' },
    { title: 'Officers', value: `${stats.counts.officers}`, percent: 100, color: 'warning' },
    { title: 'Active Complaints', value: `${stats.complaintsByStatus.find(s => s.status === 'received')?.count || 0}`, percent: 0, color: 'danger' },
  ] : []

  const progressGroupExample1 = stats?.complaintsByStatus ? stats.complaintsByStatus.map(s => ({
    title: s.status.charAt(0).toUpperCase() + s.status.slice(1).replace('_', ' '),
    value: s.count,
    percent: stats.counts.complaints ? Math.round((s.count / stats.counts.complaints) * 100) : 0
  })) : []

  const progressGroupExample2 = stats?.complaintsByPriority ? stats.complaintsByPriority.map(p => ({
    title: p.priority.charAt(0).toUpperCase() + p.priority.slice(1).replace('_', ' '),
    value: p.count,
    percent: stats.counts.complaints ? Math.round((p.count / stats.counts.complaints) * 100) : 0,
    icon: cilUser
  })) : []

  const progressGroupExample3 = [
    { title: 'Google Search', icon: cibGoogle, percent: 56, value: '191,235' },
    { title: 'Facebook', icon: cibFacebook, percent: 15, value: '51,223' },
    { title: 'Twitter', icon: cibTwitter, percent: 11, value: '37,564' },
    { title: 'LinkedIn', icon: cibLinkedin, percent: 8, value: '27,319' },
  ]

  return (
    <>
      <WidgetsDropdown className="mb-4" stats={stats} />
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">
                Traffic
              </h4>
              <div className="small text-body-secondary">January - July 2023</div>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CButton color="primary" className="float-end" onClick={handleDownloadExcel}>
                <CIcon icon={cilCloudDownload} />
              </CButton>
              <CButtonGroup className="float-end me-3">
                {['Day', 'Month', 'Year'].map((value) => (
                  <CButton
                    color="outline-secondary"
                    key={value}
                    className="mx-0"
                    active={value === 'Month'}
                  >
                    {value}
                  </CButton>
                ))}
              </CButtonGroup>
            </CCol>
          </CRow>
          <MainChart data={stats?.complaintsTrend} />
        </CCardBody>
        <CCardFooter>
          <CRow
            xs={{ cols: 1, gutter: 4 }}
            sm={{ cols: 2 }}
            lg={{ cols: 4 }}
            xl={{ cols: 5 }}
            className="mb-2 text-center"
          >
            {progressExample.map((item, index, items) => (
              <CCol
                className={classNames({
                  'd-none d-xl-block': index + 1 === items.length,
                })}
                key={index}
              >
                <div className="text-body-secondary">{item.title}</div>
                <div className="fw-semibold text-truncate">
                  {item.value} ({item.percent}%)
                </div>
                <CProgress thin className="mt-2" color={item.color} value={item.percent} />
              </CCol>
            ))}
          </CRow>
        </CCardFooter>
      </CCard>
      <WidgetsBrand className="mb-4" withCharts />
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Complaints Growth {' & '} Statistics</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol xs={12} md={6} xl={6}>
                  <CRow>
                    <CCol xs={6}>
                      <div className="border-start border-start-4 border-start-info py-1 px-3">
                        <div className="text-body-secondary text-truncate small">Total Complaints</div>
                        <div className="fs-5 fw-semibold">{stats?.counts.complaints || 0}</div>
                      </div>
                    </CCol>
                    <CCol xs={6}>
                      <div className="border-start border-start-4 border-start-danger py-1 px-3 mb-3">
                        <div className="text-body-secondary text-truncate small">
                          Active Cases
                        </div>
                        <div className="fs-5 fw-semibold">{stats?.complaintsByStatus?.find(s => s.status === 'under_investigation')?.count || 0}</div>
                      </div>
                    </CCol>
                  </CRow>
                  <hr className="mt-0" />
                  <h6 className="mb-3 small text-uppercase fw-bold text-body-secondary">Complaints by Status</h6>
                  {progressGroupExample1.map((item, index) => (
                    <div className="progress-group mb-4" key={index}>
                      <div className="progress-group-prepend">
                        <span className="text-body-secondary small">{item.title}</span>
                        <span className="ms-2 fw-semibold small">({item.value})</span>
                      </div>
                      <div className="progress-group-bars">
                        <CProgress thin color="info" value={item.percent} />
                      </div>
                    </div>
                  ))}
                </CCol>
                <CCol xs={12} md={6} xl={6}>
                  <CRow>
                    <CCol xs={6}>
                      <div className="border-start border-start-4 border-start-warning py-1 px-3 mb-3">
                        <div className="text-body-secondary text-truncate small">Police Officers</div>
                        <div className="fs-5 fw-semibold">{stats?.counts.officers || 0}</div>
                      </div>
                    </CCol>
                    <CCol xs={6}>
                      <div className="border-start border-start-4 border-start-success py-1 px-3 mb-3">
                        <div className="text-body-secondary text-truncate small">Total Users</div>
                        <div className="fs-5 fw-semibold">{stats?.counts.users || 0}</div>
                      </div>
                    </CCol>
                  </CRow>

                  <hr className="mt-0" />
                  <h6 className="mb-3 small text-uppercase fw-bold text-body-secondary">Complaints by Priority</h6>

                  {progressGroupExample2.map((item, index) => (
                    <div className="progress-group mb-4" key={index}>
                      <div className="progress-group-header">
                        <CIcon className="me-2" icon={item.icon} size="lg" />
                        <span>{item.title}</span>
                        <span className="ms-auto fw-semibold">{item.value}%</span>
                      </div>
                      <div className="progress-group-bars">
                        <CProgress thin color="warning" value={item.value} />
                      </div>
                    </div>
                  ))}

                  <div className="mb-5"></div>

                  {progressGroupExample3.map((item, index) => (
                    <div className="progress-group" key={index}>
                      <div className="progress-group-header">
                        <CIcon className="me-2" icon={item.icon} size="lg" />
                        <span>{item.title}</span>
                        <span className="ms-auto fw-semibold">
                          {item.value}{' '}
                          <span className="text-body-secondary small">({item.percent}%)</span>
                        </span>
                      </div>
                      <div className="progress-group-bars">
                        <CProgress thin color="success" value={item.percent} />
                      </div>
                    </div>
                  ))}
                </CCol>
              </CRow>

              <br />

              <CCardHeader className="px-0 border-0 bg-transparent">
                <h5 className="mb-0">Police Officers List</h5>
              </CCardHeader>

              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead className="text-nowrap">
                  <CTableRow>
                    <CTableHeaderCell className="bg-body-tertiary text-center">
                      <CIcon icon={cilPeople} />
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Officer</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Unit / Rank</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Contact</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">Status</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {officers.map((officer, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell className="text-center">
                        <CAvatar size="md" src={officer.profile_picture || avatar1} status={officer.active ? 'success' : 'danger'} />
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="fw-semibold">{officer.name} {officer.lastName}</div>
                        <div className="small text-body-secondary">
                          Badge: {officer.badge_number}
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div>{officer.unit}</div>
                        <div className="small text-body-secondary">{officer.rank}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="small text-body-secondary">{officer.email}</div>
                        <div className="fw-semibold">{officer.idNumber}</div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <span className={`badge bg-${officer.active ? 'success' : 'danger'}`}>
                          {officer.status}
                        </span>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
