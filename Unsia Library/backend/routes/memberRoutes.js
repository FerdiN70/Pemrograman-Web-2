const express = require('express');
const router = express.Router();
const { getMembers, createMember, deleteMember } = require('../controllers/memberController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMembers);
router.post('/', protect, createMember);
router.delete('/:id', protect, deleteMember);

module.exports = router;