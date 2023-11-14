const mime = require('mime');

const formidable = require('formidable');
const fs = require('fs');
const AWS = require('aws-sdk');
const {
  sanitizeUserInput,
  sanitizeText,
} = require('../utility/input-validation');
const User = require('../models/user');
const groupChat = require('../models/group-chat');
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

const addGroupIdToUser = async (userId, groupId) => {
  try {
    await User.findByIdAndUpdate(userId, { $push: { groups: groupId } });
  } catch (err) {
    throw err;
  }
};

const addGroupIdToUserByEmail = async (email, groupId) => {
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { $push: { groups: groupId } },
    ).select('email');
    return user;
  } catch (err) {
    throw err;
  }
};

const addMemberEmailToGroup = async (groupId, contactEmailId) => {
  try {
    await groupChat.findByIdAndUpdate(groupId, {
      $push: { members: { email: contactEmailId, isAdmin: false } },
    });
  } catch (err) {
    throw err;
  }
};

exports.createGroup = async (req, res) => {
  try {
    const groupName = sanitizeText(req.body.groupName);

    if (!groupName) {
      return res.status(400).send({ message: 'Invalid request made' });
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
        .send({ message: 'Group with this name already exists' });
    }

    // Creating new group
    const newGroup = new groupChat({
      createdByUser: req.user.email,
      name: groupName,
      members: [{ email: req.user.email, isAdmin: true }],
    });
    await newGroup.save();
    await addGroupIdToUser(req.user._id, newGroup._id);

    res.send(newGroup);
  } catch (err) {
    res.status(501).send({ message: 'Error creating new group' });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const groupId = sanitizeUserInput(req.body.groupId);
    const message = sanitizeText(req.body.message);

    if (!groupId || !message) {
      return res.status(400).send({ message: 'Invalid request made' });
    }

    // Adding message to the chat
    const group = await groupChat.findByIdAndUpdate(groupId, {
      $push: { messages: { userEmail: req.user.email, message } },
    });

    const { messages } = await groupChat.findById(groupId).select('messages');

    group.members.forEach((member) => {
      if (member.email !== req.user.email) {
        req.io.to(member.email).emit('message', groupId, messages.slice(-1)[0]);
      }
    });

    res.send({ newMessage: messages.slice(-1)[0] });
  } catch (err) {
    res.status(501).send({ message: 'Error submitting message' });
  }
};

exports.addMember = async (req, res) => {
  try {
    const groupId = sanitizeUserInput(req.body.groupId);
    const contactEmailId = sanitizeText(req.body.contactEmailId);

    if (!groupId || !contactEmailId) {
      return res.status(400).send({ message: 'Invalid request made' });
    }

    // Checking if the group already exist
    const isGroup = await groupChat.findById(groupId);

    // If group doesn't exist return with 404 error
    if (!isGroup) {
      return res.status(404).send({ message: "Group doesn't exist" });
    }

    // Checking if the current user is the admin of the group
    const isAdmin = isGroup.members.find(
      (member) => member.email === req.user.email,
    );

    // If the user is not admin return with response 201
    if (!isAdmin) {
      return res.status(201).send({ message: 'Only admins can add members' });
    }

    // Checking if the given member already exist in the group
    const isMember = isGroup.members.find(
      (member) => member.email === contactEmailId,
    );

    // If member already exist return with 400 error
    if (isMember) {
      return res
        .status(400)
        .send({ message: 'User already exist in the group' });
    }

    // Adding the member in the group and
    // Adding group id in members groups array
    const result = await Promise.all([
      addMemberEmailToGroup(groupId, contactEmailId),
      addGroupIdToUserByEmail(contactEmailId, groupId),
    ]);

    const addedContactDetails = result[1];

    const updatedGroup = await groupChat.findById(groupId);

    // Emitting socket event of add new group to added user
    req.io.to(contactEmailId).emit('newGroupAdded', updatedGroup);

    // Emitting socket event for new member added to other users
    isGroup.members.forEach((member) => {
      req.io
        .to(member.email)
        .emit('groupMemberAdded', groupId, addedContactDetails);
    });
    // Responding with 200 OK
    res.status(200).send({ message: 'Member added successfully' });
  } catch (err) {
    res.status(501).send({ message: 'Error adding member' });
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
      const groupId = sanitizeUserInput(formFields.groupId);
      if (!groupId) {
        return res.status(400).send({ message: 'Invalid request made' });
      }

      const uploadedFileUrl = await uploadToS3(fileBlob, uploadFileName);

      // Adding message to the chat
      const group = await groupChat.findByIdAndUpdate(groupId, {
        $push: {
          messages: {
            userEmail: req.user.email,
            message: uploadedFileUrl,
            isFile: true,
          },
        },
      });

      const { messages } = await groupChat.findById(groupId).select('messages');

      group.members.forEach((member) => {
        if (member.email !== req.user.email) {
          req.io
            .to(member.email)
            .emit('message', groupId, messages.slice(-1)[0]);
        }
      });

      res.send({ newMessage: messages.slice(-1)[0] });
    });

    form.parse(req);
  } catch (err) {
    res.status(501).send({ message: 'Error submitting message' });
  }
};
