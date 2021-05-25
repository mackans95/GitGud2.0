console.log("test");
const mainElement = document.querySelector("main");
const loginForm = document.querySelector(".login-form");
const loginGuestForm = document.querySelector(".login-form-guest");
const createAccountButton = document.querySelector(".create-btn");
const formHolderDiv = document.querySelector("div.form-holder");
const createForm = document.querySelector("form.create");
const returnToLoginBtn = document.querySelector(".return");
//tom storage-item för att ha koll på vem som är inloggad
sessionStorage.setItem("loggedInUser", "");

window.addEventListener("load", getJsonUsers);

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const user = {
    username: loginForm.username.value,
    password: loginForm.password.value,
  };

  if (userExists(user)) {
    window.location.href = "GamePage";
    sessionStorage.setItem("loggedInUser", loginForm.username.value);
  } else {
    alert("no user found");
    loginForm.reset();
  }
});

loginGuestForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const guest = {
    username: `GUEST#${Math.trunc(Math.random() * 1000)}`,
    password: "",
  };

  if (!userExists(guest)) {
    addUser(guest);
  }
  sessionStorage.setItem("loggedInUser", guest.username);
  window.location.href = "GamePage";
});

createAccountButton.addEventListener("click", function () {
  formHolderDiv.classList.remove("hide");
  mainElement.classList.add("hide");
});

createForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const user = {
    username: createForm.username.value,
    password: createForm.password.value,
  };

  try {
    addUser(user);
    alert("Registered! Have Fun!");
    formHolderDiv.classList.add("hide");
    mainElement.classList.remove("hide");
  } catch (err) {
    alert(err.message);
  }

  createForm.reset();
});

returnToLoginBtn.addEventListener("click", function () {
  formHolderDiv.classList.add("hide");
  mainElement.classList.remove("hide");
});

function getJsonUsers() {
  const usersArray = fetchUsers();
  fetch("users.json")
    .then((response) => response.json())
    .then((users) => {
      users.forEach((user) => {
        if (!userExists(user)) {
          usersArray.push(user);
        }
      });

      const serializedUsers = JSON.stringify(usersArray);

      localStorage.setItem("users", serializedUsers);
    });
}

function userExists(user) {
  const users = fetchUsers();
  return users.some((u) => u.username === user.username);
}

function fetchUsers() {
  const serializedUsers = localStorage.getItem("users");
  return JSON.parse(serializedUsers) ?? [];
}

function addUser(user) {
  if (userExists(user)) {
    throw new Error("Username already exists!");
  }
  const users = fetchUsers();
  users.push(user);
  const serializeUsers = JSON.stringify(users);
  localStorage.setItem("users", serializeUsers);
}
