const express = require('express');
const path = require('path');
const router = express.Router();

const publicDirectoryPath = path.join(__dirname, '../../public');
router.use(express.static(publicDirectoryPath));

const Highscore = require('../models/highscores');
const User = require('../models/users');
const authTokenMiddleware = require("../controllers/userAuth");

//ROUTES /AimGaim
router.get('/AimGaim', authTokenMiddleware, (req, res) => {
    res.sendFile(publicDirectoryPath +  '/AimGaim.html');
    console.log("AimGameRoute");
})

//post routes
router.post('/AimGaim', authTokenMiddleware, async (req, res)=>{
    // console.log(req.body);

    // const highscore = new Highscore({
    //     gamename: req.body.gamename,
    //     username: req.body.username,
    //     score: req.body.score,
    //     date: Date.now()
    // })

    // highscore.save()
    //     .then(data => {
    //         console.log('saved object to db');
    //         res.status(201).json(data);
    //     })
    //     .catch(err => {
    //         res.status(404);
    //     });

    if(!req.user){
      return res.status(400).send('No logged in user');
    }
    const userId = req.user.id;
    const user = await User.findOne({ '_id': userId});
    if(!user){
      return res.status(400).send('No logged in user');
    }
    const userName = user.username;
    // console.log(req.body);
    req.body.username = userName;

    const highscore2 = await Highscore.create(req.body);
    res.status(201).json({
        status: "successful",
        data: {
          highscore: highscore2,
        },
      });
})

module.exports = router;