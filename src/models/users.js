const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  friends: [{ username: String }],
  alert: [
    {
      new: {
        type: Boolean,
      },
      sender: String,
    },
  ],
  isAdmin: {
    type: Boolean,
    default: false,
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
