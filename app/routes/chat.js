const express = require('express');

const { authorization } = require('../middlewares/authorization');
const { createChat } = require('../controllers/chat');

const router = express.Router();

router.post('/create', authorization, createChat);
module.exports = router;
