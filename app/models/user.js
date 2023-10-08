const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    chats: {
      type: [Schema.Types.ObjectId],
      required: true,
      ref: "Chat",
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
