// ---- SELECTORS ----
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

// ---- INITIALIZATION ----
let currentUser;
init();

let currentConvos = getConversations();
// Scan to see if a new request for conversations is needed
setInterval(getAlertResponses, 1000);
// Scan to see if friendlist has changed
setInterval(scanCurrentUserForUpdates, 5000);

// ---- EVENT HANDLERS ----
// Make JSrendered-elements clickable
document.addEventListener("click", MakeLiBlocksClickable, false);
document.addEventListener("click", makeAddUserButtonsClickable, false);

// Sending new messages
messageInput.addEventListener("keypress", async function (e) {
  if (e.key === "Enter") {
    await updateUsersMessage();

    messageInput.value = "";
  }
});

//Logging out
logoutBtn.addEventListener("click", function (e) {
  document.cookie = "username=; path=/;";
  document.cookie = "jwt=; path=/;";
  window.location.href = "/";
});

// ---- FUNCTIONS ----
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

  const backButton = document.createElement("button");
  const removeButton = document.createElement("button");

  // go back-btn
  backButton.textContent = "Back";
  messageHead.appendChild(backButton);

  backButton.addEventListener("click", async () => {
    olMessages.classList.add("hide");
    olMessagers.classList.remove("hide");
    backButton.classList.add("hide");
    removeButton.classList.add("hide");
    messageHeadSpan.textContent = "Chat";
    const liElements = document.querySelectorAll(".messages li");
    liElements.forEach((l) => l.remove());
    currentConvos = await getConversations();
  });

  // remove friend-btn
  removeButton.classList.add("remove-btn");
  removeButton.textContent = "Remove";
  messageHead.appendChild(removeButton);

  removeButton.addEventListener("click", async () => {
    olMessages.classList.add("hide");
    olMessagers.classList.remove("hide");
    removeButton.classList.add("hide");
    backButton.classList.add("hide");
    messageHeadSpan.textContent = "Chat";
    const liElements = document.querySelectorAll(".messages li");
    liElements.forEach((l) => l.remove());
    await removeFriend(target.textContent.trim());
    location.reload();
  });

  messageHeadSpan.textContent = target.textContent;

  displayMessages(target);

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

function displayNewlyMadeMessage(liElement) {
  if (liElement) {
    olMessages.insertAdjacentHTML("beforeend", liElement);
    updateScroll();
  }
}

function setLoggedInName() {
  return document.cookie
    .split(";")
    .filter((S) => S.includes("username"))
    .toString()
    .split("=")[1];
}

function updateScroll() {
  const element = document.querySelector(".messages");
  element.scrollTop = element.scrollHeight;
}

function alertUserToChangeInFriendList() {
  const html = `
  <div class="friend-overlay">
    <h1>Your friendlist has changed! Please reload the page to update.</h1>
    <button data-reload-btn>Reload</button>
  </div>
  `;

  cardHolder.insertAdjacentHTML("afterend", html);

  // kanske ska lägga längst upp, då både jag och christian använder den
  const overlay = document.querySelector("#overlay");
  overlay.classList.add("active");

  const reloadBtn = document.querySelector("[data-reload-btn]");

  reloadBtn.addEventListener("click", () => {
    location.reload();
  });
}

async function scanCurrentUserForUpdates() {
  const currentUserDB = await getCurrentUser();

  if (currentUserDB.friends.length !== currentUser.friends.length) {
    alertUserToChangeInFriendList();
  }
}

async function init() {
  userSpan.textContent = setLoggedInName();
  currentUser = await getCurrentUser();
  getUsersAndDisplay();
  loadMessagers();
  displayNewMessageToUser();
  loadGameCards();
}

async function removeFriend(friendName) {
  const data = {
    friend: friendName,
  };

  await fetch(`http://localhost:${process.env.PORT}/users/${currentUser.username}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

async function getAlertResponses() {
  const response = await fetch(`http://localhost:${process.env.PORT}/alert`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const JsonResponse = await response.json();

  JsonResponse?.forEach(async (response) => {
    if (response.new) {
      currentConvos = await getConversations();
      await displayNewMessageToUser();
    }
  });

  return JsonResponse;
}

async function getConversations() {
  const convoRes = await fetch(
    `http://localhost:${process.env.PORT}/conversations`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  const JsonConvoRes = await convoRes.json();
  const convoArr = Object.values(JsonConvoRes);
  const convo = [];
  convoArr.forEach((el) => {
    convo.push(el);
  });

  return convo;
}

async function getCurrentUser() {
  let user;
  try {
    const username = setLoggedInName();

    const response = await fetch(
      `http://localhost:${process.env.PORT}/users/${username}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

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
    const response = await fetch(`http://localhost:${process.env.PORT}/users`, {
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
      <backButton class="add-friend-btn">Add</backButton>
      </li>
      `;

    showUsersList.insertAdjacentHTML("afterbegin", html);
  });
}

async function MakeLiBlocksClickable(e) {
  if (hasClass(e.target, "user")) {
    await getConversations();
    await setUserAlertBackToFalse(e.target);
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

    const response = await fetch(`http://localhost:${process.env.PORT}/addFriend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    location.reload();
  }
}

async function setUserAlertBackToFalse(target) {
  const data = {
    sender: target.innerText.split("\n")[0],
  };

  await fetch(`http://localhost:${process.env.PORT}/users`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

async function displayNewMessageToUser() {
  const alerts = await getAlertResponses();

  alerts.forEach((alert) => {
    if (alert.new === true) {
      const msgLiBox = [...document.querySelectorAll("li.user")];

      msgLiBox.forEach((li) => {
        if (li.textContent.trim() === alert.sender) {
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
  const message = {
    sender: currentUser.username,
    recipient: messageHeadSpan.textContent.trim(),
    message: messageInput.value,
    timeStamp: Math.floor(Date.now() / 1000),
    read: false,
  };

  const convo = {
    participants: [currentUser.username, messageHeadSpan.textContent.trim()],
    messages: [message],
  };

  const response = await fetch(
    `http://localhost:${process.env.PORT}/conversations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(convo),
    }
  );

  const JsonConvoRes = await response.json();
  const convoArr = Object.values(JsonConvoRes);
  let conv;
  convoArr.forEach((el) => {
    conv = el;
  });

  const li = await convertToLiElement(conv);

  displayNewlyMadeMessage(li);
}

async function displayMessages() {
  const messages = await getAllMessages();

  if (messages) {
    olMessages.insertAdjacentHTML("beforeend", messages.join(""));
    updateScroll();
  }
}

async function convertToLiElement(newMsgArr) {
  const messages = newMsgArr
    .filter((conv) => conv.recipient === messageHeadSpan.textContent.trim())
    .map((conv) => {
      return `<li class="ours">${conv.message}</li>`.trim();
    });

  return messages;
}

async function getAllMessages() {
  const conversations = await currentConvos;

  if (conversations) {
    const filteredConvo = conversations.filter((conversation) =>
      conversation.participants.includes(messageHeadSpan.textContent.trim())
    );

    const messagesCorrected = filteredConvo[0]?.messages
      .filter(
        (message) =>
          (message.sender === messageHeadSpan.textContent.trim() &&
            message.recipient === currentUser.username) ||
          (message.sender === currentUser.username &&
            message.recipient === messageHeadSpan.textContent.trim())
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

    const finalMessages = messagesCorrected?.map((conv) => {
      if (conv.sender !== currentUser.username) {
        return `<li>${conv.message}</li>`.trim();
      } else {
        return `<li class="ours">${conv.message}</li>`.trim();
      }
    });

    return finalMessages;
  }
}

//****************************** */
//Create Contest section
//****************************** */
const createContestBtn = document.querySelector(".createContest");
const contestsBtn = document.querySelector(".contestsBtn");
const closeWindowContestBtn = document.querySelector("[data-close-button]");
const closeContestsBtn = document.querySelector("#closeContests");
const popupWindowContest = document.querySelector("#popupWindow");
const popupContests = document.querySelector("#popupContests");
const popupContestsBodyList = document.querySelector(
  "#popupContests .popupBodyList"
);
const overlay = document.querySelector("#overlay");
const dateStartPicker = document.querySelector("#dateStartInput");
const dateEndPicker = document.querySelector("#dateEndInput");
const dateStartElem = document.querySelector(".dateStart");
const dateEndElem = document.querySelector(".dateEnd");
const gameSelect = document.querySelector(".gameName");
const finishInvitationBtn = document.querySelector(".invitationButton");
const contestFriendList = document.querySelector(".contestFriendList");
const contestPlayersList = document.querySelector(".contestPlayers");

//populate select game
gamesArray.forEach((game) => {
  const option = document.createElement("option");
  option.textContent = game.route;
  option.value = game.route;

  gameSelect.appendChild(option);
});

async function addEventListenerToChoiceButtons(button) {
  //send to server
  const parent = button.parentNode.parentNode;
  const contestId = parent.querySelector(".contestId");
  console.log(contestId.textContent);
  let choiceAnswer = "";
  if (button.textContent == "Accept") {
    choiceAnswer = "accepted";
  } else if (button.textContent == "Decline") {
    choiceAnswer = "declined";
  } else if (button.textContent == "Resign") {
    choiceAnswer = "resigned";
  }
  console.log(choiceAnswer);

  //send to 'contests/choice'
  const data = {
    contestId: contestId.textContent,
    choice: choiceAnswer,
  };
  const response = await fetch(
    `http://localhost:${process.env.PORT}/contests/choice`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
  console.log("sent answer to db!");

  window.location.reload();
}

contestsBtn.addEventListener("click", async () => {
  //load contests for current user
  const response = await fetch(`http://localhost:${process.env.PORT}/contests`, {
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
  popupContestsBodyList.innerHTML = "";

  data.forEach((contest) => {
    if (contest.state == "finished") {
      return;
    }

    addContestTemplate(contest);
  });

  //open contests popup
  popupContests.classList.add("active");
  overlay.classList.add("active");
});
//contestButtonAccept, contestButtonDecline, contestButtonResign
async function addContestTemplate(contest) {
  const template = document.createElement("div");
  template.classList.add("contestTemplate");
  const invisId = document.createElement("div");
  invisId.textContent = contest._id;
  invisId.classList.add("contestId");
  invisId.style.display = "none";
  const gameDiv = document.createElement("div");
  gameDiv.classList.add("contestTemplateFlex");
  const gameDiv1 = document.createElement("div");
  gameDiv1.textContent = "Game:";
  const gameDiv2 = document.createElement("div");
  gameDiv2.textContent = contest.gamename;
  gameDiv.append(gameDiv1, gameDiv2);

  template.append(gameDiv);
  template.append(invisId);
  popupContestsBodyList.append(template);

  if (contest.state == "invitation") {
    //display as invitation. with or without accept options depending on participantstate
    const hostDiv = document.createElement("div");
    hostDiv.classList.add("contestTemplateFlex");
    const hostDiv1 = document.createElement("div");
    hostDiv1.textContent = "Host:";
    hostDiv.appendChild(hostDiv1);
    const hostDiv2 = document.createElement("div");
    hostDiv2.textContent = contest.creator;
    hostDiv.appendChild(hostDiv2);
    template.appendChild(hostDiv);

    const datefromDiv = document.createElement("div");
    datefromDiv.classList.add("contestTemplateFlex");
    const datefromDiv1 = document.createElement("div");
    datefromDiv1.textContent = "Date from:";
    datefromDiv.appendChild(datefromDiv1);
    const datefromDiv2 = document.createElement("div");
    datefromDiv2.textContent = contest.startDate.slice(0, 10);
    datefromDiv.appendChild(datefromDiv2);
    template.appendChild(datefromDiv);

    const dateToDiv = document.createElement("div");
    dateToDiv.classList.add("contestTemplateFlex");
    const dateToDiv1 = document.createElement("div");
    dateToDiv1.textContent = "Date to:";
    dateToDiv.appendChild(dateToDiv1);
    const dateToDiv2 = document.createElement("div");
    dateToDiv2.textContent = contest.endDate.slice(0, 10);
    dateToDiv.appendChild(dateToDiv2);
    template.appendChild(dateToDiv);

    const statusDiv = document.createElement("div");
    statusDiv.classList.add("contestTemplateFlex");
    const statusDiv1 = document.createElement("div");
    statusDiv1.textContent = "Status:";
    statusDiv.appendChild(statusDiv1);
    const statusDiv2 = document.createElement("div");
    statusDiv2.textContent = contest.state;
    statusDiv.appendChild(statusDiv2);
    template.appendChild(statusDiv);

    const choiceDiv = document.createElement("div");
    choiceDiv.classList.add("contestTemplateFlex");

    //check if player accepted already
    const thisParticipant = contest.participants.find((x) => {
      return x.username == currentUser.username;
    });

    // console.log('participant: ' + participantsListt.state);
    if (thisParticipant.state == "pending") {
      const choiceDiv1 = document.createElement("div");
      choiceDiv1.classList.add("contestButtonAccept");
      choiceDiv1.textContent = "Accept";
      choiceDiv.appendChild(choiceDiv1);

      const choiceDiv2 = document.createElement("div");
      choiceDiv2.classList.add("contestButtonDecline");
      choiceDiv2.textContent = "Decline";
      choiceDiv.appendChild(choiceDiv2);

      template.append(choiceDiv);

      choiceDiv1.addEventListener("click", () => {
        addEventListenerToChoiceButtons(choiceDiv1);
      });
      choiceDiv2.addEventListener("click", () => {
        addEventListenerToChoiceButtons(choiceDiv2);
      });
    } else if (thisParticipant.state == "accepted") {
      const choiceDiv1 = document.createElement("div");
      choiceDiv1.classList.add("contestButtonResign");
      choiceDiv1.textContent = "Resign";
      choiceDiv.appendChild(choiceDiv1);

      template.append(choiceDiv);
      choiceDiv1.addEventListener("click", () => {
        addEventListenerToChoiceButtons(choiceDiv1);
      });
    }
  } else if (contest.state == "active") {
    //display as active.
    const dateToDiv = document.createElement("div");
    dateToDiv.classList.add("contestTemplateFlex");
    const dateToDiv1 = document.createElement("div");
    dateToDiv1.textContent = "Date to:";
    dateToDiv.appendChild(dateToDiv1);
    const dateToDiv2 = document.createElement("div");
    dateToDiv2.textContent = contest.endDate.slice(0, 10);
    dateToDiv.appendChild(dateToDiv2);
    template.appendChild(dateToDiv);

    const statusDiv = document.createElement("div");
    statusDiv.classList.add("contestTemplateFlex");
    const statusDiv1 = document.createElement("div");
    statusDiv1.textContent = "Status:";
    statusDiv.appendChild(statusDiv1);
    const statusDiv2 = document.createElement("div");
    statusDiv2.textContent = contest.state;
    statusDiv.appendChild(statusDiv2);
    template.appendChild(statusDiv);

    const leaderDiv = document.createElement("div");
    leaderDiv.classList.add("contestTemplateFlex");
    const leaderDiv1 = document.createElement("div");
    leaderDiv1.textContent = "Leader:";
    leaderDiv.appendChild(leaderDiv1);
    //find out who is leading in highscore:
    //sort differently if it is reactiongame
    let scoresList = [];
    if (contest.gamename == "ReactionGame") {
      scoresList = contest.scores.sort((a, b) => {
        return a.score - b.score;
      });
    } else {
      scoresList = contest.scores.sort((a, b) => {
        return b.score - a.score;
      });
    }

    if (scoresList.length > 0) {
      const leaderDiv2 = document.createElement("div");
      leaderDiv2.textContent = scoresList[0].username;
      leaderDiv.appendChild(leaderDiv2);
    }
    template.appendChild(leaderDiv);

    const hsDiv = document.createElement("div");
    hsDiv.classList.add("contestTemplateFlex");
    const hsDiv1 = document.createElement("div");
    hsDiv1.textContent = "Highscore:";
    hsDiv.appendChild(hsDiv1);
    if (scoresList.length > 0) {
      const hsDiv2 = document.createElement("div");
      hsDiv2.textContent = scoresList[0].score;
      hsDiv.appendChild(hsDiv2);
    }
    template.appendChild(hsDiv);

    const choiceDiv = document.createElement("div");
    choiceDiv.classList.add("contestTemplateFlex");
    const choiceDiv1 = document.createElement("div");
    choiceDiv1.classList.add("contestButtonResign");
    choiceDiv1.textContent = "Resign";
    choiceDiv.appendChild(choiceDiv1);
    template.appendChild(choiceDiv);
    choiceDiv1.addEventListener("click", () => {
      addEventListenerToChoiceButtons(choiceDiv1);
    });
  }
}

createContestBtn.addEventListener("click", () => {
  //populate friend list
  //first clear it
  contestFriendList.innerHTML = "";
  contestPlayersList.innerHTML = "";
  if (currentUser.friends.length < 1) {
    const friendElem = document.createElement("div");
    friendElem.textContent = "No friends...";
    friendElem.classList.add("friendInList");

    contestFriendList.appendChild(friendElem);
  }

  currentUser.friends.forEach((friend) => {
    const friendElem = document.createElement("div");
    friendElem.textContent = friend.username;
    friendElem.classList.add("friendInList");

    friendElem.addEventListener("click", () => {
      addEventListenersToFriends(friendElem);
    });
    friendElem.addEventListener("mouseenter", () => {
      friendElem.querySelector("div").style.visibility = "visible";
    });
    friendElem.addEventListener("mouseleave", () => {
      friendElem.querySelector("div").style.visibility = "hidden";
    });

    const plusSign = document.createElement("div");
    plusSign.textContent = "+";
    plusSign.style.color = "green";
    plusSign.classList.add("pSigns");
    friendElem.appendChild(plusSign);

    contestFriendList.appendChild(friendElem);
  });

  function addEventListenersToFriends(elem) {
    if (elem.classList.contains("friendInList")) {
      const contestPlayer = document.createElement("div");
      if (elem.querySelector("div")) {
        elem.querySelector("div").remove();
      }
      contestPlayer.textContent = elem.textContent;
      contestPlayer.classList.add("contestPlayer");

      contestPlayer.addEventListener("click", () => {
        addEventListenersToFriends(contestPlayer);
      });
      contestPlayer.addEventListener("mouseenter", () => {
        contestPlayer.querySelector("div").style.visibility = "visible";
      });
      contestPlayer.addEventListener("mouseleave", () => {
        contestPlayer.querySelector("div").style.visibility = "hidden";
      });

      const minusSign = document.createElement("div");
      minusSign.style.color = "red";
      minusSign.textContent = "-";
      minusSign.classList.add("pSigns");
      contestPlayer.appendChild(minusSign);

      contestPlayersList.appendChild(contestPlayer);

      elem.remove();
    } else if (elem.classList.contains("contestPlayer")) {
      const friendElem = document.createElement("div");
      if (elem.querySelector("div")) {
        elem.querySelector("div").remove();
      }
      friendElem.textContent = elem.textContent;
      friendElem.classList.add("friendInList");

      friendElem.addEventListener("click", () => {
        addEventListenersToFriends(friendElem);
      });
      friendElem.addEventListener("mouseenter", () => {
        friendElem.querySelector("div").style.visibility = "visible";
      });
      friendElem.addEventListener("mouseleave", () => {
        friendElem.querySelector("div").style.visibility = "hidden";
      });

      const plusSign = document.createElement("div");
      plusSign.textContent = "+";
      plusSign.style.color = "green";
      plusSign.classList.add("pSigns");
      friendElem.appendChild(plusSign);

      contestFriendList.appendChild(friendElem);
      elem.remove();
    }
  }

  //open create contest popup
  popupWindowContest.classList.add("active");
  overlay.classList.add("active");

  //settings starting date. By default an Hour from now
  let dateStart = new Date();
  dateStart.setHours(dateStart.getHours() + 1);
  dateStartElem.textContent =
    dateStart.toISOString().slice(0, 10) +
    " : " +
    ("0" + dateStart.getHours()).slice(-2) +
    ":" +
    ("0" + dateStart.getMinutes()).slice(-2);

  let dateEnd = new Date(); //.setFullYear(new Date().getFullYear() + 1)
  dateEnd.setDate(dateEnd.getDate() + 1); //set the day after by default
  dateEnd.setHours(dateStart.getHours());
  dateEndElem.textContent =
    dateEnd.toISOString().slice(0, 10) +
    " : " +
    ("0" + dateEnd.getHours()).slice(-2) +
    ":" +
    ("0" + dateEnd.getMinutes()).slice(-2);
});

closeContestsBtn.addEventListener("click", () => {
  popupContests.classList.remove("active");
  overlay.classList.remove("active");
});
closeWindowContestBtn.addEventListener("click", () => {
  popupWindowContest.classList.remove("active");
  overlay.classList.remove("active");
});

dateStartPicker.addEventListener("change", () => {
  let date = new Date(dateStartPicker.value);
  dateStartElem.textContent =
    date.toISOString().slice(0, 10) +
    " : " +
    ("0" + date.getHours()).slice(-2) +
    ":" +
    ("0" + date.getMinutes()).slice(-2);
});
dateEndPicker.addEventListener("change", () => {
  let date = new Date(dateEndPicker.value);
  dateEndElem.textContent =
    date.toISOString().slice(0, 10) +
    " : " +
    ("0" + date.getHours()).slice(-2) +
    ":" +
    ("0" + date.getMinutes()).slice(-2);
});

finishInvitationBtn.addEventListener("click", async () => {
  //send invitation info to DB
  class Score {
    constructor(gamename, username, score, date) {
      (this.gamename = gamename),
        (this.username = username),
        (this.score = score),
        (this.date = date);
    }
  }
  class Participant {
    constructor(username, state = "pending") {
      (this.username = username), (this.state = state);
    }
  }

  // const participant1 = new Participant('hejsan', 'hejda');
  // console.log("participant1: " + JSON.stringify(participant1));
  const arrayOfScores = [];
  // const score1 = new Score("AimGaim", 'hejda', 1001, new Date());
  // const score2 = new Score("AimGaim", 'bojo', 2100, new Date());
  // arrayOfScores.push(score1); arrayOfScores.push(score2);

  const contestParticipants = document.querySelectorAll(".contestPlayer");
  const nameArray2 = [];
  const creatorObject = new Participant(userSpan.textContent, "accepted");
  nameArray2.push(creatorObject);
  // nameArray2.push(userSpan.textContent);
  if (contestParticipants.length > 0) {
    contestParticipants.forEach((part) => {
      part.querySelector("div").remove();

      const participantObject = new Participant(part.textContent);
      nameArray2.push(participantObject);
      // nameArray2.push(part.textContent);
    });
  }

  // const nameArray = ["david1", "jacob2"];

  let startingDate = new Date(dateStartElem.textContent);
  let endingDate = new Date(dateEndElem.textContent);

  const data = {
    gamename: gameSelect.value,
    creator: userSpan.textContent,
    participants: nameArray2,
    scores: arrayOfScores,
    startDate: new Date(
      startingDate.getTime() - startingDate.getTimezoneOffset() * 60000
    ), //dateStartPicker.value dateStartElem.textContent
    endDate: new Date(endingDate.getTime() - endingDate.getTimezoneOffset() * 60000),
    state: "invitation",
  };

  // console.log(JSON.stringify(data)); 'invitation'

  const response = await fetch(`http://localhost:${process.env.PORT}/contests`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  popupWindowContest.classList.remove("active");
  overlay.classList.remove("active");
});

//****************************** */
//END Create Contest section
//****************************** */
