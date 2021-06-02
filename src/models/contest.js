const mongoose = require('mongoose');

const Highscore = require('./highscores');
// const User = require('./users');

const contestSchema = mongoose.Schema({
    gamename: {
        type: String,
        required: true
    },
    creator: {    
        type: String,
        required: true
    },
    participants: [ String ] ,
    scores: [ Highscore.schema ],
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    state: {
        type: String
    }
})

module.exports = mongoose.model('contests', contestSchema);