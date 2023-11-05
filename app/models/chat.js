const mongoose = require("mongoose");

const { Schema } = mongoose;

const chatSchema = new Schema(
  {
    users: {
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
          isFile: {
            type: Boolean,
          },
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("chat", chatSchema);
