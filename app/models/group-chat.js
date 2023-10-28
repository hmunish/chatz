const mongoose = require("mongoose");

const { Schema } = mongoose;

const groupChatSchema = new Schema(
  {
    members: {
      type: [String],
      required: true,
    },
    admins: {
      type: [String],
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
