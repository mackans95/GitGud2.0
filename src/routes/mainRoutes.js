const express = require("express");
const path = require("path");
const router = express.Router();
const Highscore = require("../models/highscores");
const User = require("../models/users");
const Contest = require("../models/contest");
const { login } = require("../controllers/authController");
const publicDirectoryPath = path.join(__dirname, "../../public");
const jwt = require('jsonwebtoken');
const e = require("express");
const { send } = require("process");
const authTokenMiddleware = require("../controllers/userAuth");
router.use(express.static(publicDirectoryPath));

// AUTH
router.post("/", async (req, res) => {
  if (req.body.IndexForm === "Login") {
    await login(req, res);
  }

  if (req.body.IndexForm === "Signup") {
    await User.create(req.body);

    res.sendFile(publicDirectoryPath + "/index.html");
  }

  if (req.body.IndexForm === "Guest") {
    const user = await User.create({
      username: `GUEST${Math.trunc(Math.random() * 1000)}`,
      password: "password",
    });

    req.body.username = user.username;
    req.body.password = user.password;

    await login(req, res);
  }
});

//get routes
router.get("/about", authTokenMiddleware, (req, res) => {
  res.send("Created by Calle, Christian and Marcus");
  // res.sendFile(publicDirectoryPath +  '/reaction.html');
});


router.get("/GamePage", authTokenMiddleware, (req, res) => {
  res.sendFile(publicDirectoryPath + "/gamePage.html");
  console.log("GamePage route");
});

//contest route
router.post('/contests', authTokenMiddleware, async (req, res) => {
  console.log('contests posted to!');
  console.log(req.body);

  const contest = await Contest.create(req.body);
  console.log(contest);
  res.status(200).send('OK');
});

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
