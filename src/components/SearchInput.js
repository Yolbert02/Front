import React, { useState } from 'react'
import { CFormInput, CButton, CInputGroup } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilX } from '@coreui/icons'

const SearchInput = ({ 
    placeholder = "Search...", 
    onSearch,
    size = "md",
    className = ""
}) => {
    const [searchTerm, setSearchTerm] = useState('')

    const handleSearch = () => {
        if (onSearch) {
            onSearch(searchTerm.trim())
        }
    }

    const handleClear = () => {
        setSearchTerm('')
        if (onSearch) {
            onSearch('')
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    return (
        <CInputGroup className={className}>
            <CFormInput
                type="text"
                size={size}
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
            />
            {searchTerm && (
                <CButton 
                    color="secondary" 
                    variant="outline"
                    onClick={handleClear}
                    title="Clear search"
            >
            <CIcon icon={cilX} />
                </CButton>
            )}
        <CButton 
            color="primary" 
            onClick={handleSearch}
            title="Search"
        >
        <CIcon icon={cilSearch} />
            </CButton>
        </CInputGroup>
    )
}

export default SearchInput