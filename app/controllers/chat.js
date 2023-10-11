const Chat = require("../models/chat");
const User = require("../models/user");
const { sanitizeUserInput } = require("../utility/input-validation");

const addChatIdToUser = async (userId, chatId) => {
  try {
    await User.findByIdAndUpdate(userId, { $push: { chats: chatId } });
  } catch (err) {
    throw err;
  }
};

const addUserIdToChatUsers = async (userId1, userId2) => {
  try {
    await User.findByIdAndUpdate(userId1, { $push: { chatUsers: userId2 } });
    await User.findByIdAndUpdate(userId2, { $push: { chatUsers: userId1 } });
  } catch (err) {
    throw err;
  }
};

exports.createChat = async (req, res) => {
  try {
    const contactId = sanitizeUserInput(req.body.contactId);
    if (!contactId)
      return res.status(400).send({ message: "Invalid request made" });

    // Check if the current user already has a chat with the requested user
    // const existingChatUsers = await User.findById(req.user._id).select(
    //   "chatUsers -_id"
    // );

    // if (existingChatUsers.chatUsers.find((id) => id == contactId))
    //   return res
    //     .status(409)
    //     .send({ message: "Chat with this user already exist" });

    const newChat = new Chat({ users: [req.user._id, contactId] });

    await newChat.save();
    await Promise.allSettled([
      addChatIdToUser(req.user._id, newChat._id),
      addChatIdToUser(contactId, newChat._id),
      addUserIdToChatUsers(req.user._id, contactId),
    ]);
    // const newChatDetails = await Chat.findById(newChat._id).populate(
    //   "users",
    //   "email"
    // );
    await newChat.populate("users", "email");
    res.send(newChat);
  } catch (err) {
    console.log(err);
    res.status(501).send({ message: "Error creating new chat" });
  }
};
