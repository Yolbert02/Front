import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CAlert } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBurn, cilCheckCircle, cilInfo, cilWarning } from '@coreui/icons'

const AppAlert = () => {
    const dispatch = useDispatch()
    const appAlert = useSelector((state) => state.appAlert)

    React.useEffect(() => {
        if (appAlert.visible) {
            const timer = setTimeout(() => {
                handleClose()
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [appAlert.visible])

    const getAlertIcon = (color) => {
        switch (color) {
            case 'success':
                return cilCheckCircle
            case 'warning':
                return cilWarning
            case 'danger':
                return cilBurn
            case 'info':
            case 'primary':
            default:
                return cilInfo
        }
    }

    const handleClose = () => {
        dispatch({
            type: 'set',
            appAlert: {
                ...appAlert,
                visible: false
            },
        })
    }

    if (!appAlert || !appAlert.visible || !appAlert.message) return null

    const Icon = getAlertIcon(appAlert.color)

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            minWidth: '300px',
            maxWidth: '400px',
            width: 'auto'
        }}>
            <CAlert
                color={appAlert.color}
                dismissible
                visible={appAlert.visible}
                onClose={handleClose}
                className="d-flex align-items-center shadow-lg border-0"
            >
                <CIcon
                    icon={Icon}
                    className="flex-shrink-0 me-2"
                    width={24}
                    height={24}
                />
                <div className="fw-semibold">{appAlert.message}</div>
            </CAlert>
        </div>
    )
}

export default AppAlert