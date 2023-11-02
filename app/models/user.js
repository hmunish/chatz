const mongoose = require('mongoose');

const { Schema } = mongoose;

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
      ref: 'chat',
      default: [],
    },
    chatUsers: {
      type: [String],
      required: true,
      default: [],
    },
    groups: {
      type: [Schema.Types.ObjectId],
      required: true,
      ref: 'group-chat',
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('user', userSchema);
