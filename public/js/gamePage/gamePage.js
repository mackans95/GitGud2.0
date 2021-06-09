const logoutBtn = document.querySelector(".log-out");
const userSpan = document.querySelector(".user-name");
const cardHolder = document.querySelector(".card-holder");
const messagerLiElement = document.querySelector("li.user");
const olMessagers = document.querySelector("ol.messagers");
const olMessages = document.querySelector("ol.messages");
const messageHead = document.querySelector(".messager-head");
const messageHeadSpan = document.querySelector(".messager-head span");
const messageInput = document.querySelector("#message");
const messagesOurs = document.querySelector(".messages li.ours");
const messagesTheirs = document.querySelector(".messages li");
const showUsersList = document.querySelector(".user-list");
const gamesArray = [
  {
    name: "AimGaim",
    url: "AimGaim.html",
    route: "AimGaim",
    description: "Test your aiming skills!",
  },
  {
    name: "Reactions",
    url: "reaction.html",
    route: "ReactionGame",
    description: "Check your reaction time!",
  },
];

// check for updated messages
setInterval(async () => {
  const response = await fetch("http://localhost:3000/alert", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const JsonResponse = await response.json();
}, 5000);

// ---- Sets current user ----
const setLoggedInName = () => {
  return document.cookie
    .split(";")
    .filter((S) => S.includes("username"))
    .toString()
    .split("=")[1];
};
userSpan.textContent = setLoggedInName();
let currentUser;

async function getUserAndFriends() {
  currentUser = await getCurrentUser();
  getUsersAndDisplay();
  loadMessagers();
  displayNewMessageToUser();
}
getUserAndFriends();

// ---- EVENT HANDLERS ----
window.addEventListener("load", loadGameCards);

document.addEventListener("click", MakeLiBlocksClickable, false);
document.addEventListener("click", makeAddUserButtonsClickable, false);

messageInput.addEventListener("keypress", async function (e) {
  if (e.key === "Enter") {
    await updateUsersMessage();

    await displayMessageFromInputField();

    messageInput.value = "";
  }
});

logoutBtn.addEventListener("click", function (e) {
  document.cookie = "username=; path=/;";
  document.cookie = "jwt=; path=/;";
  window.location.href = "/";
});

// ---- FUNCTIONS ----
async function getCurrentUser() {
  let user;
  try {
    const username = setLoggedInName();

    const response = await fetch(`http://localhost:3000/users/${username}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    console.log(response);

    const data = await response.json();
    const userArr = Object.values(data);
    userArr.forEach((el) => {
      user = el;
    });
  } catch (error) {
    console.log(error);
  }
  return user;
}

async function getAllUsers() {
  let userList;
  try {
    const response = await fetch("http://localhost:3000/users", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const users = await response.json();
    const usersArr = Object.values(users);
    usersArr.forEach((user) => {
      userList = user;
    });
  } catch (error) {
    console.log(error);
  }
  return userList;
}

async function getUsersAndDisplay() {
  // const currentUser = await getCurrentUser();

  const userList = await getAllUsers();

  const friendsToNotRender = currentUser.friends;

  const userListFilterCurrentUser = userList.filter(
    (user) => user.username !== currentUser.username
  );

  const userListFilterFriends = userListFilterCurrentUser.filter(function (elOne) {
    return (
      friendsToNotRender.filter(function (elTwo) {
        return elTwo.username == elOne.username;
      }).length == 0
    );
  });

  userListFilterFriends.forEach((user) => {
    const html = `
      <li class="db-user">${user.username}
      <button class="add-friend-btn">Add</button>
      </li>
      `;

    showUsersList.insertAdjacentHTML("afterbegin", html);
  });
}

function MakeLiBlocksClickable(e) {
  if (hasClass(e.target, "user")) {
    removeNewMessageSpan(e.target);
    showMessagesAndAddButton(e.target);
  }
}

async function makeAddUserButtonsClickable(e) {
  if (hasClass(e.target, "add-friend-btn")) {
    const username = e.target.closest("li").innerText.split("\n")[0];

    const data = {
      username,
    };

    const response = await fetch("http://localhost:3000/addFriend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    location.reload();
  }
}

function loadGameCards() {
  gamesArray.forEach((game) => {
    const html = `
    <a href="${game.route}" class="anchor-container">
        <div class="card-container">
          <img src="./images/${game.name}.jpg" alt="Avatar" />
          <h4><b>${game.name}</b></h4>
          <p>${game.description}</p>
        </div>
      </a>
      `;

    cardHolder.insertAdjacentHTML("afterbegin", html);
  });
}

function showMessagesAndAddButton(target) {
  olMessagers.classList.add("hide");
  olMessages.classList.remove("hide");

  const button = document.createElement("button");

  button.textContent = "Back";
  messageHead.appendChild(button);

  button.addEventListener("click", function () {
    olMessages.classList.add("hide");
    olMessagers.classList.remove("hide");
    button.classList.add("hide");
    messageHeadSpan.textContent = "Chat";
    const liElements = document.querySelectorAll(".messages li");
    liElements.forEach((l) => l.remove());
  });

  messageHeadSpan.textContent = target.textContent;

  displayMessages(target);

  setMessagesToRead(target);

  const msgLiBox = [...document.querySelectorAll("li.user")];

  msgLiBox.forEach((l) => {
    if (l.textContent.trim() === target.textContent.trim()) {
      l.style.backgroundColor = "#5F9EA0";
    }
  });
}

function removeNewMessageSpan(target) {
  const msgBoxLi = [...document.querySelectorAll("li.user")];

  msgBoxLi.forEach((elem) => {
    if (
      elem.contains(document.querySelector("li.user span")) &&
      target.textContent.trim() === elem.textContent.trim()
    ) {
      document.querySelector("li.user span").remove();
    }
  });
}

function hasClass(elem, className) {
  return elem.className.split(" ").indexOf(className) > -1;
}

//****************************** */
//Create Contest section
//****************************** */
const createContestBtn = document.querySelector('.createContest');
const contestsBtn = document.querySelector('.contestsBtn');
const closeWindowContestBtn = document.querySelector('[data-close-button]');
const closeContestsBtn = document.querySelector('#closeContests');
const popupWindowContest = document.querySelector('#popupWindow');
const popupContests = document.querySelector('#popupContests');
const popupContestsBodyList = document.querySelector('#popupContests .popupBodyList');
const overlay = document.querySelector('#overlay');
const dateStartPicker = document.querySelector('#dateStartInput');
const dateEndPicker = document.querySelector('#dateEndInput');
const dateStartElem = document.querySelector('.dateStart');
const dateEndElem = document.querySelector('.dateEnd');
const gameSelect = document.querySelector('.gameName');
const finishInvitationBtn = document.querySelector('.invitationButton');
const contestFriendList = document.querySelector('.contestFriendList');
const contestPlayersList = document.querySelector('.contestPlayers');

//populate select game
gamesArray.forEach(game => {
  const option = document.createElement('option');
  option.textContent = game.route;
  option.value = game.route;

  gameSelect.appendChild(option);
})

async function addEventListenerToChoiceButtons(button){
  //send to server
  const parent = button.parentNode.parentNode;
  const contestId = parent.querySelector('.contestId');
  console.log(contestId.textContent);
  let choiceAnswer = '';
  if(button.textContent == 'Accept'){
    choiceAnswer = 'accepted';
  }
  else if(button.textContent == 'Decline'){
    choiceAnswer = 'declined';
  }
  else if(button.textContent == 'Resign'){
    choiceAnswer = 'resigned';
  }
  console.log(choiceAnswer);

  //send to 'contests/choice'
  const data = {
    contestId : contestId.textContent,
    choice : choiceAnswer
  }
  const response = await fetch("http://localhost:3000/contests/choice", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  console.log('sent answer to db!');

  window.location.reload();
}

contestsBtn.addEventListener('click', async ()=>{
  //load contests for current user
  const response = await fetch(`http://localhost:3000/contests`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  // console.log(data);
  // const userArr = Object.values(data);

  //populate contests
  popupContestsBodyList.innerHTML = '';

  data.forEach(contest => {
    if(contest.state == 'finished'){return;}

    addContestTemplate(contest);

  })

  //open contests popup
  popupContests.classList.add('active');
  overlay.classList.add('active');
})
//contestButtonAccept, contestButtonDecline, contestButtonResign
async function addContestTemplate(contest){
  const template = document.createElement('div');
  template.classList.add('contestTemplate');
  const invisId = document.createElement('div');
  invisId.textContent = contest._id;
  invisId.classList.add('contestId');
  invisId.style.display = 'none';
  const gameDiv = document.createElement('div');
  gameDiv.classList.add('contestTemplateFlex');
  const gameDiv1 = document.createElement('div');
  gameDiv1.textContent = 'Game:';
  const gameDiv2 = document.createElement('div');
  gameDiv2.textContent = contest.gamename;
  gameDiv.append(gameDiv1, gameDiv2);

  template.append(gameDiv);
  template.append(invisId);
  popupContestsBodyList.append(template);

  if(contest.state == 'invitation'){
    //display as invitation. with or without accept options depending on participantstate
    const hostDiv = document.createElement('div');
    hostDiv.classList.add('contestTemplateFlex');
    const hostDiv1 = document.createElement('div'); hostDiv1.textContent = 'Host:';
    hostDiv.appendChild(hostDiv1);
    const hostDiv2 = document.createElement('div'); hostDiv2.textContent = contest.creator;
    hostDiv.appendChild(hostDiv2);
    template.appendChild(hostDiv);

    const datefromDiv = document.createElement('div');
    datefromDiv.classList.add('contestTemplateFlex');
    const datefromDiv1 = document.createElement('div'); datefromDiv1.textContent = 'Date from:';
    datefromDiv.appendChild(datefromDiv1);
    const datefromDiv2 = document.createElement('div'); datefromDiv2.textContent = contest.startDate.slice(0, 10);
    datefromDiv.appendChild(datefromDiv2);
    template.appendChild(datefromDiv);

    const dateToDiv = document.createElement('div');
    dateToDiv.classList.add('contestTemplateFlex');
    const dateToDiv1 = document.createElement('div'); dateToDiv1.textContent = 'Date to:';
    dateToDiv.appendChild(dateToDiv1);
    const dateToDiv2 = document.createElement('div'); dateToDiv2.textContent = contest.endDate.slice(0, 10);
    dateToDiv.appendChild(dateToDiv2);
    template.appendChild(dateToDiv);

    const statusDiv = document.createElement('div');
    statusDiv.classList.add('contestTemplateFlex');
    const statusDiv1 = document.createElement('div'); statusDiv1.textContent = 'Status:';
    statusDiv.appendChild(statusDiv1);
    const statusDiv2 = document.createElement('div'); statusDiv2.textContent = contest.state;
    statusDiv.appendChild(statusDiv2);
    template.appendChild(statusDiv);

    const choiceDiv = document.createElement('div');
    choiceDiv.classList.add('contestTemplateFlex');

    //check if player accepted already
    const thisParticipant = contest.participants.find(x => { return x.username == currentUser.username });

    // console.log('participant: ' + participantsListt.state);
    if(thisParticipant.state == 'pending'){
      const choiceDiv1 = document.createElement('div'); choiceDiv1.classList.add('contestButtonAccept'); choiceDiv1.textContent = 'Accept';
      choiceDiv.appendChild(choiceDiv1);
      
      const choiceDiv2 = document.createElement('div'); choiceDiv2.classList.add('contestButtonDecline');  choiceDiv2.textContent = 'Decline';
      choiceDiv.appendChild(choiceDiv2);

      template.append(choiceDiv);

      choiceDiv1.addEventListener('click', () =>{ addEventListenerToChoiceButtons(choiceDiv1) } );
      choiceDiv2.addEventListener('click', () =>{ addEventListenerToChoiceButtons(choiceDiv2) });
    }
    else if(thisParticipant.state == 'accepted'){
      const choiceDiv1 = document.createElement('div'); choiceDiv1.classList.add('contestButtonResign'); choiceDiv1.textContent = 'Resign';
      choiceDiv.appendChild(choiceDiv1);

      template.append(choiceDiv);
      choiceDiv1.addEventListener('click', () => { addEventListenerToChoiceButtons(choiceDiv1)} );
    }

  }
  else if(contest.state == 'active'){
    //display as active.
    const dateToDiv = document.createElement('div');
    dateToDiv.classList.add('contestTemplateFlex');
    const dateToDiv1 = document.createElement('div'); dateToDiv1.textContent = 'Date to:';
    dateToDiv.appendChild(dateToDiv1);
    const dateToDiv2 = document.createElement('div'); dateToDiv2.textContent = contest.endDate.slice(0, 10);
    dateToDiv.appendChild(dateToDiv2);
    template.appendChild(dateToDiv);

    const statusDiv = document.createElement('div');
    statusDiv.classList.add('contestTemplateFlex');
    const statusDiv1 = document.createElement('div'); statusDiv1.textContent = 'Status:';
    statusDiv.appendChild(statusDiv1);
    const statusDiv2 = document.createElement('div'); statusDiv2.textContent = contest.state;
    statusDiv.appendChild(statusDiv2);
    template.appendChild(statusDiv);

    const leaderDiv = document.createElement('div');
    leaderDiv.classList.add('contestTemplateFlex');
    const leaderDiv1 = document.createElement('div'); leaderDiv1.textContent = 'Leader:';
    leaderDiv.appendChild(leaderDiv1);
    //find out who is leading in highscore:
    //sort differently if it is reactiongame
    let scoresList = [];
    if(contest.gamename == 'ReactionGame'){
      scoresList = contest.scores.sort((a,b) => { return a.score - b.score});
    }
    else{
      scoresList = contest.scores.sort((a,b) => { return b.score - a.score});
    }

    if(scoresList.length > 0){

      const leaderDiv2 = document.createElement('div'); leaderDiv2.textContent = scoresList[0].username;
      leaderDiv.appendChild(leaderDiv2);
    }
    template.appendChild(leaderDiv);


    const hsDiv = document.createElement('div');
    hsDiv.classList.add('contestTemplateFlex');
    const hsDiv1 = document.createElement('div'); hsDiv1.textContent = 'Highscore:';
    hsDiv.appendChild(hsDiv1);
    if(scoresList.length > 0){
      const hsDiv2 = document.createElement('div'); hsDiv2.textContent = scoresList[0].score;
      hsDiv.appendChild(hsDiv2);
    }
    template.appendChild(hsDiv);

    const choiceDiv = document.createElement('div');
    choiceDiv.classList.add('contestTemplateFlex');
    const choiceDiv1 = document.createElement('div'); choiceDiv1.classList.add('contestButtonResign'); choiceDiv1.textContent = 'Resign';
    choiceDiv.appendChild(choiceDiv1);
    template.appendChild(choiceDiv);
    choiceDiv1.addEventListener('click', () => { addEventListenerToChoiceButtons(choiceDiv1)});

  }
}

createContestBtn.addEventListener('click', () => {
  //populate friend list
  //first clear it
  contestFriendList.innerHTML = "";
  contestPlayersList.innerHTML = "";
  if(currentUser.friends.length < 1){
    const friendElem = document.createElement('div');
    friendElem.textContent = "No friends...";
    friendElem.classList.add('friendInList');

    contestFriendList.appendChild(friendElem);
  }

  currentUser.friends.forEach(friend => {
    const friendElem = document.createElement('div');
    friendElem.textContent = friend.username;
    friendElem.classList.add('friendInList');

    friendElem.addEventListener('click', ()=>{
      addEventListenersToFriends(friendElem);
    })
    friendElem.addEventListener('mouseenter', ()=>{
      friendElem.querySelector('div').style.visibility = 'visible';
    })
    friendElem.addEventListener('mouseleave', ()=>{
      friendElem.querySelector('div').style.visibility = 'hidden';
    })

    const plusSign = document.createElement('div');
    plusSign.textContent = '+';
    plusSign.style.color = 'green';
    plusSign.classList.add('pSigns');
    friendElem.appendChild(plusSign);

    contestFriendList.appendChild(friendElem);
  });

  function addEventListenersToFriends(elem){
    if(elem.classList.contains('friendInList')){
      const contestPlayer = document.createElement('div');
      if(elem.querySelector('div')){
        elem.querySelector('div').remove();
      }
      contestPlayer.textContent = elem.textContent;
      contestPlayer.classList.add('contestPlayer');

      contestPlayer.addEventListener('click', ()=>{
        addEventListenersToFriends(contestPlayer);
      })
      contestPlayer.addEventListener('mouseenter', ()=>{
        contestPlayer.querySelector('div').style.visibility = 'visible';
      })
      contestPlayer.addEventListener('mouseleave', ()=>{
        contestPlayer.querySelector('div').style.visibility = 'hidden';
      })

      const minusSign = document.createElement('div');
      minusSign.style.color = 'red';
      minusSign.textContent = '-';
      minusSign.classList.add('pSigns');
      contestPlayer.appendChild(minusSign);

      contestPlayersList.appendChild(contestPlayer);


      elem.remove();
    }
    else if(elem.classList.contains('contestPlayer')){
      const friendElem = document.createElement('div');
      if(elem.querySelector('div')){
        elem.querySelector('div').remove();
      }
      friendElem.textContent = elem.textContent;
      friendElem.classList.add('friendInList');

      friendElem.addEventListener('click', ()=>{
        addEventListenersToFriends(friendElem);
      })
      friendElem.addEventListener('mouseenter', ()=>{
        friendElem.querySelector('div').style.visibility = 'visible';
      })
      friendElem.addEventListener('mouseleave', ()=>{
        friendElem.querySelector('div').style.visibility = 'hidden';
      })

      const plusSign = document.createElement('div');
      plusSign.textContent = '+';
      plusSign.style.color = 'green';
      plusSign.classList.add('pSigns');
      friendElem.appendChild(plusSign);

      contestFriendList.appendChild(friendElem);
      elem.remove();
    }
  }

  //open create contest popup
  popupWindowContest.classList.add('active');
  overlay.classList.add('active');

  //settings starting date. By default an Hour from now
  let dateStart = new Date();
  dateStart.setHours(dateStart.getHours() + 1);
  dateStartElem.textContent = dateStart.toISOString().slice(0, 10) + " : " + ("0" + dateStart.getHours()).slice(-2) + ":" + ("0" + dateStart.getMinutes()).slice(-2);

  let dateEnd = new Date(); //.setFullYear(new Date().getFullYear() + 1)
  dateEnd.setDate(dateEnd.getDate() + 1); //set the day after by default
  dateEnd.setHours(dateStart.getHours());
  dateEndElem.textContent = dateEnd.toISOString().slice(0, 10) + " : " + ("0" + dateEnd.getHours()).slice(-2) + ":" + ("0" + dateEnd.getMinutes()).slice(-2);
})

closeContestsBtn.addEventListener('click', () => {
  popupContests.classList.remove('active');
  overlay.classList.remove('active');
})
closeWindowContestBtn.addEventListener('click', () => {
  popupWindowContest.classList.remove('active');
  overlay.classList.remove('active');
})

dateStartPicker.addEventListener('change', ()=>{
  let date = new Date(dateStartPicker.value);
  dateStartElem.textContent = date.toISOString().slice(0, 10) + " : " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2);
})
dateEndPicker.addEventListener('change', ()=>{
  let date = new Date(dateEndPicker.value);
  dateEndElem.textContent = date.toISOString().slice(0, 10) + " : " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2);
})

finishInvitationBtn.addEventListener('click', async () => {
  //send invitation info to DB
  // const emptyArray = []; 
  class Score{
    constructor(gamename, username, score, date){
      this.gamename = gamename,
      this.username = username,
      this.score = score,
      this.date = date
    }
  }
  class Participant{
    constructor(username, state = 'pending'){
      this.username = username,
      this.state = state
    }
  }

  // const participant1 = new Participant('hejsan', 'hejda');
  // console.log("participant1: " + JSON.stringify(participant1));
  const arrayOfScores = [];
  // const score1 = new Score("AimGaim", 'hejda', 1001, new Date());
  // const score2 = new Score("AimGaim", 'bojo', 2100, new Date());
  // arrayOfScores.push(score1); arrayOfScores.push(score2); 

  const contestParticipants = document.querySelectorAll('.contestPlayer');
  const nameArray2 = [];
  const creatorObject = new Participant(userSpan.textContent, 'accepted');
  nameArray2.push(creatorObject);
  // nameArray2.push(userSpan.textContent);
  if(contestParticipants.length > 0){
    contestParticipants.forEach(part =>{
      part.querySelector('div').remove();

      const participantObject = new Participant(part.textContent);
      nameArray2.push(participantObject);
      // nameArray2.push(part.textContent);
    })
  }

  // const nameArray = ["david1", "jacob2"];

  let startingDate = new Date(dateStartElem.textContent);
  let endingDate = new Date(dateEndElem.textContent);

  const data = { gamename: gameSelect.value,
    creator: userSpan.textContent,
    participants: nameArray2,
    scores: arrayOfScores,
    startDate : new Date(startingDate.getTime() - (startingDate.getTimezoneOffset() * 60000)), //dateStartPicker.value dateStartElem.textContent
    endDate : new Date(endingDate.getTime() - (endingDate.getTimezoneOffset() * 60000)),
    state : "invitation" }

  // console.log(JSON.stringify(data)); 'invitation'

  const response = await fetch("http://localhost:3000/contests", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  popupWindowContest.classList.remove('active');
  overlay.classList.remove('active');
})

//****************************** */
//END Create Contest section
//****************************** */






// FUNKAR INTE JUST NU
// --------------------------------------------------------
//borde funka
async function displayNewMessageToUser() {
  // const currentUser = await getCurrentUser();

  const friends = currentUser.friends;

  const messagesCorrected = friends
    .filter((user) => user.conversation)
    .flatMap((m) => m.conversation);

  const msgsUnread = messagesCorrected.filter((msg) => msg.read === false);

  msgsUnread.forEach((msg) => {
    if (msg.read === false && msg.recipient === currentUser.username) {
      const msgLiBox = [...document.querySelectorAll("li.user")];

      msgLiBox.forEach((li) => {
        if (li.textContent.trim() === msg.sender) {
          li.style.backgroundColor = "yellow";
          const test = document.createElement("span");
          test.textContent = "NEW!";
          li.append(test);
        }
      });
    }
  });
}

async function loadMessagers() {
  const friends = currentUser.friends;

  friends.forEach((friend) => {
    const html = `
      <li class="user">${friend.username}
      </li>
      `;

    olMessagers.insertAdjacentHTML("afterbegin", html);
  });
}

async function updateUsersMessage() {
  // const currentUser = await getCurrentUser();

  // !currentUser.hasOwnProperty("conversation") ? (currentUser.conversation = []) : "";

  const message = {
    sender: currentUser.username,
    message: messageInput.value,
    timeStamp: Math.floor(Date.now() / 1000),
    read: false,
  };

  const convo = {
    participants: [currentUser.username, messageHeadSpan.textContent.trim()],
    messages: [message],
  };

  const response = await fetch("http://localhost:3000/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(convo),
  });
}

async function displayMessages(target) {
  const messages = await getAllMessages(target);

  if (messages) {
    olMessages.insertAdjacentHTML("beforeend", messages.join(""));
  }
}

async function displayMessageFromInputField() {
  const messages = await getMessagesFromUs();

  if (messages) {
    olMessages.insertAdjacentHTML("beforeend", messages[messages.length - 1]);
  }
}

async function getMessagesFromUs() {
  // const currentUser = await getCurrentUser();

  const messages = currentUser?.conversation
    ?.filter((conv) => conv.recipient === messageHeadSpan.textContent.trim())
    .map((conv) => {
      return `<li class="ours">${conv.message}</li>`.trim();
    });

  return messages;
}

// borde funka
async function getAllMessages(target) {
  // const currentUser = await getCurrentUser();

  const friends = currentUser.friends;

  const messagesCorrected = friends
    .filter((user) => user.conversation)
    .flatMap((m) => m.conversation)
    .filter(
      (m) =>
        (m.recipient === currentUser.username &&
          m.sender === target.textContent.trim()) ||
        (m.sender === currentUser.username &&
          m.recipient === target.textContent.trim())
    )
    .sort(compare);

  function compare(message1, message2) {
    if (message1.timeStamp < message2.timeStamp) {
      return -1;
    }
    if (message1.timeStamp > message2.timeStamp) {
      return 1;
    }
  }

  const finalMessages = messagesCorrected.map((conv) => {
    if (conv.sender !== currentUser.username) {
      return `<li>${conv.message}</li>`.trim();
    } else {
      return `<li class="ours">${conv.message}</li>`.trim();
    }
  });

  return finalMessages;
}

async function setMessagesToRead(target) {
  // const currentUser = await getCurrentUser();

  const friends = currentUser.friends;

  const messagesToUser = friends
    .filter((user) => user.conversation)
    .flatMap((m) => m.conversation)
    .filter(
      (m) =>
        (m.recipient === currentUser.username &&
          m.sender === target.textContent.trim()) ||
        (m.sender === currentUser.username &&
          m.recipient === target.textContent.trim())
    );

  messagesToUser.forEach((msg) => {
    if (
      msg.read === false &&
      currentUser.username !== target.username &&
      msg.sender !== currentUser.username
    ) {
      msg.read = true;

      // const serializeUsers = JSON.stringify(users);
      // localStorage.setItem("users", serializeUsers);

      // TODO: skicka en update fetch, så den sätter read till true
    }
  });
}
