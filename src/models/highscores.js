const mongoose = require('mongoose');

const highscoreSchema = mongoose.Schema({
    gamename: {
        type: String,
        required: true
    },
    username: {    
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Highscores', highscoreSchema);