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

  // console.log(currentUserDB.friends.length);
  // console.log(currentUser.friends.length);

  // if (currentUserDB.friends.length !== currentUser.friends.length) {
  //   alertUserToChangeInFriendList();
  // }
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

  await fetch(`http://localhost:3000/users/${currentUser.username}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

async function getAlertResponses() {
  const response = await fetch("http://localhost:3000/alert", {
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
  const convoRes = await fetch("http://localhost:3000/conversations", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

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

    const response = await fetch(`http://localhost:3000/users/${username}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

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

async function setUserAlertBackToFalse(target) {
  const data = {
    sender: target.innerText.split("\n")[0],
  };

  await fetch("http://localhost:3000/users", {
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

  const response = await fetch("http://localhost:3000/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(convo),
  });

  const JsonConvoRes = await response.json();
  console.log(JsonConvoRes);
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
const closeWindowContestBtn = document.querySelector("[data-close-button]");
const popupWindowContest = document.querySelector(".popupWindow");
const overlay = document.querySelector("#overlay");
const dateStartPicker = document.querySelector("#dateStartInput");
const dateEndPicker = document.querySelector("#dateEndInput");
const dateStartElem = document.querySelector(".dateStart");
const dateEndElem = document.querySelector(".dateEnd");
const gameSelect = document.querySelector(".gameName");
const finishInvitationBtn = document.querySelector(".invitationButton");

//populate select game
gamesArray.forEach((game) => {
  const option = document.createElement("option");
  option.textContent = game.route;
  option.value = game.route;

  gameSelect.appendChild(option);
});

createContestBtn.addEventListener("click", () => {
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
  const emptyArray = []; //${emptyArray}    ${new Date(dateStartElem.textContent)}    ${new Date(dateEndElem.textContent)}
  //[{"gamename":"someGame""username":"someName","score":"100"}]
  // console.log(jsonScoreArray);

  // class Participant{
  //   constructor(username,password){
  //     this.username = username,
  //     this.password = password
  //   }
  // }
  class Score {
    constructor(gamename, username, score, date) {
      (this.gamename = gamename),
        (this.username = username),
        (this.score = score),
        (this.date = date);
    }
  }

  // const participant1 = new Participant('hejsan', 'hejda');
  // console.log("participant1: " + JSON.stringify(participant1));
  const score1 = new Score("AimGaim", "hejda", 1001, new Date());
  const nameArray = ["david1", "jacob2"];

  let startingDate = new Date(dateStartElem.textContent);
  let endingDate = new Date(dateEndElem.textContent);

  const data = {
    gamename: gameSelect.value,
    creator: userSpan.textContent,
    participants: nameArray,
    scores: score1,
    startDate: new Date(
      startingDate.getTime() - startingDate.getTimezoneOffset() * 60000
    ), //dateStartPicker.value dateStartElem.textContent
    endDate: new Date(endingDate.getTime() - endingDate.getTimezoneOffset() * 60000),
    state: "invitation",
  };

  // console.log(JSON.stringify(data));

  const response = await fetch("http://localhost:3000/contests", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  console.log("sent!");

  // response.json().then(data => {
  //   console.log(data);
  // });

  popupWindowContest.classList.remove("active");
  overlay.classList.remove("active");
});

//****************************** */
//END Create Contest section
//****************************** */
