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

const addUserEmailIdToChatUsers = async (userEmailId1, userEmailId2) => {
  try {
    await User.findOneAndUpdate(
      { email: userEmailId1 },
      { $push: { chatUsers: userEmailId2 } }
    );
    await User.findOneAndUpdate(
      { email: userEmailId2 },
      { $push: { chatUsers: userEmailId1 } }
    );
  } catch (err) {
    throw err;
  }
};

exports.createChat = async (req, res) => {
  try {
    const contactEmailId = sanitizeUserInput(req.body.contactEmailId);
    const contactId = sanitizeUserInput(req.body.contactId);
    if (!contactEmailId || !contactId)
      return res.status(400).send({ message: "Invalid request made" });

    // Check if the current user already has a chat with the requested user
    const existingChatUsers = await User.findById(req.user._id).select(
      "chatUsers -_id"
    );

    if (
      existingChatUsers.chatUsers.find((emailId) => emailId == contactEmailId)
    )
      return res
        .status(409)
        .send({ message: "Chat with this user already exist" });

    const newChat = new Chat({ users: [req.user.email, contactEmailId] });

    await newChat.save();

    await Promise.allSettled([
      addChatIdToUser(req.user._id, newChat._id),
      addChatIdToUser(contactId, newChat._id),
      addUserEmailIdToChatUsers(req.user.email, contactEmailId),
    ]);
    await newChat.populate("users", "email");
    res.send(newChat);
  } catch (err) {
    console.log(err);
    res.status(501).send({ message: "Error creating new chat" });
  }
};
