const express = require('express');
const router = new express.Router();
const path = require('path');
const Highscore = require('../models/highscores');
const user = require('../models/users');
const auth = require('../controllers/auth')

const publicDirectoryPath = path.join(__dirname, '../../public');
router.use(express.static(publicDirectoryPath));

router.get('/ReactionGame', auth, (req, res) => {
    res.sendFile(publicDirectoryPath +  '/reaction.html');
    // console.log("reactionGameRoute");
})

router.post('/ReactionGame', auth, async (req,res) => {

    try{
        // hämtar all data från auth. Utom score
        const highscore = await Highscore({score: req.body.score, username: req.user.username, gamename: req.game});
        await highscore.save();
        res.status(201).send(highscore);

    }catch(e){
        res.status(400).send(e)
    }
})



module.exports = router;