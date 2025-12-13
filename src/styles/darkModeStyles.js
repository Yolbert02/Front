export const modalStyles = {
    header: {
        backgroundColor: 'var(--cui-modal-header-bg)',
        color: 'var(--cui-body-color)',
        borderColor: 'var(--cui-border-color)'
    },
    body: {
        backgroundColor: 'var(--cui-modal-bg)',
        color: 'var(--cui-body-color)'
    },
    bodyScrollable: {
        maxHeight: '70vh',
        overflowY: 'auto',
        backgroundColor: 'var(--cui-modal-bg)',
        color: 'var(--cui-body-color)'
    },
    footer: {
        backgroundColor: 'var(--cui-modal-footer-bg)',
        borderColor: 'var(--cui-border-color)'
    }
}


export const cardStyles = {
    card: {
        backgroundColor: 'var(--cui-card-bg)',
        borderColor: 'var(--cui-border-color)'
    },
    header: {
        backgroundColor: 'var(--cui-card-cap-bg)',
        color: 'var(--cui-body-color)',
        borderColor: 'var(--cui-border-color)'
    },
    body: {
        backgroundColor: 'var(--cui-card-bg)',
        color: 'var(--cui-body-color)'
    }
}


export const containerStyles = {
    lightBg: {
        backgroundColor: 'var(--cui-tertiary-bg)',
        borderColor: 'var(--cui-border-color)'
    },
    secondaryBg: {
        backgroundColor: 'var(--cui-secondary-bg)',
        borderColor: 'var(--cui-border-color)'
    },
    bodyBg: {
        backgroundColor: 'var(--cui-body-bg)',
        color: 'var(--cui-body-color)'
    },
    previewBox: {
        backgroundColor: 'var(--cui-tertiary-bg)',
        border: '1px solid var(--cui-border-color)'
    }
}

export const textStyles = {
    previewLabel: {
        color: 'var(--cui-body-color)',
        fontWeight: '600'
    },
    previewText: {
        color: 'var(--cui-body-color)'
    },
    previewMuted: {
        color: 'var(--cui-secondary-color)'
    },
    previewPlaceholder: {
        color: 'var(--cui-secondary-color)',
        opacity: '0.7'
    }
}

export const listStyles = {
    item: {
        backgroundColor: 'var(--cui-list-group-bg)',
        color: 'var(--cui-body-color)',
        borderColor: 'var(--cui-border-color)'
    }
}


export const authStyles = {
    container: {
        minHeight: '100vh',
        backgroundColor: 'var(--cui-body-bg)'
    },
    card: {
        backgroundColor: 'var(--cui-card-bg)',
        borderColor: 'var(--cui-border-color)',
        color: 'var(--cui-body-color)'
    },
    cardHeader: {
        backgroundColor: 'var(--cui-card-cap-bg)',
        borderColor: 'var(--cui-border-color)',
        color: 'var(--cui-body-color)'
    },
    cardBody: {
        backgroundColor: 'var(--cui-card-bg)',
        color: 'var(--cui-body-color)'
    }
}

export default {
    modal: modalStyles,
    card: cardStyles,
    container: containerStyles,
    list: listStyles,
    auth: authStyles,
    text: textStyles
}
