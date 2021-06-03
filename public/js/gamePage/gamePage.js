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
const setLoggedInName = () => {
  return document.cookie
    .split(";")
    .filter((S) => S.includes("username"))
    .toString()
    .split("=")[1];
};
let currentUser;
async function init() {
  userSpan.textContent = setLoggedInName();
  currentUser = await getCurrentUser();
  getUsersAndDisplay();
  loadMessagers();
  displayNewMessageToUser();
  loadGameCards();
}
init();

// scan to see if a new request for conversations is needed
let currentConvos = getConversations();
setInterval(async () => {
  const response = await fetch("http://localhost:3000/alert", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const JsonResponse = await response.json();

  if (JsonResponse) {
    currentConvos = await getConversations();
  }
}, 1000);

// ---- EVENT HANDLERS ----
document.addEventListener("click", MakeLiBlocksClickable, false);
document.addEventListener("click", makeAddUserButtonsClickable, false);

messageInput.addEventListener("keypress", async function (e) {
  if (e.key === "Enter") {
    await updateUsersMessage();

    messageInput.value = "";
  }
});

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
  }
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
  let convo;
  convoArr.forEach((el) => {
    convo = el;
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
      <button class="add-friend-btn">Add</button>
      </li>
      `;

    showUsersList.insertAdjacentHTML("afterbegin", html);
  });
}

async function MakeLiBlocksClickable(e) {
  if (hasClass(e.target, "user")) {
    await getConversations();
    await setUserAlertBackToFalse();
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

async function setUserAlertBackToFalse() {
  await fetch("http://localhost:3000/users", {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
}

async function displayNewMessageToUser() {
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
    const messagesCorrected = conversations.messages
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

    const finalMessages = messagesCorrected.map((conv) => {
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
