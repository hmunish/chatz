const mongoose = require("mongoose");

const { Schema } = mongoose;

const chatSchema = new Schema(
  {
    users: {
      type: [Schema.Types.ObjectId],
      required: true,
      ref: "user",
    },
    messages: {
      type: [
        {
          user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "user",
          },
          message: {
            type: String,
            required: true,
          },
          createdAt: {
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

module.exports = mongoose.model("chat", chatSchema);
