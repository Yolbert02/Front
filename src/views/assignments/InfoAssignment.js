import React from 'react'
import { useDispatch } from 'react-redux'
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
    cilClock,
    cilCloudDownload
} from '@coreui/icons'
import { modalStyles, cardStyles } from 'src/styles/darkModeStyles'

const InfoAssignment = ({ visible, onClose, assignment }) => {
    const dispatch = useDispatch()
    if (!assignment) return null

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Scheduled': { color: 'primary', text: 'Scheduled' },
            'In Progress': { color: 'warning', text: 'In Progress' },
            'Completed': { color: 'success', text: 'Completed' },
            'Cancelled': { color: 'danger', text: 'Cancelled' },
            'Postponed': { color: 'info', text: 'Postponed' }
        }

        const config = statusConfig[status] || { color: 'secondary', text: status }
        return <CBadge color={config.color}>{config.text}</CBadge>
    }

    const getPriorityBadge = (priority) => {
        const priorityConfig = {
            'High': { color: 'danger', text: 'High' },
            'Medium': { color: 'warning', text: 'Medium' },
            'Low': { color: 'success', text: 'Low' }
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

    const getParticipantsCount = (assignment) => {
        const officials = assignment.officials?.length || 0
        const witnesses = assignment.witnesses?.length || 0
        const jury = assignment.jury?.length || 0
        return officials + witnesses + jury + (assignment.judge_id ? 1 : 0)
    }

    const downloadPDF = (id) => {
        dispatch({
            type: 'set',
            appAlert: {
                visible: true,
                color: 'success',
                message: 'Your PDF downloaded successfully',
            },
        })
    }

    return (
        <CModal size="lg" visible={visible} onClose={onClose}>
            <CModalHeader style={modalStyles.header}>
                <CModalTitle>
                    <CIcon icon={cilBalanceScale} className="me-2" />
                    Assignment - {assignment.case_number}
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
                                        <h5>{assignment.case_title}</h5>
                                        <p className="text-muted">{assignment.case_description}</p>
                                    </CCol>
                                    <CCol md={4}>
                                        <div className="d-flex flex-column gap-2">
                                            <div className="d-flex justify-content-between">
                                                <span>Status:</span>
                                                {getStatusBadge(assignment.status)}
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span>Priority:</span>
                                                {getPriorityBadge(assignment.priority)}
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span>Case Number:</span>
                                                <strong>{assignment.case_number}</strong>
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
                                        <strong>{assignment.court || 'Not specified'}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Location:</span>
                                        <strong>{assignment.location || 'Not specified'}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Judge:</span>
                                        <strong>{assignment.judge_name || 'Not assigned'}</strong>
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
                                        <CBadge color="primary">{getParticipantsCount(assignment)}</CBadge>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Officials:</span>
                                        <CBadge color="info">{assignment.officials?.length || 0}</CBadge>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Witnesses:</span>
                                        <CBadge color="warning">{assignment.witnesses?.length || 0}</CBadge>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Jury Members:</span>
                                        <CBadge color="success">{assignment.jury?.length || 0}</CBadge>
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
                                        <strong>{formatDate(assignment.hearing_date)}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Time:</span>
                                        <strong>{formatTime(assignment.hearing_time) || 'Not specified'}</strong>
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
                                        <strong>{formatDate(assignment.trial_date)}</strong>
                                    </CListGroupItem>
                                    <CListGroupItem className="d-flex justify-content-between align-items-center px-0">
                                        <span>Time:</span>
                                        <strong>{formatTime(assignment.trial_time) || 'Not specified'}</strong>
                                    </CListGroupItem>
                                </CListGroup>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    {assignment.officials && assignment.officials.length > 0 && (
                        <CCol md={12}>
                            <CCard style={cardStyles.card}>
                                <CCardHeader style={cardStyles.header}>
                                    <h6 className="mb-0">Case Officials</h6>
                                </CCardHeader>
                                <CCardBody style={cardStyles.body}>
                                    <CListGroup flush>
                                        {assignment.officials.map((official, index) => (
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
                    {assignment.witnesses && assignment.witnesses.length > 0 && (
                        <CCol md={12}>
                            <CCard style={cardStyles.card}>
                                <CCardHeader style={cardStyles.header}>
                                    <h6 className="mb-0">Witnesses</h6>
                                </CCardHeader>
                                <CCardBody style={cardStyles.body}>
                                    <CListGroup flush>
                                        {assignment.witnesses.map((witness, index) => (
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
                    {assignment.jury && assignment.jury.length > 0 && (
                        <CCol md={12}>
                            <CCard style={cardStyles.card}>
                                <CCardHeader style={cardStyles.header}>
                                    <h6 className="mb-0">Jury Members</h6>
                                </CCardHeader>
                                <CCardBody style={cardStyles.body}>
                                    <CListGroup flush>
                                        {assignment.jury.map((juryMember, index) => (
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
                <CButton
                    size="lg"
                    variant="outline"
                    className="text-danger shadow-sm"
                    onClick={() => downloadPDF(assignment.id)}
                    title="Download PDF"
                >
                    <CIcon icon={cilCloudDownload} />
                </CButton>
                <CButton color="secondary" onClick={onClose}>
                    Close
                </CButton>
            </CModalFooter>
        </CModal>
    )
}

export default InfoAssignment