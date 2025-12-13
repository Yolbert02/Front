    import React from 'react'
    import { CPagination, CPaginationItem } from '@coreui/react'

    const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange,
    size = 'md'
    }) => {
    if (totalPages <= 1) return null

    const handlePrevious = () => {
        if (currentPage > 1) {
        onPageChange(currentPage - 1)
        }
    }

    const handleNext = () => {
        if (currentPage < totalPages) {
        onPageChange(currentPage + 1)
        }
    }

    const handlePageClick = (page) => {
        if (page >= 1 && page <= totalPages) {
        onPageChange(page)
        }
    }

    const renderPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 3
        
        let startPage = Math.max(1, currentPage - 2)
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
        
        if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
        }

        for (let i = startPage; i <= endPage; i++) {
        pages.push(
            <CPaginationItem 
            key={i} 
            active={i === currentPage}
            onClick={() => handlePageClick(i)}
            style={{ cursor: 'pointer' }}
            >
            {i}
            </CPaginationItem>
        )
        }
        
        return pages
    }

    return (
        <CPagination size={size} aria-label="Page navigation" className="justify-content-center">
        <CPaginationItem 
            aria-label="Previous"
            disabled={currentPage === 1}
            onClick={handlePrevious}
            style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
        >
            <span aria-hidden="true">&laquo;</span>
        </CPaginationItem>
        
        {renderPageNumbers()}
        
        <CPaginationItem 
            aria-label="Next"
            disabled={currentPage === totalPages}
            onClick={handleNext}
            style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
        >
            <span aria-hidden="true">&raquo;</span>
        </CPaginationItem>
        </CPagination>
    )
    }

    export default Pagination