// QUERYSELECTORS
const loginFormButton = document.querySelector(".login-form-submit");
const loginFormUsername = document.querySelector("#username-field");
const loginFormPassword = document.querySelector("#password-field");
const createAccountButton = document.querySelector(".create-btn");
const formHolderDiv = document.querySelector("div.form-holder");
const mainElement = document.querySelector("main");
const returnToLoginBtn = document.querySelector(".return");

// Tömma input fält
loginFormButton.addEventListener("click", () => {
  loginFormUsername.value = loginFormPassword.value = "";
});

// göm / visa olika vyer
createAccountButton.addEventListener("click", function () {
  formHolderDiv.classList.remove("hide");
  mainElement.classList.add("hide");
});

returnToLoginBtn.addEventListener("click", function () {
  formHolderDiv.classList.add("hide");
  mainElement.classList.remove("hide");
});

// function getJsonUsers() {
//   const usersArray = fetchUsers();
//   fetch("users.json")
//     .then((response) => response.json())
//     .then((users) => {
//       users.forEach((user) => {
//         if (!userExists(user)) {
//           usersArray.push(user);
//         }
//       });

//       const serializedUsers = JSON.stringify(usersArray);

//       localStorage.setItem("users", serializedUsers);
//     });
// }

// async function userExists(user) {
//   // const users = await fetchUsers();
//   // return users.some((u) => u.username === user.username);
//   // const findUser = await User.findOne({ _id: user._id });
//   // if (findUser) return true;
//   // return false;
// }

// async function fetchUsers() {
//   // const serializedUsers = localStorage.getItem("users");
//   // return JSON.parse(serializedUsers) ?? [];
//   // const users = await User.find();
//   // return JSON.parse(users);
// }

// async function addUser(user) {
//   if (await userExists(user)) {
//     throw new Error("Username already exists!");
//   }

//   // const newUser = await User.create({
//   //   username: req.body.username,
//   //   password: req.body.password,
//   // });

//   //
//   //
//   // const users = await fetchUsers();
//   // const serializeUsers = JSON.stringify(users);
//   // localStorage.setItem("users", serializeUsers);
// }
