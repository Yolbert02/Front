const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const verifyToken = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

const validate = require('../middleware/validate.middleware');
const { createUserSchema } = require('../validators/userSchema');

// Public/Registration
router.post('/', validate(createUserSchema), userController.createUser);

// Protected routes
router.get('/', verifyToken, authorize('administrator'), userController.getAllUsers);
router.get('/:id', verifyToken, authorize(['administrator', 'oficial']), userController.getUserById);
router.put('/:id', verifyToken, userController.updateUser); // Controller will check if self or admin
router.delete('/:id', verifyToken, authorize('administrator'), userController.deleteUser);

module.exports = router;
