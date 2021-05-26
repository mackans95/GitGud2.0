const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    friends: [{ 
        type: String 
    }]
})

module.exports = mongoose.model('users', userSchema);