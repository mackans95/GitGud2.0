import leaderboardHandler from "../general/LeaderboardHandler.js";
// import '/js/general/leaderboardHandler.js';

// ---- Add listener to back button ----
const backBtn = document.querySelector(`[data-name="back-btn"]`);
backBtn.addEventListener("click", () => {
  window.location.href = "/GamePage";
});
//--------------------------------------

/*************************************/
/* INITIALIZE AIM GAIM */
/*************************************/
let firstIteration = true;
let gameRunning = false;
let gameTimer = 2000;
let countDown = 0;
let respawnTimer = 0;
let currentHighScore = -1;
let gameSettings = {
  gameDifficulty: "easy",
  enemyDisplay: "img",
};

let mainBody = document.querySelector("#aimGaimMainWindow");

let enemy = document.querySelector("#enemy");
let enemyHead = document.querySelector("#enemyHead");
let infoBox1 = document.querySelector("#aimGaimInfo1");
let infoBox2 = document.querySelector("#aimGaimInfo2");
let infoBox3 = document.querySelector("#aimGaimInfo3");
let infoBox4 = document.querySelector("#aimGaimInfo4");
let infoBox5 = document.querySelector("#aimGaimInfo5");
let infoBox6 = document.querySelector("#aimGaimInfo6");
const buttonStart = document.querySelector("#buttonStart");
const buttonRestart = document.querySelector("#buttonRestart");
const buttonReturn = document.querySelector("#buttonReturn");
let gameSettingBox = document.querySelector(".gameSettings");
let countDownText = document.querySelector(".countDown");
const gameSettingSettingsScreen = document.querySelector(
  ".gameSettings .settingsScreen"
);
const gameSettingResultScreen = document.querySelector(
  ".gameSettings .resultScreen"
);

let currentlyOnTarget = {};
let counterOnTarget = 0;
let counterOnTargetHead = 0;
let counterOffTarget = 0;
let counterShotsMissed = 0;
let onTarget = false;
let onTargetHead = false;
let enemiesKilled = 0;
let enemyTimerMax = 6500;
let enemyHpMax = 750;
let enemyDefaultSize = 12;
let mouseHeldDown = false;
let enemyStepLengthBase = 1;
/*************************************/
/* INITIALIZE AIM GAIM END */
/*************************************/

//-----------------------
//Dynamic multiple enemies
//-----------------------
const enemyArray = [];

function enemyObject() {
  this.createEnemy = function () {
    this.enemyTimer = enemyTimerMax;
    this.enemyHp = enemyHpMax;
    this.enemyDistance = getRandomInt(0, 2);
    this.enemyStepLength = enemyStepLengthBase + this.enemyDistance * 1.5;

    this.enemyPosition = findEnemyTarget(this.enemyDistance);
    this.enemyTarget = findEnemyTarget(this.enemyDistance);
    this.enemyDirection = new Vector(
      this.enemyTarget.x - this.enemyPosition.x,
      this.enemyTarget.y - this.enemyPosition.y
    ).normalize();

    this.enemyHead = document.createElement("div");
    this.enemyBody = document.createElement("div");
    mainBody.append(this.enemyHead, this.enemyBody);

    this.enemyBody.className = "enemy";
    this.enemyHead.className = "enemyHead";
    this.enemyBody.style.boxSizing = "border-box";
    this.enemyHead.style.boxSizing = "border-box";
    this.enemyHead.style.position = "absolute"; //new abs
    this.enemyBody.style.position = "absolute"; //new abs

    this.enemyBody.style.width =
      enemyDefaultSize + enemyDefaultSize * this.enemyDistance + "px";
    this.enemyBody.style.height =
      enemyDefaultSize * 2 + enemyDefaultSize * 2 * this.enemyDistance + "px";
    this.enemyHead.style.width =
      enemyDefaultSize * 0.8 + enemyDefaultSize * 0.8 * this.enemyDistance + "px";
    this.enemyHead.style.height =
      enemyDefaultSize * 0.8 + enemyDefaultSize * 0.8 * this.enemyDistance + "px";

    this.enemyBody.style.top =
      this.enemyPosition.y - this.enemyBody.offsetHeight / 2 + "px";
    this.enemyBody.style.left =
      this.enemyPosition.x - this.enemyBody.offsetWidth / 2 + "px";

    this.enemyHead.style.top =
      this.enemyPosition.y - this.enemyBody.offsetHeight / 2 + "px";
    this.enemyHead.style.left =
      this.enemyPosition.x -
      this.enemyBody.offsetWidth / 2 +
      (this.enemyBody.offsetWidth - this.enemyHead.offsetWidth) / 2 +
      "px";

    if (gameSettings.enemyDisplay == "img") {
      applyImg("headDefault.png", this.enemyHead);
      applyImg("bodyDefault.png", this.enemyBody);
    } else if (gameSettings.enemyDisplay == "color") {
    }

    // this.enemyHead.style.backgroundImage = 'url(./images/head1.png)';
    // this.enemyHead.style.backgroundPosition = "0px 0px";
    // this.enemyHead.style.backgroundSize = `${this.enemyHead.offsetWidth}px ${this.enemyHead.offsetWidth}px`;

    let newEnemy = new enemyObject(this);

    return newEnemy;
  };
}
//-----------------------
//Dynamic multiple enemies END
//-----------------------

var mouseX = 0;
var mouseY = 0;

// enemy.style.display = "none";
// enemyHead.style.display = "none";

/*************************************/
/* END INITIALIZE */
/*************************************/

/*************************************/
/* UPDATE LOGIC */
/*************************************/

setInterval(gameLogic, 10);

/*************************************/
/* END UPDATE LOGIC */
/*************************************/

/*************************************/
/* FUNCTIONS AND MISC */
/*************************************/

function gameLogic() {
  if (gameRunning) {
    moveEnemy();

    isMouseOnEnemyManual();

    calcAndDisplayInfo();

    if (firstIteration == true) {
      firstIteration = false;
    }

    if (respawnTimer > 0) {
      respawnTimer -= 10;
    } else {
      SpawnEnemy();
      ResetRespawnTimer();
    }

    if (gameTimer > 0) {
      gameTimer -= 10;
    } else {
      stopGame();
    }
  } else if (countDown > 0) {
    countDown -= 10;
    if (countDown <= 0) {
      countDownText.style.display = "none";
      startGame();
    } else if (countDown == 2000) {
      countDownText.textContent = "2";
    } else if (countDown == 1000) {
      countDownText.textContent = "1";
    }
  } else {
    // /* Correcting a bug randomly keeping enemy visible after some game ends */
    // enemy.style.display = "none";
    // enemyHead.style.display = "none";
  }
}

function SpawnEnemy() {
  let newEnemy = new enemyObject();
  newEnemy.createEnemy();

  enemyArray.push(newEnemy);
}

function applyImg(thisImg, parentObject) {
  parentObject.style.backgroundImage = `url(./images/${thisImg})`;
  parentObject.style.backgroundPosition = "0px 0px";
  parentObject.style.backgroundSize = `${parentObject.offsetWidth}px ${parentObject.offsetHeight}px`;

  // let img = document.createElement("IMG");
  // img.src = "./images/" + thisImg;
  // parentObject.appendChild(img);
  // img.position = "relative";
  // img.width = parentObject.offsetWidth;
}

function RemoveEnemy(killThisTarget) {
  let index = enemyArray.indexOf(killThisTarget);
  if (index > -1) {
    killThisTarget.enemyBody.parentNode.removeChild(killThisTarget.enemyBody);
    killThisTarget.enemyHead.parentNode.removeChild(killThisTarget.enemyHead);
    enemyArray.splice(index, 1);
  }
}

function calcAndDisplayInfo() {
  if (onTarget) {
    counterOnTarget += 10;
    currentlyOnTarget.enemyHp -= 10;
    if (onTargetHead) {
      counterOnTargetHead += 10;
      currentlyOnTarget.enemyHp -= 5;
    }
    if (currentlyOnTarget.enemyHp <= 0) {
      enemiesKilled += 1;
      RemoveEnemy(currentlyOnTarget);
    }
  } else {
    counterOffTarget += 10;
    if (mouseHeldDown) {
      counterShotsMissed += 10;
    }
  }
  let calcNumber = 0;
  //Display live score info ::::::::::::::::::
  // infoBox1.textContent = "Time on target: " + counterOnTarget;
  // infoBox2.textContent = "Time off target: " + counterOffTarget;
  // let calcNumber = counterOnTarget / (counterOffTarget + counterOnTarget);
  // calcNumber = calcNumber * 100;
  // calcNumber = calcNumber.toFixed(0);
  // if (!(calcNumber > 0)) calcNumber = 0;
  // infoBox4.textContent = "On Target: " + calcNumber + "%";
  // calcNumber = counterOnTargetHead / counterOnTarget;
  // calcNumber = calcNumber * 100;
  // calcNumber = calcNumber.toFixed(0);
  // if (!(calcNumber > 0)) calcNumber = 0;
  // infoBox5.textContent = "Headshots: " + calcNumber + "%";

  // calcNumber = counterShotsMissed / (counterOnTarget + counterShotsMissed);
  // calcNumber = calcNumber * 100;
  // calcNumber = calcNumber.toFixed(0);
  // if (!(calcNumber > 0)) calcNumber = 0;
  // infoBox3.textContent = "Shots missed: " + calcNumber + "%";

  // infoBox6.textContent = "Enemies killed: " + enemiesKilled;

  //display live score info END::::::::::::::::::

  //CALCULATE FINAL SCORE::::::::::::::::::::
  //Enemies killed * 1000, penalty for missing the targets: %-missed / 2, and remove from total score. display under game screen
  currentHighScore = enemiesKilled * 1000;
  calcNumber = counterShotsMissed / (counterOnTarget + counterShotsMissed);
  calcNumber = 1 - calcNumber / 2;
  currentHighScore = currentHighScore * calcNumber;
  currentHighScore = Math.floor(currentHighScore);
  let topscoreDiv = document.querySelector(".top-score");
  if (currentHighScore == -1) {
    document.querySelector(".top-score").textContent = "Current highscore: 0";
  } else {
    document.querySelector(".top-score").textContent =
      "Current highscore: " + currentHighScore;
  }

  //CALCULATE FINAL SCORE END:::::::::::::::::

  //update enemy timer
  enemyArray.forEach((x) => {
    x.enemyTimer -= 10;
    if (x.enemyTimer == 0) {
      RemoveEnemy(x);
    }
  });
}

function moveEnemy() {
  enemyArray.forEach(function (enemy) {
    if (
      Math.abs(
        new Vector(
          enemy.enemyPosition.x - enemy.enemyTarget.x,
          enemy.enemyPosition.y - enemy.enemyTarget.y
        ).length()
      ) <= enemy.enemyStepLength
    ) {
      enemy.enemyTarget = findEnemyTarget(enemy.enemyDistance);
    }

    // test
    // if(enemyArray[0] == enemy){ enemyArray[0].enemyPosition.x = 0; enemyArray[0].enemyPosition.y = 0; }

    enemy.enemyDirection = new Vector(
      enemy.enemyTarget.x - enemy.enemyPosition.x,
      enemy.enemyTarget.y - enemy.enemyPosition.y
    ).normalize();

    enemy.enemyPosition.x += enemy.enemyStepLength * enemy.enemyDirection.x;
    enemy.enemyPosition.y += enemy.enemyStepLength * enemy.enemyDirection.y;

    enemy.enemyBody.style.top =
      enemy.enemyPosition.y - enemy.enemyBody.offsetHeight / 2 + "px";
    enemy.enemyBody.style.left =
      enemy.enemyPosition.x - enemy.enemyBody.offsetWidth / 2 + "px";

    enemy.enemyHead.style.top =
      enemy.enemyPosition.y -
      enemy.enemyBody.offsetHeight / 2 -
      enemy.enemyHead.offsetHeight +
      "px";
    enemy.enemyHead.style.left =
      enemy.enemyPosition.x -
      enemy.enemyBody.offsetWidth / 2 +
      (enemy.enemyBody.offsetWidth - enemy.enemyHead.offsetWidth) / 2 +
      "px";
  });
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function findEnemyTarget(thisEnemyDistance) {
  const bodyWidth = enemyDefaultSize + enemyDefaultSize * thisEnemyDistance;
  const bodyHeight = enemyDefaultSize * 2 + enemyDefaultSize * 2 * thisEnemyDistance;
  // const headWidth = enemyDefaultSize * 0.8 + enemyDefaultSize * 0.8 * thisEnemyDistance;
  const headHeight =
    enemyDefaultSize * 0.8 + enemyDefaultSize * 0.8 * thisEnemyDistance;

  var returnVector = new Vector(
    getRandomInt(bodyWidth / 2, 800 - bodyWidth / 2),
    getRandomInt(
      bodyHeight / 2 + headHeight / 2 + 140 * thisEnemyDistance,
      200 + 200 * thisEnemyDistance - bodyHeight / 2
    )
  );

  return returnVector;
}

function isMouseOnEnemyManual() {
  let trueOrFalse = false;
  let trueOrFalseHead = false;

  const onTargetTemp = false;
  const onTargetHeadTemp = false;

  enemyArray.forEach(function (enemy) {
    if (
      mouseX >= enemy.enemyBody.offsetLeft &&
      mouseX <= enemy.enemyBody.offsetLeft + enemy.enemyBody.offsetWidth
    ) {
      if (
        mouseY >= enemy.enemyBody.offsetTop &&
        mouseY <= enemy.enemyBody.offsetTop + enemy.enemyBody.offsetHeight
      ) {
        // Mouse is in the box
        trueOrFalse = true;
        currentlyOnTarget = enemy;
      }
    }
    //mouse is on enemy head
    if (
      mouseX >= enemy.enemyHead.offsetLeft &&
      mouseX <= enemy.enemyHead.offsetLeft + enemy.enemyHead.offsetWidth
    ) {
      if (
        mouseY >= enemy.enemyHead.offsetTop &&
        mouseY <= enemy.enemyHead.offsetTop + enemy.enemyHead.offsetHeight
      ) {
        trueOrFalseHead = true;
        currentlyOnTarget = enemy;
      }
    }
  });

  if (trueOrFalse == true && trueOrFalseHead == false && mouseHeldDown) {
    if (gameSettings.enemyDisplay == "img") {
      currentlyOnTarget.enemyHead.style.border = null;

      currentlyOnTarget.enemyBody.style.border = null;
      currentlyOnTarget.enemyBody.style.backgroundColor = null;

      applyImg("headHit.png", currentlyOnTarget.enemyHead);
      applyImg("bodyHit.png", currentlyOnTarget.enemyBody);
    } else if (gameSettings.enemyDisplay == "color") {
      currentlyOnTarget.enemyHead.style.border = "1px solid black";

      currentlyOnTarget.enemyBody.style.border = "1px solid black"; //green
      currentlyOnTarget.enemyBody.style.backgroundColor = "black"; //green
    }

    currentlyOnTarget.enemyHead.style.backgroundColor = null;
    onTarget = true;
    onTargetHead = false;
  } else if (trueOrFalse == false && trueOrFalseHead == true && mouseHeldDown) {
    if (gameSettings.enemyDisplay == "img") {
      currentlyOnTarget.enemyHead.style.border = null;
      currentlyOnTarget.enemyHead.style.backgroundColor = null;

      currentlyOnTarget.enemyBody.style.border = null;
      currentlyOnTarget.enemyBody.style.backgroundColor = null;

      applyImg("headHit.png", currentlyOnTarget.enemyHead);
      applyImg("bodyDefault.png", currentlyOnTarget.enemyBody);
    } else if (gameSettings.enemyDisplay == "color") {
      currentlyOnTarget.enemyHead.style.border = "1px solid black"; //green
      currentlyOnTarget.enemyHead.style.backgroundColor = "black"; //green

      currentlyOnTarget.enemyBody.style.border = "1px solid black";
      currentlyOnTarget.enemyBody.style.backgroundColor = null;
    }

    onTarget = true;
    onTargetHead = true;
  } else {
    enemyArray.forEach(function (enemy) {
      if (gameSettings.enemyDisplay == "img") {
        enemy.enemyHead.style.border = null;

        applyImg("headDefault.png", enemy.enemyHead);
        applyImg("bodyDefault.png", enemy.enemyBody);
      } else if (gameSettings.enemyDisplay == "color") {
        enemy.enemyHead.style.border = "1px solid black";
        enemy.enemyBody.style.border = "1px solid black";
      }

      enemy.enemyBody.style.backgroundColor = null;
      enemy.enemyHead.style.backgroundColor = null;
    });
    onTarget = false;
    onTargetHead = false;
  }
}

function isMouseOnEnemy(e) {
  // Mouse position comes from the 'mousemove' event
  // mouseX = e.clientX;
  // mouseY = e.clientY;
  mouseX = e.pageX - mainBody.offsetLeft;
  mouseY = e.pageY - mainBody.offsetTop;
}

function stopGame() {
  const length = enemyArray.length;
  for (let x = 0; x < length; x++) {
    RemoveEnemy(enemyArray[0]);
  }

  //Fill out the scoreScreen

  // infoBox1.textContent = "Time on target: " + counterOnTarget;
  // infoBox2.textContent = "Time off target: " + counterOffTarget;
  // let calcNumber = counterOnTarget / (counterOffTarget + counterOnTarget);
  // calcNumber = calcNumber * 100;
  // calcNumber = calcNumber.toFixed(0);
  // if (!(calcNumber > 0)) calcNumber = 0;
  // infoBox4.textContent = "On Target: " + calcNumber + "%";
  // calcNumber = counterOnTargetHead / counterOnTarget;
  // calcNumber = calcNumber * 100;
  // calcNumber = calcNumber.toFixed(0);
  // if (!(calcNumber > 0)) calcNumber = 0;
  // infoBox5.textContent = "Headshots: " + calcNumber + "%";

  // calcNumber = counterShotsMissed / (counterOnTarget + counterShotsMissed);
  // calcNumber = calcNumber * 100;
  // calcNumber = calcNumber.toFixed(0);
  // if (!(calcNumber > 0)) calcNumber = 0;
  // infoBox3.textContent = "Shots missed: " + calcNumber + "%";

  // infoBox6.textContent = "Enemies killed: " + enemiesKilled;

  document.querySelector("#resultScore").textContent = currentHighScore;

  document.querySelector("#resultTargetsKilled").textContent = enemiesKilled;
  let calcNumber = counterOnTarget / (counterOffTarget + counterOnTarget);
  calcNumber = calcNumber * 100;
  calcNumber = calcNumber.toFixed(0);
  if (!(calcNumber > 0)) calcNumber = 0;
  document.querySelector("#resultTimeOnTargets").textContent = calcNumber + " %";
  calcNumber = counterShotsMissed / (counterOnTarget + counterShotsMissed);
  calcNumber = calcNumber * 100;
  calcNumber = calcNumber.toFixed(0);
  if (!(calcNumber > 0)) calcNumber = 0;
  document.querySelector("#resultMissedShots").textContent = calcNumber + " %";
  calcNumber = counterOnTargetHead / counterOnTarget;
  calcNumber = calcNumber * 100;
  calcNumber = calcNumber.toFixed(0);
  if (!(calcNumber > 0)) calcNumber = 0;
  document.querySelector("#resultHeadshots").textContent = calcNumber + " %";

  gameRunning = false;
  gameSettingBox.style.display = "flex";
  gameSettingSettingsScreen.style.display = "none";
  gameSettingResultScreen.style.display = "flex";
}

function ResetRespawnTimer() {
  if (gameSettings.gameDifficulty == "easy") {
    respawnTimer = getRandomInt(3000, 4000);
  } else if (gameSettings.gameDifficulty == "medium") {
    respawnTimer = getRandomInt(2000, 2750);
  } else if (gameSettings.gameDifficulty == "hard") {
    respawnTimer = getRandomInt(1000, 1500);
  }
}
function RestoreCounters() {
  currentlyOnTarget = {};
  counterOnTarget = 0;
  counterOnTargetHead = 0;
  counterOffTarget = 0;
  counterShotsMissed = 0;
  onTarget = false;
  onTargetHead = false;
  enemiesKilled = 0;
}

function startGame() {
  if (gameSettings.gameDifficulty == "easy") {
    enemyStepLengthBase = 0.1;
  } else if (gameSettings.gameDifficulty == "medium") {
    enemyStepLengthBase = 0.5;
  } else if (gameSettings.gameDifficulty == "hard") {
    enemyStepLengthBase = 1;
  }

  RestoreCounters();

  ResetRespawnTimer();

  gameTimer = 30000;
  gameRunning = true;
  SpawnEnemy();
}

buttonStart.onclick = function () {
  gameSettings.gameDifficulty = document.querySelector(
    "#gameDifficultySetting"
  ).value;
  gameSettings.enemyDisplay = document.querySelector(
    "#gameEnemyDisplaySetting"
  ).value;

  countDown = 3000;
  countDownText.textContent = "3";
  countDownText.style.display = "block";
  gameSettingBox.style.display = "none";
};

buttonRestart.onclick = function () {
  // gameSettings.gameDifficulty = document.querySelector("#gameDifficultySetting").value;
  // gameSettings.enemyDisplay = document.querySelector("#gameEnemyDisplaySetting").value;

  countDown = 3000;
  countDownText.textContent = "3";
  countDownText.style.display = "block";
  gameSettingBox.style.display = "none";
};

buttonReturn.onclick = function () {
  gameSettingResultScreen.style.display = "none";
  gameSettingSettingsScreen.style.display = "flex";
};

document.addEventListener("mousedown", function (e) {
  mouseHeldDown = true;
});
document.addEventListener("mouseup", function (e) {
  mouseHeldDown = false;
});

document.addEventListener("mousemove", function (e) {
  isMouseOnEnemy(e);
});
//"mouseenter" "mouseout"

/*TODO:
    - Change colors
    - Create collected highscore and display scores etc after game
    - Save highscores in user login
    */

// SUBMIT PERSONAL LEADERBOARD -----------------------------------------------

// get elements
const submitScoreBtn = document.querySelector(".postHighscores");

// let leaderBoardHandler1 = new leaderboardHandler;

// submit highscore
submitScoreBtn.addEventListener("click", async function (e) {
  // let updatedHighscoreOnLoggedInUser = leaderBoardHandler1.setHighscoreToLoggedInUser("highscoreaimgaim", currentHighScore, true);

  // let serializedUsers = JSON.stringify(updatedHighscoreOnLoggedInUser);

  // localStorage.setItem("users", serializedUsers);

  // location.reload();
  if (gameRunning) {
    return;
  }
  //SEND POST USING FETCH
  const response = await fetch("http://localhost:3000/aimgaim", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: `{
      "gamename": "AimGaim",
      "username": "temporary",
      "score": ${currentHighScore}
      }`,
  });

  response.json().then((data) => {
    console.log(data);
  });

  location.reload();
});

// SUBMIT PERSONAL LEADERBOARD END -----------------------------------------------

// leaderBoardHandler1.LoadPersonalLeaderboard("highscoreaimgaim", true);

getLeaderboards();

async function getLeaderboards() {
  const response = await fetch("http://localhost:3000/aimgaim/personalHighscores", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  const personalLeaderboard = await response.json();

  const response2 = await fetch("http://localhost:3000/aimgaim/globalHighscores", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  const globalLeaderboard = await response2.json();

  showLeaderboards(personalLeaderboard, globalLeaderboard);
  // console.log(response);
}

function showLeaderboards(personalHighscores, globalHighscores) {
  const tbodyPersonal = document.querySelector(".personal tbody");
  const tbodyGlobal = document.querySelector(".global tbody");
  const template = document.querySelector("#highscore-row");

  // personalHighscores = [].slice.call(personalHighscores);
  personalHighscores = Object.values(personalHighscores); //makes objects into an array, so it can be sorted
  //Personal leaderboard
  //change sort() if lower hs is better than higher
  personalHighscores.sort((a, b) => {
    return a - b;
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
  globalHighscores = Object.values(globalHighscores);
  //Global leaderboard
  //change sort() if lower hs is better than higher
  globalHighscores.sort((a, b) => {
    return a - b;
  });
  globalHighscores.forEach((highscore) => {
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

//TESTING AREA

//result: able to send string as param and then use as attribute : [`${attribParam}`]

//TESTING AREA END

//TODO: fixa highscore
