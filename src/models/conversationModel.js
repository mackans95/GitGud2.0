const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema({
  sender: String,
  recipient: String,
  message: String,
  read: Boolean,
  timeStamp: {
    type: Date,
    default: Date.now(),
  },
});

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
