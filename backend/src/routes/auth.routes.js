const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verifyToken = require('../middleware/auth.middleware');

const validate = require('../middleware/validate.middleware');
const { z } = require('zod');

const loginSchema = z.object({
    email: z.string().email("Formato de email inválido"),
    password: z.string().min(1, "La contraseña es requerida")
});

router.post('/login', validate(loginSchema), authController.login);
router.get('/profile', verifyToken, authController.getProfile);

// Password Management
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', verifyToken, authController.changePassword);

module.exports = router;
