const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema({
  participants: [String],
  messages: [
    {
      sender: String,
      recipient: String,
      message: String,
      timestamp: {
        type: Date,
        default: Date.now(),
      },
      read: false,
    },
  ],
});

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
