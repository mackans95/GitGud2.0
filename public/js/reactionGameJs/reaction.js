// import leaderboardHandler from "/js/general/LeaderboardHandler.js";

// let leaderboardHandlerOne = new leaderboardHandler;

// ---- Add listener to back button ----
const backBtn = document.querySelector(`[data-name="back-btn"]`);
backBtn.addEventListener("click", () => {
  window.location.href = "/GamePage";
});
//--------------------------------------

// Get elemtens
let canvasEl = document.querySelector(".canvas");
let startBtn = document.querySelector(".start");
let score = document.querySelector(".top-score");
let gameTextOne = document.querySelector(".ingame-text-one");
let gameTextTwo = document.querySelector(".ingame-text-two");
//

let GameStatus = {
  STOP: 1,
  START: 2,
};

let status = GameStatus.STOP;
let currentHighScore = -1;
let toEarlyBoolean = true;
let timeNow;
let timeLater;
let timeTotal;
let startMeasuringTime;

startBtn.addEventListener("click", function () {
  if (status === GameStatus.START) {
    endGame();
  } else {
    this.innerText = "Stop Game";
    startGame();
  }
});

function gameTime(min, max) {
  let result = Math.floor(Math.random() * Math.floor(max)) + min;
  result = result * 1000;
  return result;
}

function measureReaction(time) {
  toEarlyBoolean = true;
  canvasEl.addEventListener("click", function () {
    if (toEarlyBoolean) {
      clickedTooEarly();
    }
  });

  startMeasuringTime = setTimeout(function () {
    toEarlyBoolean = false;
    canvasEl.style.backgroundColor = "#2ecc71";
    gameTextOne.innerText = "CLICK!";
    gameTextTwo.innerText = "";
    let date1 = new Date();
    timeNow = date1.getTime();

    canvasEl.addEventListener("click", ClickedOnGame, { once: true });
  }, time);
}

function ClickedOnGame() {
  let date2 = new Date();
  timeLater = date2.getTime();
  timeTotal = timeLater - timeNow;
  startBtn.innerText = "Play Again";

  checkIfTopScore(timeTotal);
  displayYourScore(timeTotal);
}

function startGame() {
  status = GameStatus.START;
  let timeBeforeScreenChange = gameTime(1, 5);
  canvasEl.style.backgroundColor = "#e74c3c";
  gameTextOne.innerText = "...";
  gameTextTwo.innerText = "wait for green";
  measureReaction(timeBeforeScreenChange);
}

// TODO dessa två är nästan idendiska.. fixa..
function clickedTooEarly() {
  toEarlyBoolean = false;
  canvasEl.removeEventListener("click", ClickedOnGame);
  clearTimeout(startMeasuringTime);
  gameTextOne.innerText = "Dummy";
  gameTextTwo.innerText = "You clicked too soon";
  startBtn.innerText = "Try Again";
  status = GameStatus.STOP;
}

function endGame() {
  toEarlyBoolean = false;
  canvasEl.removeEventListener("click", ClickedOnGame);
  clearTimeout(startMeasuringTime);
  canvasEl.style.backgroundColor = "#3498db";
  gameTextOne.innerText = "Reaction Game";
  gameTextTwo.innerText =
    "When the red box turns green, click as quickly as you can.";
  startBtn.innerText = "Start Game";
  status = GameStatus.STOP;
}

function checkIfTopScore(yourScore) {
  if (yourScore < currentHighScore || currentHighScore === -1) {
    currentHighScore = yourScore;
    score.innerText = "Current highscore: " + yourScore + "ms";
  }
}

function displayYourScore(timeTotal) {
  canvasEl.style.backgroundColor = "#3498db";
  gameTextOne.innerText = timeTotal + " ms";
  if (timeTotal <= 300) {
    gameTextTwo.innerText = "Damn you're quick!";
  } else if (timeTotal <= 400) {
    gameTextTwo.innerText = "Decent I guess";
  } else {
    gameTextTwo.innerText = "Embarrassing!";
  }
  status = GameStatus.STOP;
}

// GAME LOGIC END ------------------------------------------------------------

// SUBMIT PERSONAL LEADERBOARD -----------------------------------------------

// get elements
const submitScoreBtn = document.querySelector(".postHighscores");

// submit highscore
submitScoreBtn.addEventListener("click", function (e) {
  // let updatedHighscoreOnLoggedInUser = leaderboardHandlerOne.setHighscoreToLoggedInUser("highscorereactiongame", currentHighScore, false);

  // let serializedUsers = JSON.stringify(updatedHighscoreOnLoggedInUser);

  // localStorage.setItem("users", serializedUsers);

  if (currentHighScore < 1) return;

  fetch("http://localhost:3000/ReactionGame", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      // gamename: "ReactionGame",
      // username: "Mr. Postfrom Clint",
      score: currentHighScore,
    }),
  })
    .then((response) => response.json())
    .then((data) => console.log(data));

  location.reload();
});

// function setHighscoreToLoggedInUser() {
//   const users = fetchUsers();
//   const theGuyThatIsLoggedIn = sessionStorage.getItem("loggedInUser");
//   users.forEach(function (user) {
//     if (user.username === theGuyThatIsLoggedIn) {

//       if(!user.highscorereactiongame && currentHighScore !== -1){
//         user.highscorereactiongame = [currentHighScore];
//       }else if(currentHighScore === -1){
//         return;
//       }else if(user.highscorereactiongame.includes(currentHighScore)){
//         return;
//       }else{

//         user.highscorereactiongame.sort(function(a, b){return a - b});

//         if (currentHighScore !== -1 && user.highscorereactiongame[4] > currentHighScore){
//           user.highscorereactiongame[4] = currentHighScore;

//         }else if(user.highscorereactiongame.length < 5 ) {
//           user.highscorereactiongame.push(currentHighScore);
//         }
//         user.highscorereactiongame.sort(function(a, b){return a - b});
//         let topFive = user.highscorereactiongame.slice(0,5)

//         user.highscorereactiongame = topFive;

//       }

//     }
//   });
//   return users;
// }

// function fetchUsers() {
//   const serializedUsers = localStorage.getItem("users");
//   return JSON.parse(serializedUsers) ?? [];
// }

// SUBMIT PERSONAL LEADERBOARD END -----------------------------------------------

// LOAD LEADERBOARDS-----------------------------------------------

// function LoadPersonalLeaderboard(){

//   const users = fetchUsers();
//   const tbodyPersonal = document.querySelector(".personal tbody")
//   const tbodyGlobal = document.querySelector(".global tbody")
//   const template = document.querySelector("#highscore-row");

//   const theGuyThatIsLoggedIn = sessionStorage.getItem("loggedInUser");
//   users.forEach(function (user) {
//     if (user.username === theGuyThatIsLoggedIn && user.highscorereactiongame) {

//       for (let i = 0; i < user.highscorereactiongame.length; i++) {

//         let tr = template.content.cloneNode(true);

//         let tdName = tr.querySelector("td.name");
//         let tdScore = tr.querySelector("td.score");

//         tdName.textContent = user.username;
//         tdScore.textContent = user.highscorereactiongame[i] + "ms";

//         tbodyPersonal.appendChild(tr);
//       }
//     };
//   });

//   let globalHighscoreArray = [];

//   users.forEach(function (user){

//     if(user.highscorereactiongame){
//       user.highscorereactiongame.forEach(function (score){

//         let best = {
//           name: user.username,
//           hs: score
//         }
//         globalHighscoreArray.push(best)

//       })
//     }
//   });

//   let sortedHighscores = globalHighscoreArray.sort((a, b) => a.hs - b.hs).slice(0,5);

//   sortedHighscores.forEach(function (user) {

//     let tr = template.content.cloneNode(true);

//     let tdName = tr.querySelector("td.name");
//     let tdScore = tr.querySelector("td.score");

//     tdName.textContent = user.name;
//     tdScore.textContent = user.hs + "ms";

//     tbodyGlobal.appendChild(tr);

//   })

// }

// LoadPersonalLeaderboard();

const response = await fetch("http://localhost:3000/ReactionGame/Leaderboards", {
  method: "GET",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
const personalLeaderboard = await response.json();

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}
var c = getCookie("username");

let LoggedInUserHighscores = personalLeaderboard.filter((hs) => hs.username == c);

showLeaderboards(LoggedInUserHighscores, personalLeaderboard);

function showLeaderboards(personalHighscores, globalHighscores) {
  const tbodyPersonal = document.querySelector(".personal tbody");
  const tbodyGlobal = document.querySelector(".global tbody");
  const template = document.querySelector("#highscore-row");

  // personalHighscores = [].slice.call(personalHighscores);
  //Personal leaderboard
  //change sort() if lower hs is better than higher
  personalHighscores.sort((a, b) => {
    return a.score - b.score;
  });

  personalHighscores.forEach((highscore) => {
    let tr = template.content.cloneNode(true);

    let tdName = tr.querySelector("td.name");
    let tdScore = tr.querySelector("td.score");

    tdName.textContent = highscore.username;
    if (highscore.gamename == "reactiongame") {
      tdScore.textContent = highscore.score + "ms";
    } else {
      tdScore.textContent = highscore.score;
    }

    tbodyPersonal.appendChild(tr);
  });
  //END Personal leaderboard

  if (!globalHighscores) {
    return;
  }
  //Global leaderboard
  //change sort() if lower hs is better than higher
  globalHighscores.sort((a, b) => {
    return a.score - b.score;
  });
  const topFive = globalHighscores.slice(0, 5);
  topFive.forEach((highscore) => {
    let tr = template.content.cloneNode(true);

    let tdName = tr.querySelector("td.name");
    let tdScore = tr.querySelector("td.score");

    tdName.textContent = highscore.username;
    if (highscore.gamename == "reactiongame") {
      tdScore.textContent = highscore.score + "ms";
    } else {
      tdScore.textContent = highscore.score;
    }

    tbodyGlobal.appendChild(tr);
  });
  //END Global leaderboard
}

// leaderboardHandlerOne.LoadPersonalLeaderboard("highscorereactiongame", false);
