import React from 'react'
import {
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CButton,
    CRow,
    CCol,
    CCard,
    CCardBody,
    CCardHeader,
    CBadge,
    CListGroup,
    CListGroupItem
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilWarning,
    cilUser,
    cilLocationPin,
    cilCalendar,
    cilDescription,
    cilEnvelopeOpen,
    cilPhone,
    cilBalanceScale,
    cilClock
} from '@coreui/icons'
import { modalStyles, cardStyles } from 'src/styles/darkModeStyles'

const InfoNotification = ({ visible, onClose, notification }) => {
    if (!notification) return null

    const getStatusBadge = (status) => {
        const statusConfig = {
            'scheduled': { color: 'primary', text: 'Scheduled' },
            'in_progress': { color: 'warning', text: 'In Progress' },
            'completed': { color: 'success', text: 'Completed' },
            'cancelled': { color: 'danger', text: 'Cancelled' },
            'postponed': { color: 'info', text: 'Postponed' }
        }

        const config = statusConfig[status] || { color: 'secondary', text: status }
        return <CBadge color={config.color}>{config.text}</CBadge>
    }

    const getPriorityBadge = (priority) => {
        const priorityConfig = {
            'high': { color: 'danger', text: 'High' },
            'medium': { color: 'warning', text: 'Medium' },
            'low': { color: 'success', text: 'Low' }
        }

        const config = priorityConfig[priority] || { color: 'secondary', text: priority }
        return <CBadge color={config.color}>{config.text}</CBadge>
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Not available'
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch (e) {
            return 'Invalid date'
        }
    }

    const formatTime = (timeString) => {
        if (!timeString) return ''
        return timeString
    }

    const getParticipantsCount = (notification) => {
        const officials = notification.officials?.length || 0
        const witnesses = notification.witnesses?.length || 0
        const jury = notification.jury?.length || 0
        return officials + witnesses + jury + (notification.judge_id ? 1 : 0)
    }

    return (
        <CModal size="lg" visible={visible} onClose={onClose}>
            <CModalHeader style={modalStyles.header}>
                <CModalTitle>
                    <CIcon icon={cilBalanceScale} className="me-2" />
                    Judicial Notification - {notification.case_number}
                </CModalTitle>
            </CModalHeader>
            <CModalBody style={modalStyles.bodyScrollable}>
                <CRow className="g-3">
                    <CCol md={12}>
                        <CCard className="mb-4" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilBalanceScale} className="me-2" />
                                    Case Information
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CRow className="g-3">
                                    <CCol md={8}>
                                        <h5>{notification.case_title}</h5>
                                        <p className="text-muted">{notification.case_description}</p>
                                    </CCol>
                                    <CCol md={4}>
                                        <div className="d-flex flex-column gap-2">
                                            <div className="d-flex justify-content-between">
                                                <span>Status:</span>
                                                {getStatusBadge(notification.status)}
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span>Priority:</span>
                                                {getPriorityBadge(notification.priority)}
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span>Case Number:</span>
                                                <strong>{notification.case_number}</strong>
                                            </div>
                                        </div>
                                    </CCol>
                                </CRow>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md={6}>
                        <CCard className="h-100" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilBalanceScale} className="me-2" />
                                    Court Information
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Court:</span>
                                        <strong>{notification.court || 'Not specified'}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Location:</span>
                                        <strong>{notification.location || 'Not specified'}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Judge:</span>
                                        <strong>{notification.judge_name || 'Not assigned'}</strong>
                                    </CListGroupItem>
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md={6}>
                        <CCard className="h-100" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilUser} className="me-2" />
                                    Participants
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Total Participants:</span>
                                        <CBadge color="primary">{getParticipantsCount(notification)}</CBadge>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Officials:</span>
                                        <CBadge color="info">{notification.officials?.length || 0}</CBadge>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Witnesses:</span>
                                        <CBadge color="warning">{notification.witnesses?.length || 0}</CBadge>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Jury Members:</span>
                                        <CBadge color="success">{notification.jury?.length || 0}</CBadge>
                                    </CListGroupItem>
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md={6}>
                        <CCard className="h-100" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilCalendar} className="me-2" />
                                    Hearing Information
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Date:</span>
                                        <strong>{formatDate(notification.hearing_date)}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Time:</span>
                                        <strong>{formatTime(notification.hearing_time) || 'Not specified'}</strong>
                                    </CListGroupItem>
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md={6}>
                        <CCard className="h-100" style={cardStyles.card}>
                            <CCardHeader style={cardStyles.header}>
                                <h6 className="mb-0">
                                    <CIcon icon={cilClock} className="me-2" />
                                    Trial Information
                                </h6>
                            </CCardHeader>
                            <CCardBody style={cardStyles.body}>
                                <CListGroup flush>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Date:</span>
                                        <strong>{formatDate(notification.trial_date)}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Time:</span>
                                        <strong>{formatTime(notification.trial_time) || 'Not specified'}</strong>
                                    </CListGroupItem>
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    {notification.officials && notification.officials.length > 0 && (
                        <CCol md={12}>
                            <CCard style={cardStyles.card}>
                                <CCardHeader style={cardStyles.header}>
                                    <h6 className="mb-0">Case Officials</h6>
                                </CCardHeader>
                                <CCardBody style={cardStyles.body}>
                                    <CListGroup flush>
                                        {notification.officials.map((official, index) => (
                                            <CListGroupItem key={index} className="px-0">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span>
                                                        <strong>{official.name}</strong>
                                                        <br />
                                                        <small className="text-muted">{official.role}</small>
                                                    </span>
                                                    <CBadge color="info">Official</CBadge>
                                                </div>
                                            </CListGroupItem>
                                        ))}
                                    </CListGroup>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    )}
                    {notification.witnesses && notification.witnesses.length > 0 && (
                        <CCol md={12}>
                            <CCard style={cardStyles.card}>
                                <CCardHeader style={cardStyles.header}>
                                    <h6 className="mb-0">Witnesses</h6>
                                </CCardHeader>
                                <CCardBody style={cardStyles.body}>
                                    <CListGroup flush>
                                        {notification.witnesses.map((witness, index) => (
                                            <CListGroupItem key={index} className="px-0">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span>
                                                        <strong>{witness.name}</strong>
                                                        <br />
                                                        <small className="text-muted">{witness.role}</small>
                                                    </span>
                                                    <CBadge color="warning">Witness</CBadge>
                                                </div>
                                            </CListGroupItem>
                                        ))}
                                    </CListGroup>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    )}
                    {notification.jury && notification.jury.length > 0 && (
                        <CCol md={12}>
                            <CCard style={cardStyles.card}>
                                <CCardHeader style={cardStyles.header}>
                                    <h6 className="mb-0">Jury Members</h6>
                                </CCardHeader>
                                <CCardBody style={cardStyles.body}>
                                    <CListGroup flush>
                                        {notification.jury.map((juryMember, index) => (
                                            <CListGroupItem key={index} className="px-0">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span>
                                                        <strong>{juryMember.name}</strong>
                                                        <br />
                                                        <small className="text-muted">{juryMember.role}</small>
                                                    </span>
                                                    <CBadge color="success">Juror</CBadge>
                                                </div>
                                            </CListGroupItem>
                                        ))}
                                    </CListGroup>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    )}
                </CRow>
            </CModalBody>
            <CModalFooter style={modalStyles.footer}>
                <CButton color="secondary" onClick={onClose}>
                    Close
                </CButton>
            </CModalFooter>
        </CModal>
    )
}

export default InfoNotification