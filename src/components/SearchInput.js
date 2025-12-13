import React from 'react'
import { CFormInput, CInputGroup, CInputGroupText, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilX } from '@coreui/icons'

const SearchInput = ({
    value,
    onChange,
    placeholder = "Search",
    className = ""
}) => {

    const handleClear = () => {
        if (onChange) {
            onChange({ target: { value: '' } })
        }
    }

    return (
        <CInputGroup className={className}>
            <CInputGroupText className="border-end-0 text-muted bg-white dark:bg-dark-subtle">
                <CIcon icon={cilSearch} />
            </CInputGroupText>
            <CFormInput
                className="border-start-0 ps-0 border-end-0"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
            {value && (
                <CInputGroupText className="border-start-0 bg-white dark:bg-dark-subtle p-0">
                    <CButton
                        color="secondary"
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="py-1 px-2 text-muted"
                    >
                        <CIcon icon={cilX} />
                    </CButton>
                </CInputGroupText>
            )}
        </CInputGroup>
    )
}

export default SearchInput