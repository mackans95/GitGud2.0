const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const router = express.Router();
// const Highscore = require("../models/highscores");
const User = require("../models/users");
const Contest = require("../models/contest");
const { login } = require("../controllers/authController");
const publicDirectoryPath = path.join(__dirname, "../../public");
// const jwt = require("jsonwebtoken");
// const e = require("express");
// const { send } = require("process");
const authTokenMiddleware = require("../controllers/userAuth");
const Conversation = require("../models/conversationModel");
router.use(express.static(publicDirectoryPath));

// AUTH
router.post("/", async (req, res) => {
  console.log("reached this");
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

router.get("/users", authTokenMiddleware, async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    users,
  });
});

router.get("/users/:username", authTokenMiddleware, async (req, res) => {
  const user = await User.findOne({ username: req.params.username });

  res.status(200).json({
    user,
  });
});

router.get("/GamePage", authTokenMiddleware, (req, res) => {
  res.sendFile(publicDirectoryPath + "/gamePage.html");
  console.log("GamePage route");
});

//contest route
router.post("/contests", authTokenMiddleware, async (req, res) => {
  console.log("contests posted to!");
  console.log(req.body);

  const contest = await Contest.create(req.body);
  console.log(contest);
  res.status(200).send("OK");
});

router.get("/alert", authTokenMiddleware, async (req, res) => {
  const user = await User.findOne({ _id: req.user.id });
  res.json(user.alert);
});

router.get("/conversations", authTokenMiddleware, async (req, res) => {
  const user = await User.findOne({ _id: req.user.id });

  const username = user.username;

  const convos = await Conversation.find({ participants: username });

  res.json(convos);
});

//POSTS
router.post("/addFriend", authTokenMiddleware, async (req, res) => {
  console.log("---- Hi from post server ----");
  const friendName = req.body.username;

  await User.updateOne(
    { _id: req.user.id },
    { $push: { friends: { username: friendName } } },
    { upsert: true }
  );

  const currentUser = await User.findOne({ _id: req.user.id });
  const cUsername = currentUser.username;

  await User.updateOne(
    { username: friendName },
    { $push: { friends: { username: cUsername } } },
    { upsert: true }
  );

  res.send();
});

router.post("/conversations", authTokenMiddleware, async (req, res) => {
  // plocka ut participants kolla efter convo
  const participants = req.body.participants;

  const convo = await Conversation.find({
    participants: [participants[0], participants[1]],
  });

  const convo2 = await Conversation.find({
    participants: [participants[1], participants[0]],
  });

  //är där ingen, skapa ny konvo
  let conv;
  if (convo.length < 1 && convo2.length < 1) {
    console.log("reached this 🐶");
    conv = await Conversation.create(req.body);
  } else {
    // om den finns, lägg till i db-array
    const filter = {
      participants: [participants[0], participants[1]],
    };

    const filter2 = {
      participants: [participants[1], participants[0]],
    };

    await Conversation.findOneAndUpdate(filter, {
      $push: { messages: req.body.messages[0] },
    });

    await Conversation.findOneAndUpdate(filter2, {
      $push: { messages: req.body.messages[0] },
    });
  }

  await User.updateOne(
    { username: participants[1] },
    { $push: { alert: { new: true, sender: participants[0] } } },
    { upsert: true }
  );

  res.json(req.body);
});

// PATCH
router.patch("/users", authTokenMiddleware, async (req, res) => {
  const user = await User.findOneAndUpdate(
    { _id: req.user.id },
    { $pull: { alert: { new: true, sender: req.body.sender } } },
    { new: true }
  );
  console.log(req.body.sender);
  console.log(user);

  res.json(user);
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
