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
