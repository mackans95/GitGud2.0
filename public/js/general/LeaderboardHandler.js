class leaderboardHandler {
  setHighscoreToLoggedInUser(
    highscoreStringAttribute,
    currentHighScore,
    highestScoreIsBest
  ) {
    //highscoreStringAttribute = "highscorereactiongame"
    //currentHighScore = "currentHighScore"
    //highestScoreIsBest = true/false      false for reactiongame

    const users = this.fetchUsers();
    const theGuyThatIsLoggedIn = sessionStorage.getItem("loggedInUser");
    users.forEach(function (user) {
      if (user.username === theGuyThatIsLoggedIn) {
        if (!user[`${highscoreStringAttribute}`] && currentHighScore !== -1) {
          user[`${highscoreStringAttribute}`] = [currentHighScore];
        } else if (currentHighScore === -1) {
          return;
        } else if (
          user[`${highscoreStringAttribute}`].includes(currentHighScore)
        ) {
          return;
        } else {
          if (highestScoreIsBest) {
            user[`${highscoreStringAttribute}`].sort(function (a, b) {
              return b - a;
            });

            if (
              currentHighScore !== -1 &&
              user[`${highscoreStringAttribute}`][4] < currentHighScore
            ) {
              user[`${highscoreStringAttribute}`][4] = currentHighScore;
            } else if (user[`${highscoreStringAttribute}`].length < 5) {
              user[`${highscoreStringAttribute}`].push(currentHighScore);
            }
            user[`${highscoreStringAttribute}`].sort(function (a, b) {
              return b - a;
            });
            let topFive = user[`${highscoreStringAttribute}`].slice(0, 5);

            user[`${highscoreStringAttribute}`] = topFive;
          } else {
            //highestScoreIsBest == false
            user[`${highscoreStringAttribute}`].sort(function (a, b) {
              return a - b;
            });

            if (
              currentHighScore !== -1 &&
              user[`${highscoreStringAttribute}`][4] > currentHighScore
            ) {
              user[`${highscoreStringAttribute}`][4] = currentHighScore;
            } else if (user[`${highscoreStringAttribute}`].length < 5) {
              user[`${highscoreStringAttribute}`].push(currentHighScore);
            }
            user[`${highscoreStringAttribute}`].sort(function (a, b) {
              return a - b;
            });
            let topFive = user[`${highscoreStringAttribute}`].slice(0, 5);

            user[`${highscoreStringAttribute}`] = topFive;
          }
        }
      }
    });
    return users;
  }

  fetchUsers() {
    const serializedUsers = localStorage.getItem("users");
    return JSON.parse(serializedUsers) ?? [];
  }

  LoadPersonalLeaderboard(highscoreStringAttribute, highestScoreIsBest) {
    console.log("här1");
    const users = this.fetchUsers();
    const tbodyPersonal = document.querySelector(".personal tbody");
    const tbodyGlobal = document.querySelector(".global tbody");
    const template = document.querySelector("#highscore-row");

    const theGuyThatIsLoggedIn = sessionStorage.getItem("loggedInUser");
    console.log(theGuyThatIsLoggedIn);
    users.forEach(function (user) {
      if (
        user.username === theGuyThatIsLoggedIn &&
        user[`${highscoreStringAttribute}`]
      ) {
        console.log("här2");
        for (let i = 0; i < user[`${highscoreStringAttribute}`].length; i++) {
          let tr = template.content.cloneNode(true);

          let tdName = tr.querySelector("td.name");
          let tdScore = tr.querySelector("td.score");

          tdName.textContent = user.username;
          if(highscoreStringAttribute == "highscorereactiongame"){
            tdScore.textContent = user[`${highscoreStringAttribute}`][i] + "ms";
          }
          else{
            tdScore.textContent = user[`${highscoreStringAttribute}`][i];
          }

          tbodyPersonal.appendChild(tr);
        }
      }
    });

    let globalHighscoreArray = [];

    users.forEach(function (user) {
      if (user[`${highscoreStringAttribute}`]) {
        user[`${highscoreStringAttribute}`].forEach(function (score) {
          let best = {
            name: user.username,
            hs: score,
          };
          globalHighscoreArray.push(best);
        });
      }
    });
    let sortedHighscores;
    if(highestScoreIsBest){
      sortedHighscores = globalHighscoreArray
      .sort((a, b) => b.hs - a.hs)
      .slice(0, 5);
    }
    else{
      sortedHighscores = globalHighscoreArray
      .sort((a, b) => a.hs - b.hs)
      .slice(0, 5);
    }

    sortedHighscores.forEach(function (user) {
      let tr = template.content.cloneNode(true);

      let tdName = tr.querySelector("td.name");
      let tdScore = tr.querySelector("td.score");

      tdName.textContent = user.name;
      if(highscoreStringAttribute == "highscorereactiongame"){
        tdScore.textContent = user.hs + "ms";
      }
      else{
        tdScore.textContent = user.hs;
      }

      tbodyGlobal.appendChild(tr);
    });
  }
}

export default leaderboardHandler;
