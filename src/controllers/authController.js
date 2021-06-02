const jwt = require("jsonwebtoken");
const User = require("../models/users");
const path = require("path");
const publicDirectoryPath = path.join(__dirname, "../../public");

exports.login = async (req, res) => {
  const { username, password } = req.body;

  // har matat in namn och lösen
  if (!username || !password) {
    return res.send("Missing username or password");
  }

  // kolla så användare finns
  const user = await User.findOne({ username });

  if (!user || user.password !== password) {
    return res.send("Incorrect username or password");
  }

  //skapa token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SIGNINGKEY);

  // sätt header + cookies
  // res.set("Authorization", "Bearer " + token);
  res.cookie("jwt", token);
  res.cookie("username", user.username);

  // skicka till nästa sida (gamePage)
  res.sendFile(publicDirectoryPath + "/gamePage.html");
};
