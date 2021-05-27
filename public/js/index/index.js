// QUERYSELECTORS
const loginFormButton = document.querySelector(".login-form-submit");
const loginFormUsername = document.querySelector("#username-field");
const loginFormPassword = document.querySelector("#password-field");
const createAccountButton = document.querySelector(".create-btn");
const formHolderDiv = document.querySelector("div.form-holder");
const mainElement = document.querySelector("main");
const returnToLoginBtn = document.querySelector(".return");

// göm / visa olika vyer
createAccountButton.addEventListener("click", function () {
  formHolderDiv.classList.remove("hide");
  mainElement.classList.add("hide");
});

returnToLoginBtn.addEventListener("click", function () {
  formHolderDiv.classList.add("hide");
  mainElement.classList.remove("hide");
});
