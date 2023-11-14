const formidable = require('formidable');
const fs = require('fs');
const AWS = require('aws-sdk');
const mime = require('mime');
const Chat = require('../models/chat');
const User = require('../models/user');
const {
  sanitizeUserInput,
  sanitizeText,
} = require('../utility/input-validation');

require('dotenv').config();

const uploadToS3 = (data, filename) => {
  const mimeType = mime.getType(filename);
  const BUCKET_NAME = 'chatz-media';
  const { IAM_ACCESS_KEY } = process.env;
  const { IAM_SECRET_KEY } = process.env;

  const s3bucket = new AWS.S3({
    accessKeyId: IAM_ACCESS_KEY,
    secretAccessKey: IAM_SECRET_KEY,
  });

  const params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: data,
    ContentType: mimeType,
    ACL: 'public-read',
  };
  return new Promise((resolve, reject) => {
    s3bucket.upload(params, (err, s3Response) => {
      if (err) {
        reject(err);
      } else {
        resolve(s3Response.Location);
      }
    });
  });
};

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
      { $push: { chatUsers: userEmailId2 } },
    );
    await User.findOneAndUpdate(
      { email: userEmailId2 },
      { $push: { chatUsers: userEmailId1 } },
    );
  } catch (err) {
    throw err;
  }
};

exports.createChat = async (req, res) => {
  try {
    const contactEmailId = sanitizeUserInput(req.body.contactEmailId);
    const contactId = sanitizeUserInput(req.body.contactId);
    if (!contactEmailId || !contactId) {
      return res.status(400).send({ message: 'Invalid request made' });
    }

    // Check if user is trying to create chat with itself
    if (req.user.email === contactEmailId) {
      // If yes return response with 400 code
      return res
        .status(400)
        .send({ message: 'User cannot create chat with itself' });
    }

    // Check if the current user already has a chat with the requested user
    const existingChatUsers = await User.findById(req.user._id).select(
      'chatUsers -_id',
    );

    if (
      existingChatUsers.chatUsers.find((emailId) => emailId === contactEmailId)
    ) {
      return res
        .status(409)
        .send({ message: 'Chat with this user already exist' });
    }

    const newChat = new Chat({ users: [req.user.email, contactEmailId] });

    await newChat.save();

    await Promise.allSettled([
      addChatIdToUser(req.user._id, newChat._id),
      addChatIdToUser(contactId, newChat._id),
      addUserEmailIdToChatUsers(req.user.email, contactEmailId),
    ]);
    await newChat.populate('users', 'email');

    // Emitting newChat event to second user in the chat
    req.io.to(contactEmailId).emit('newChat', newChat);

    res.send(newChat);
  } catch (err) {
    res.status(501).send({ message: 'Error creating new chat' });
  }
};

exports.addMessage = async (req, res, next) => {
  try {
    const chatId = sanitizeUserInput(req.body.chatId);
    const message = sanitizeText(req.body.message);

    if (!chatId || !message) {
      return res.status(400).send({ message: 'Invalid request made' });
    }

    // Adding message to the chat
    const chat = await Chat.findByIdAndUpdate(chatId, {
      $push: { messages: { userEmail: req.user.email, message } },
    });

    const { messages } = await Chat.findById(chatId).select('messages');

    chat.users.forEach((emailId) => {
      if (emailId !== req.user.email) {
        req.io.to(emailId).emit('message', chatId, messages.slice(-1)[0]);
      }
    });

    res.send({ newMessage: messages.slice(-1)[0] });
  } catch (err) {
    res.status(501).send({ message: 'Error submitting message' });
  }
};

exports.addFileMessage = async (req, res) => {
  try {
    const form = new formidable.IncomingForm();
    let fileBlob;
    let uploadFileName;
    const formFields = {};

    form.on('file', (field, file) => {
      const filePath = file.filepath;
      uploadFileName = `${req.user.id}-${new Date().getTime()}-${
        file.originalFilename
      }`;
      fileBlob = fs.readFileSync(filePath);
      fs.unlink(filePath, (err) => {
        if (err) {
          throw err;
        }
      });
    });

    form.on('field', (field, value) => {
      formFields[field] = value;
    });

    form.on('end', async () => {
      const chatId = sanitizeUserInput(formFields.chatId);
      if (!chatId) {
        return res.status(400).send({ message: 'Invalid request made' });
      }
      const uploadedFileUrl = await uploadToS3(fileBlob, uploadFileName);

      // Adding message to the chat
      const chat = await Chat.findByIdAndUpdate(chatId, {
        $push: {
          messages: {
            userEmail: req.user.email,
            message: uploadedFileUrl,
            isFile: true,
          },
        },
      });

      const { messages } = await Chat.findById(chatId).select('messages');

      chat.users.forEach((emailId) => {
        if (emailId !== req.user.email) {
          req.io.to(emailId).emit('message', chatId, messages.slice(-1)[0]);
        }
      });

      res.send({ newMessage: messages.slice(-1)[0] });
    });

    form.parse(req);
  } catch (err) {
    res.status(501).send({ message: 'Error submitting message' });
  }
};
