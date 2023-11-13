import axios from 'axios';
import { io } from 'socket.io-client';
import { sanitizeChatMessage, sanitizeUserInput } from '../common/utility';
import { BACKEND_HOST_URL } from '../common/config';

export const socket = io(`${BACKEND_HOST_URL}:80`);

// State for the chat app
export const state = {
  user: {},
  chatId: null,
};

// function to set current chat id for the state
export const setChatId = (chatId) => {
  state.chatId = chatId;
};

// function to get current chats by current chat id from state
export const getCurrentChats = () => state.user.chats.filter((el) => el._id === state.chatId);

// function to sort chats by in ascending by dates
export const sortChatNewest = () => {
  state.user.chats.sort((chat1, chat2) => {
    const time1 = new Date(
      chat1.messages.at(-1)?.messageSentAt || chat1.createdAt,
    ).getTime();
    const time2 = new Date(
      chat2.messages.at(-1)?.messageSentAt || chat2.createdAt,
    ).getTime();
    return time2 - time1;
  });
};

// function to insert new message in the chat by given chatId
export const insertNewMessage = (chatId, newMessage) => {
  for (let i = 0; i < state.user.chats.length; i += 1) {
    if (state.user.chats[i]._id === chatId) {
      state.user.chats[i].messages.push(newMessage);
      break;
    }
  }
};

// function to add new group member details to groups array
export const insertMemberDetailsToGroup = (groupId, contactDetails) => {
  state.user.chats.forEach((chat) => {
    if (chat._id === groupId) chat.members.push(contactDetails);
  });
};

// setting global axios headers authKey for authorizing user by json web token
axios.defaults.headers.common.authKey = sanitizeUserInput(
  JSON.parse(localStorage.getItem('chatzSignIn')) || ' ',
);

// function to verify if user is signed in
export async function isSignedIn() {
  try {
    const authKey = sanitizeUserInput(
      JSON.parse(localStorage.getItem('chatzSignIn')) || ' ',
    );
    if (!authKey) return false;
    const response = await axios.get(`${BACKEND_HOST_URL}/users/isSignedIn`);
    if (response.status === 200) {
      state.user = response.data.user;
      state.user.chats = [...state.user.chats, ...state.user.groups];
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

// function to send message
export async function sendMessage(form) {
  try {
    const currentChatId = sanitizeUserInput(state.chatId);

    if (form.attachedFile.value) {
      const formData = new FormData(form);

      let response;

      if (state.user.groups.find((group) => group._id === currentChatId)) {
        formData.append('groupId', currentChatId);
        response = await axios.post(
          `${BACKEND_HOST_URL}/groups/fileMessage`,
          formData,
        );
      } else {
        formData.append('chatId', currentChatId);
        response = await axios.post(
          `${BACKEND_HOST_URL}/chats/fileMessage`,
          formData,
        );
      }

      if (response.status !== 200) throw new Error('Error sending message');

      const { newMessage } = response.data;

      // Adding new message in the chat object
      insertNewMessage(currentChatId, newMessage);

      return true;
    }
    const messageCopy = sanitizeChatMessage(form.message.value);

    if (!currentChatId || !messageCopy) throw Error('Invalid inputs');

    let response;

    if (state.user.groups.find((group) => group._id === currentChatId)) {
      response = await axios.post(`${BACKEND_HOST_URL}/groups/message`, {
        groupId: currentChatId,
        message: messageCopy,
      });
    } else {
      response = await axios.post(`${BACKEND_HOST_URL}/chats/message`, {
        chatId: currentChatId,
        message: messageCopy,
      });
    }

    if (response.status !== 200) throw new Error('Error sending message');

    const { newMessage } = response.data;

    // Adding new message in the chat object
    insertNewMessage(currentChatId, newMessage);

    return true;
  } catch (err) {
    throw err;
  }
}

// function to search all users
export async function searchUsers(searchQuery, groupId = null) {
  try {
    const authKey = sanitizeUserInput(
      JSON.parse(localStorage.getItem('chatzSignIn')),
    );
    searchQuery = sanitizeUserInput(searchQuery);

    if (!authKey || !searchQuery) throw Error('Invalid inputs');
    const response = await axios.post(
      `${BACKEND_HOST_URL}/users/search`,
      { searchQuery },
      {
        headers: { authKey: JSON.parse(localStorage.getItem('chatzSignIn')) },
      },
    );

    if (groupId) {
      const groupMembers = state.user.groups.find(
        (group) => group._id === groupId,
      )?.members;
      const availableMembers = response.data.filter(
        (user) => !(
          groupMembers.filter((member) => member.email === user.email)
            .length > 0
        ),
      );
      return availableMembers;
    }

    return response.data;
  } catch (err) {
    throw err;
  }
}

// function to create a new chat
export async function createChat(contactEmailId, contactId) {
  try {
    const authKey = sanitizeUserInput(
      JSON.parse(localStorage.getItem('chatzSignIn')),
    );
    contactEmailId = sanitizeUserInput(contactEmailId);
    contactId = sanitizeUserInput(contactId);

    if (!authKey || !contactEmailId || !contactId) {
      throw Error('Invalid inputs');
    }

    const res = await axios.post(
      `${BACKEND_HOST_URL}/chats/create`,
      { contactEmailId, contactId },
      {
        headers: { authKey },
      },
    );
    // Adding the new chat at the beginning of the state.user.chats array
    state.user.chats.unshift(res.data);
    return res.data;
  } catch (err) {
    throw err;
  }
}

// function to create new group

export async function createNewGroup(groupName) {
  // Input validation
  try {
    if (!groupName) throw new Error('Group Name cannot be empty');
    const sanitizedGroupName = sanitizeChatMessage(groupName);
    if (!sanitizedGroupName) throw new Error('Invalid group name');
    // Create new group
    const response = await axios.post(`${BACKEND_HOST_URL}/groups/create`, {
      groupName: sanitizedGroupName,
    });
    // Adding the new group in current user state
    state.user.chats.unshift(response.data);
    state.user.groups.unshift(response.data);
    return true;
  } catch (err) {
    throw err;
  }
}

// function to add group memeber
export async function addGroupMember(contactEmailId) {
  try {
    const authKey = sanitizeUserInput(
      JSON.parse(localStorage.getItem('chatzSignIn')),
    );
    contactEmailId = sanitizeUserInput(contactEmailId);

    if (!authKey || !contactEmailId) {
      throw Error('Invalid inputs');
    }

    const res = await axios.post(`${BACKEND_HOST_URL}/groups/member`, {
      contactEmailId,
      groupId: state.chatId,
    });
    return res;
  } catch (err) {
    throw err;
  }
}
