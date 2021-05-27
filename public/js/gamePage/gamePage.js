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

// userSpan.textContent = sessionStorage.getItem("loggedInUser");

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

// ---- POST Event: unhandled ----
const postBtn = document.querySelector(".post-user");

postBtn.addEventListener("click", postUserRequest);

function postUserRequest(e) {
  e.preventDefault();

  const currentUser = fetchCurrentUser();

  const user = {
    username: currentUser.username,
    password: currentUser.password,
  };

  fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  }).then((resp) => console.log(resp.status));
}

// ---- EVENT HANDLERS ----

window.addEventListener("load", loadGameCards);
// window.addEventListener("load", loadMessagers);
// window.addEventListener("load", sendToLoginPageIfNoUser);
// window.addEventListener("load", displayNewMessageToUser);

document.addEventListener("click", MakeLiBlocksClickable, false);

messageInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    updateUsersMessage();

    displayMessageFromInputField();

    messageInput.value = "";
  }
});

logoutBtn.addEventListener("click", function (e) {
  e.preventDefault();

  sessionStorage.setItem("loggedInUser", "");

  window.location.href = "";
});

// ---- FUNCTIONS ----
function MakeLiBlocksClickable(e) {
  if (hasClass(e.target, "user")) {
    removeNewMessageSpan(e.target);
    showMessagesAndAddButton(e.target);
  }
}

// function sendToLoginPageIfNoUser() {
//   if (userSpan.textContent === "") {
//     window.location.href = "/";
//   }
// }

// function displayNewMessageToUser() {
//   const currentUser = fetchCurrentUser();

//   const users = fetchUsers();

//   const messagesCorrected = users
//     .filter((user) => user.conversation)
//     .flatMap((m) => m.conversation);

//   const msgsUnread = messagesCorrected.filter((msg) => msg.read === false);

//   msgsUnread.forEach((msg) => {
//     if (msg.read === false && msg.recipient === currentUser.username) {
//       const msgLiBox = [...document.querySelectorAll("li.user")];

//       msgLiBox.forEach((li) => {
//         if (li.textContent.trim() === msg.sender) {
//           li.style.backgroundColor = "yellow";
//           const test = document.createElement("span");
//           test.textContent = "NEW!";
//           // test.style.paddingLeft = "60px";
//           li.append(test);
//         }
//       });
//     }
//   });
// }

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

// function loadMessagers() {
//   const users = fetchUsers();

//   users.forEach((user) => {
//     if (user.username !== sessionStorage.getItem("loggedInUser")) {
//       const html = `
//       <li class="user">${user.username}
//       </li>
//       `;

//       olMessagers.insertAdjacentHTML("afterbegin", html);
//     }
//   });
// }

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

// function userExists(user) {
//   const users = fetchUsers();
//   return users.some((u) => u.username === user.username);
// }

// function fetchUsers() {
//   const serializedUsers = localStorage.getItem("users");
//   return JSON.parse(serializedUsers) ?? [];
// }

// function fetchCurrentUser() {
//   return fetchUsers().find((user) => user.username === userSpan.textContent);
// }

// function updateUsersMessage() {
//   const users = fetchUsers();

//   const currentUser = users.find(
//     (user) => user.username === sessionStorage.getItem("loggedInUser")
//   );

//   !currentUser.hasOwnProperty("conversation") ? (currentUser.conversation = []) : "";

//   const message = {
//     sender: currentUser.username,
//     recipient: messageHeadSpan.textContent.trim(),
//     message: messageInput.value,
//     timeStamp: Math.floor(Date.now() / 1000),
//     read: false,
//   };

//   currentUser.conversation.push(message);

//   const serializeUsers = JSON.stringify(users);
//   localStorage.setItem("users", serializeUsers);
// }

// function displayMessages(target) {
//   const messages = getAllMessages(target); //getMessagesHTML();

//   if (messages) {
//     olMessages.insertAdjacentHTML("beforeend", messages.join(""));
//   }
// }

// function displayMessageFromInputField() {
//   const messages = getMessagesFromUs();

//   if (messages) {
//     olMessages.insertAdjacentHTML("beforeend", messages[messages.length - 1]);
//   }
// }

// function getMessagesFromUs() {
//   const currentUser = fetchUsers().find(
//     (user) => user.username === userSpan.textContent
//   );

//   const messages = currentUser?.conversation
//     ?.filter((conv) => conv.recipient === messageHeadSpan.textContent.trim())
//     .map((conv) => {
//       return `<li class="ours">${conv.message}</li>`.trim();
//     });

//   return messages;
// }

// function getAllMessages(target) {
//   const currentUser = fetchUsers().find(
//     (user) => user.username === userSpan.textContent
//   );

//   const users = fetchUsers();

//   const messagesCorrected = users
//     .filter((user) => user.conversation)
//     .flatMap((m) => m.conversation)
//     .filter(
//       (m) =>
//         (m.recipient === currentUser.username &&
//           m.sender === target.textContent.trim()) ||
//         (m.sender === currentUser.username &&
//           m.recipient === target.textContent.trim())
//     )
//     .sort(compare);

//   function compare(message1, message2) {
//     if (message1.timeStamp < message2.timeStamp) {
//       return -1;
//     }
//     if (message1.timeStamp > message2.timeStamp) {
//       return 1;
//     }
//   }

//   const finalMessages = messagesCorrected.map((conv) => {
//     if (conv.sender !== currentUser.username) {
//       return `<li>${conv.message}</li>`.trim();
//     } else {
//       return `<li class="ours">${conv.message}</li>`.trim();
//     }
//   });

//   return finalMessages;
// }

// function setMessagesToRead(target) {
//   const currentUser = fetchUsers().find(
//     (user) => user.username === userSpan.textContent
//   );

//   const users = fetchUsers();

//   const messagesToUser = users
//     .filter((user) => user.conversation)
//     .flatMap((m) => m.conversation)
//     .filter(
//       (m) =>
//         (m.recipient === currentUser.username &&
//           m.sender === target.textContent.trim()) ||
//         (m.sender === currentUser.username &&
//           m.recipient === target.textContent.trim())
//     );

//   messagesToUser.forEach((msg) => {
//     if (
//       msg.read === false &&
//       currentUser.username !== target.username &&
//       msg.sender !== currentUser.username
//     ) {
//       msg.read = true;

//       const serializeUsers = JSON.stringify(users);
//       localStorage.setItem("users", serializeUsers);
//     }
//   });
// }
