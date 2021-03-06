'use strict';
const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    adminId: {
        type: Number,
        index: true
    },
    chatId: {
        type: Number,
        index: true
    },
    minutesInterval: {
        type: Number,
        default: 15
    },
    chatTitle: String,
});

module.exports = mongoose.model('Chat', schema);