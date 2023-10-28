const groupChat = require("../models/group-chat");
const User = require("../models/user");

const {
  sanitizeUserInput,
  sanitizeText,
} = require("../utility/input-validation");

const addGroupIdToUser = async (userId, groupId) => {
  try {
    await User.findByIdAndUpdate(userId, { $push: { groups: groupId } });
  } catch (err) {
    throw err;
  }
};

exports.createGroup = async (req, res) => {
  try {
    const groupName = sanitizeText(req.body.groupName);

    if (!groupName) {
      return res.status(400).send({ message: "Invalid request made" });
    }

    // Checking if user already has created group with same name
    const isGroupExist = await groupChat.findOne({
      name: groupName,
      createdByUser: req.user.email,
    });

    if (isGroupExist) {
      // If yes return response with 400 code
      return res
        .status(400)
        .send({ message: "Group with this name already exists" });
    }

    // Creating new group
    const newGroup = new groupChat({
      createdByUser: req.user.email,
      name: groupName,
      admins: [req.user.email],
    });
    await newGroup.save();
    await addGroupIdToUser(req.user._id, newGroup._id);

    res.send(newGroup);
  } catch (err) {
    console.log(err);
    res.status(501).send({ message: "Error creating new group" });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const groupId = sanitizeUserInput(req.body.groupId);
    const message = sanitizeText(req.body.message);

    if (!groupId || !message) {
      return res.status(400).send({ message: "Invalid request made" });
    }

    // Adding message to the chat
    const group = await groupChat.findByIdAndUpdate(groupId, {
      $push: { messages: { userEmail: req.user.email, message } },
    });

    const { messages } = await groupChat.findById(groupId).select("messages");

    group.members.forEach((emailId) => {
      if (emailId !== req.user.email) {
        req.io.to(emailId).emit("message", groupId, messages.slice(-1)[0]);
      }
    });

    group.admins.forEach((emailId) => {
      if (emailId !== req.user.email) {
        req.io.to(emailId).emit("message", groupId, messages.slice(-1)[0]);
      }
    });

    res.send({ newMessage: messages.slice(-1)[0] });
  } catch (err) {
    console.log(err);
    res.status(501).send({ message: "Error submitting message" });
  }
};
