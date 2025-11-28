import React from 'react'
import {
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CButton
} from '@coreui/react'

const ConfirmationModal = ({ 
    visible, 
    onClose, 
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to perform this action?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger"
}) => {
    return (
        <CModal 
            visible={visible} 
            onClose={onClose}
            backdrop="static"
        >
        <CModalHeader>
            <CModalTitle>{title}</CModalTitle>
        </CModalHeader>
        <CModalBody>
            <p>{message}</p>
        </CModalBody>
        <CModalFooter>
            <CButton color="secondary" onClick={onClose}>
                {cancelText}
            </CButton>
        <CButton 
            color={type} 
            onClick={onConfirm}
        >
            {confirmText}
            </CButton>
        </CModalFooter>
    </CModal>
    )
}

export default ConfirmationModal