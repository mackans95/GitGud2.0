const express = require('express');
const router = new express.Router();
const path = require('path');
const Highscore = require('../models/highscores');
const user = require('../models/users');

const publicDirectoryPath = path.join(__dirname, '../../public');
router.use(express.static(publicDirectoryPath));

router.get('/ReactionGame', (req, res) => {
    res.sendFile(publicDirectoryPath +  '/reaction.html');
    console.log("reactionGameRoute");
})

router.post('/ReactionGame', async (req,res) => {

    const highscore = await Highscore(req.body);
    try{
        await highscore.save();
        res.status(201).send(highscore);

    }catch(e){
        res.status(400).send(e)
    }
})



module.exports = router;