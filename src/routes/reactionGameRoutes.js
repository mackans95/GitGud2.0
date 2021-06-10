const express = require('express');
const router = new express.Router();
const path = require('path');
const Highscore = require('../models/highscores');
const user = require('../models/users');
const auth = require('../controllers/auth')
var ObjectId = require('mongodb').ObjectID;
const Contest = require("../models/contest");


const publicDirectoryPath = path.join(__dirname, '../../public');
router.use(express.static(publicDirectoryPath));

router.get('/ReactionGame', auth, (req, res) => {
    res.sendFile(publicDirectoryPath +  '/reaction.html');
    // console.log("reactionGameRoute");
})

router.post('/ReactionGame', auth, async (req,res) => {

    try{
        
        const highscore = await Highscore({score: req.body.score, username: req.user.username, gamename: req.game});

        const allHighscores = await Highscore.find({ gamename: req.game, username: req.user.username });


//////////////////////////////////////////////////////////////////

        //check if player is participating in any contest in AimGaim
        const contestsInAim = await Contest.find({'participants.username' : req.user.username});
        if(contestsInAim.length > 0){
        contestsInAim.forEach(async contest => {

            const endDate = new Date(contest.endDate).toISOString();
            let today = new Date();
            let hours = today.getHours();
            today.setHours(hours + 2);
            if(contest.gamename == 'ReactionGame' && contest.state == 'active' && endDate > today.toISOString()){
            //if contest is active and hasn't yet finished, and is AimGaim
            console.log('saving score to contest!');
            contest.scores.push(highscore);
            await contest.save();
            }
        });
    }

//////////////////////////////////////////////////////////////////




        allHighscores.push(highscore);

        allHighscores.sort((a,b) => {
            return a.score - b.score;
        });

        if(allHighscores.length > 5){

            const worstHighscore = allHighscores.pop();

            await Highscore.remove({ _id : ObjectId(worstHighscore._id) });

            allHighscores.forEach(async (hs) => {
                await hs.save();
            })
        } else{

            await highscore.save();
        }
        
        res.status(201).send(highscore);

    }catch(e){
        res.status(400).send(e)
    }
})

router.get('/ReactionGame/Leaderboards', auth, async (req, res) => {

    try{
        const highscores = await Highscore.find({ gamename: 'ReactionGame' });

        res.send(highscores)
    }catch(e){
        res.status(404).send();
    }

})



module.exports = router;