import axios from "axios";
import { io } from "socket.io-client";
import { sanitizeChatMessage, sanitizeUserInput } from "../common/utility";
import { BACKEND_HOST_URL } from "../common/config";

export const socket = io(`${BACKEND_HOST_URL}`);

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
export const getCurrentChats = () =>
  state.user.chats.filter((el) => el._id === state.chatId);

// function to sort chats by in ascending by dates
export const sortChatNewest = () => {
  state.user.chats.sort((chat1, chat2) => {
    let time1 = new Date(
      chat1.messages.at(-1)?.messageSentAt || chat1.createdAt
    ).getTime();
    let time2 = new Date(
      chat2.messages.at(-1)?.messageSentAt || chat2.createdAt
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

// setting global axios headers authKey for authorizing user by json web token
axios.defaults.headers.common.authKey = sanitizeUserInput(
  JSON.parse(localStorage.getItem("chatzSignIn")) || " "
);

// function to verify if user is signed in
export async function isSignedIn() {
  try {
    const authKey = sanitizeUserInput(
      JSON.parse(localStorage.getItem("chatzSignIn")) || " "
    );
    if (!authKey) return false;
    const response = await axios.get(`${BACKEND_HOST_URL}/users/isSignedIn`);
    if (response.status === 200) {
      state.user = response.data.user;
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

// function to send message
export async function sendMessage(message) {
  try {
    const currentChatId = sanitizeUserInput(state.chatId);
    const messageCopy = sanitizeChatMessage(message);

    if (!currentChatId || !messageCopy) throw Error("Invalid inputs");

    const response = await axios.post(`${BACKEND_HOST_URL}/chats/message`, {
      chatId: currentChatId,
      message: messageCopy,
    });

    if (response.status !== 200) throw new Error("Error sending message");

    const { newMessage } = response.data;

    // Adding new message in the chat object
    insertNewMessage(currentChatId, newMessage);

    return true;
  } catch (err) {
    throw err;
  }
}

// function to search all users
export async function searchUsers(searchQuery) {
  try {
    const authKey = sanitizeUserInput(
      JSON.parse(localStorage.getItem("chatzSignIn"))
    );
    searchQuery = sanitizeUserInput(searchQuery);

    if (!authKey || !searchQuery) throw Error("Invalid inputs");
    const response = await axios.post(
      `${BACKEND_HOST_URL}/users/search`,
      { searchQuery },
      {
        headers: { authKey: JSON.parse(localStorage.getItem("chatzSignIn")) },
      }
    );
    return response.data;
  } catch (err) {
    throw err;
  }
}

// function to create a new chat
export async function createChat(contactEmailId, contactId) {
  try {
    const authKey = sanitizeUserInput(
      JSON.parse(localStorage.getItem("chatzSignIn"))
    );
    contactEmailId = sanitizeUserInput(contactEmailId);
    contactId = sanitizeUserInput(contactId);

    if (!authKey || !contactEmailId || !contactId) {
      throw Error("Invalid inputs");
    }

    const res = await axios.post(
      `${BACKEND_HOST_URL}/chats/create`,
      { contactEmailId, contactId },
      {
        headers: { authKey },
      }
    );
    // Adding the new chat at the beginning of the state.user.chats array
    state.user.chats.unshift(res.data);
    return res.data;
  } catch (err) {
    throw err;
  }
}

// duplicate function

// export async function addMessage(chatId, message) {
//   try {
//     const authKey = sanitizeUserInput(
//       JSON.parse(localStorage.getItem("chatzSignIn"))
//     );
//     chatId = sanitizeUserInput(chatId);
//     message = sanitizeUserInput(message);

//     if (!authKey || !chatId || !message) {
//       throw Error("Invalid inputs");
//     }

//     const res = await axios.post(
//       `${BACKEND_HOST_URL}/chats/message`,
//       { chatId, message },
//       {
//         headers: { authKey },
//       }
//     );
//     return res.data;
//   } catch (err) {
//     throw err;
//   }
// }
