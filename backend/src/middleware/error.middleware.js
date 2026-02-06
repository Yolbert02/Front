const errorHandler = (err, req, res, next) => {
    console.error('--- [Global Error Handler] ---');
    console.error(`Error context: ${req.method} ${req.originalUrl}`);
    console.error(`Message: ${err.message}`);
    console.error(`Stack trace:`, err.stack);
    console.error('------------------------------');

    // Default error status and message
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Error interno del servidor';

    // Handle Prisma specific errors
    if (err.code === 'P2002') {
        statusCode = 409;
        message = `Ya existe un registro con ese valor único: ${err.meta?.target}`;
    }

    if (err.code === 'P2025') {
        statusCode = 404;
        message = 'El registro solicitado no existe';
    }

    res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;
