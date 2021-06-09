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

//contest routes
router.post('/contests/choice', authTokenMiddleware, async (req, res) => {
  // console.log(req.body);
  // console.log(req.body.contestId);
  const contest = await Contest.findOne({ _id: req.body.contestId });
  // console.log(contest);
  const user = await User.findOne({ _id: req.user.id });
  const userName = user.username;

  const foundParticipant = contest.participants.find(x => {
    return x.username == userName;
  })
  console.log(req.body.choice);
  foundParticipant.state = req.body.choice;

  await contest.save();

  //if all but one declined, remove the contest
  res.status(200).send('OK');

})
router.post('/contests', authTokenMiddleware, async (req, res) => {
  const contest = await Contest.create(req.body);
  // console.log(contest);
  res.status(200).send('OK');
});
router.get('/contests', authTokenMiddleware, async (req, res) => {
  console.log('GET contests posted to!');

  const user = await User.findOne({ _id: req.user.id });
  const userName = user.username;
  const contests = await Contest.find({'participants.username': userName } );
  // console.log(contests[0].participants);

  //update contests before sending them to client
  let listToDeleteContest = [];
  let listToDeleteParticipant = [];
  contests.forEach(async contest => {

    //check if enough people declined the invitation, then delete the contest
    if(contest.state == 'invitation'){
      const declinedParticipants = contest.participants.filter(x => {
        return x.state == 'declined' || x.state == 'resigned';
      })
      if(declinedParticipants.length >= contest.participants.length - 1){
        listToDeleteContest.push(contest);
        return;
      }
    }
    //check if creator resigned, then delete contest
    const creatorParticipant = contest.participants.find(x => {
      return x.username == contest.creator;
    })
    if(creatorParticipant.state == 'resigned'){
      listToDeleteContest.push(contest);
      return;
    }
    //check if contest ended:
    const endDate = new Date(contest.endDate).toISOString();
    if(contest.state == 'active' || contest.state == 'invitation'){
      if(endDate < new Date().toISOString()){
        console.log('contest has ended');
        //if contest didnt reach out of invitationstage, just delete it
        if(contest.state == 'invitation'){
          listToDeleteContest.push(contest);
          return;
        }
        else {
          //set state to finished (dont display finished contests, if not specifically chosen)
          contest.state = 'finished';
          console.log('set to finished');
          await contest.save();
        }

        return;
      }
    }

    //check if a new contest is going active (from invitation to active):
    //in that case delete the participants that didn't accept the invitation, or
    //delete the contest, if there is only one player who accepted
    const date = new Date(contest.startDate).toISOString();

    let today = new Date();
    let hours = today.getHours();
    today.setHours(hours + 2);
    if(date < today.toISOString() && endDate > today.toISOString() && contest.state == 'invitation'){
      //set state on contest to active
      contest.state = 'active';
      console.log('set to active');
      //remove participants that didn't accept invitations in time
      listToDeleteParticipant = contest.participants.filter(x => {
        return x.state == 'pending';
      })
      listToDeleteParticipant.forEach(deleteThis => {
        contest.participants.remove(deleteThis);
      })
      await contest.save();
      //remove contest if not enough players accepted
      const listAccepted = contest.participants.filter(x =>{
        return x.state == 'accepted';
      })
      if(listAccepted.length < 2){
        listToDeleteContest.push(contest);
      }
    }

  });

  //delete contests that didnt make it out of invitationstage before the end time, or
  //contests that didn't reach more than 1 participant
  if(listToDeleteContest.length > 0){
    listToDeleteContest.forEach(async deleteThis => {

      const index = contests.indexOf(deleteThis);
      contests.splice(index, 1);
      await deleteThis.remove();
    })
  }

  res.status(200).json(contests);
});
//END contest routes

router.get("/alert", authTokenMiddleware, async (req, res) => {
  const user = await User.findOne({ _id: req.user.id });
  res.json(user.alert);
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

  const convo = await Conversation.find(
    { participants: participants[0] },
    { participants: participants[1] }
  );

  //är där ingen, skapa ny konvo
  let conv;
  if (convo.length < 1) {
    console.log("reached this 🐶");
    conv = await Conversation.create(req.body);
  } else {
    // om den finns, lägg till i db-array

    const filter = {
      participants: participants[0],
      participants: participants[1],
    };

    await Conversation.updateOne(filter, { $push: { messages: req.body.messages } });
  }

  await User.updateOne(
    { username: participants[1] },
    { $set: { alert: true } },
    { upsert: true }
  );

  res.send(conv);
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
