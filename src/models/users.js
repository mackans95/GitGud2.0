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
  friends: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      unique: [true, "You can only add a friend once!"],
    },
  ],
  conversation: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Conversation",
    },
  ],
});

userSchema.pre(/^find/, function (next) {
  this.populate({
    path: "friends",
    select: "-__v -password",
  });

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
