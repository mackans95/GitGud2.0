const express = require('express');
const path = require('path');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;

const publicDirectoryPath = path.join(__dirname, '../../public');
router.use(express.static(publicDirectoryPath));

const Highscore = require('../models/highscores');
const User = require('../models/users');
const authTokenMiddleware = require("../controllers/userAuth");

//ROUTES /AimGaim
router.get('/AimGaim', authTokenMiddleware, async (req, res) => {

    res.sendFile(publicDirectoryPath +  '/AimGaim.html');

    console.log("AimGameRoute");
})

router.get('/AimGaim/personalHighscores', authTokenMiddleware, async (req, res) => {
    //send leaderboards
    const user = await User.findById(req.user.id);
    const personalLeaderboard = await Highscore.find({"username" : user.username, "gamename" : "AimGaim"});
    personalLeaderboard.sort((a, b) => {return b.score - a.score});

    var arrayToString = JSON.stringify(Object.assign({}, personalLeaderboard));  // convert array to string
    var stringToJsonObject = JSON.parse(arrayToString);  // convert string to json object

    res.json(stringToJsonObject);
})
router.get('/AimGaim/globalHighscores', authTokenMiddleware, async (req, res) => {
  //send leaderboards
  const globalLeaderboard = await Highscore.find({"gamename" : "AimGaim"});
  globalLeaderboard.sort((a, b) => {return b.score - a.score});
  const slicedglobalLeaderboard = globalLeaderboard.slice(0, 5);

  // console.log(slicedglobalLeaderboard);
  var arrayToString = JSON.stringify(Object.assign({}, slicedglobalLeaderboard));  // convert array to string
  var stringToJsonObject = JSON.parse(arrayToString);  // convert string to json object

  res.json(stringToJsonObject);
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

    req.body.username = userName;

    //compare to other highscores
    let newHsHigher = false;
    const playersHighscores = await Highscore.find({"username" : userName, "gamename" : "AimGaim"});

    //if there are 5 scores saved for the user already, check if this one is better
    if(playersHighscores.length > 4){  
      playersHighscores.forEach(hs => {
        if(hs.score < req.body.score){
          newHsHigher = true;
        }
      });

      if(!newHsHigher){
        return res.status(200).send("Score isn't good enough");
      }
      else{
        //delete the lowest score, by first ordering them
        playersHighscores.sort((a, b)=>{
          return a.score - b.score;
        })
        await Highscore.remove({ _id : ObjectId(playersHighscores[0]._id) });
      }
    }

    const highscore2 = await Highscore.create(req.body);
    res.status(201).json({
        status: "successful",
        data: {
          highscore: highscore2,
        },
      });
})

module.exports = router;

