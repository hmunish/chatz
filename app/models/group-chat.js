const mongoose = require("mongoose");

const { Schema } = mongoose;

const groupChatSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    members: {
      type: [
        {
          email: {
            type: String,
            required: true,
          },
          isAdmin: {
            type: Boolean,
            required: true,
            default: false,
          },
        },
      ],
      required: true,
    },
    createdByUser: {
      type: String,
      required: true,
    },
    messages: {
      type: [
        {
          userEmail: {
            type: String,
            required: true,
          },
          message: {
            type: String,
            required: true,
          },
          messageSentAt: {
            type: Date,
            required: true,
            default: Date.now,
          },
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("group-chat", groupChatSchema);
