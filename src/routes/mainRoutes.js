const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Highscore = require("../models/highscores");
const User = require("../models/users");
const { protect } = require("../controllers/authController");
const publicDirectoryPath = path.join(__dirname, "../../public");
router.use(express.static(publicDirectoryPath));

router.post("/", async (req, res, next) => {
  if (req.body.IndexForm === "Login") {
    //kontrollera att användaren finns
    const { username, password } = req.body;

    if (!username || !password) {
      return res.send("Missing username or password");
    }

    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.send("Incorrect username or password");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SIGNINGKEY);
    // skicka till nästa sida (gamePage)
    res
      .setHeader("Authorization", `Bearer ${token}`)
      .sendFile(publicDirectoryPath + "/gamePage.html");
  }

  if (req.body.IndexForm === "Signup") {
    // hämta värde från body och skapa ny User i databas
    await User.create(req.body);

    // skicka tillbaks till samma sida
    res.sendFile(publicDirectoryPath + "/index.html");
  }
});

//get routes
router.get("/about", (req, res) => {
  res.send("Created by Calle, Christian and Marcus");
  // res.sendFile(publicDirectoryPath +  '/reaction.html');
});

router.get("/GamePage", protect, (req, res) => {
  res.sendFile(publicDirectoryPath + "/gamePage.html");
  console.log("GamePage route");
});

router.get("/ReactionGame", (req, res) => {
  res.sendFile(publicDirectoryPath + "/reaction.html");
  console.log("reactionGameRoute");
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
