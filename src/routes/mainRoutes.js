const express = require('express');
const path = require('path');
const router = express.Router();
const Highscore = require('../models/highscores');
const User = require('../models/users');

const publicDirectoryPath = path.join(__dirname, '../../public');
router.use(express.static(publicDirectoryPath));

//get routes
router.get('/about', (req, res) => {
    res.send('Created by Calle, Christian and Marcus')
    // res.sendFile(publicDirectoryPath +  '/reaction.html');
})

router.get('/GamePage', (req, res) => {
    res.sendFile(publicDirectoryPath +  '/gamePage.html');
    console.log("GamePage route");
})



// router.get('/AimGaim', (req, res) => {
//     res.sendFile(publicDirectoryPath +  '/AimGaim.html');
//     console.log("AimGameRoute");
// })

// //post routes
// router.post('/AimGaim', async (req, res)=>{
//     // console.log(req.body);

//     // const highscore = new Highscore({
//     //     gamename: req.body.gamename,
//     //     username: req.body.username,
//     //     score: req.body.score,
//     //     date: Date.now()
//     // })

//     // console.log(highscore);

//     // highscore.save()
//     //     .then(data => {
//     //         console.log('saved object to db');
//     //         res.status(201).json(data);
//     //     })
//     //     .catch(err => {
//     //         res.status(404);
//     //     });

//     const highscore2 = await Highscore.create(req.body);
//     res.status(201).json({
//         status: "successful",
//         data: {
//           highscore: highscore2,
//         },
//       });
// })

module.exports = router;