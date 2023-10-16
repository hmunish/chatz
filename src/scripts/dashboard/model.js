import axios from "axios";
import { sanitizeUserInput } from "../common/utility";
import { BACKEND_HOST_URL } from "../common/config";
import { io } from "socket.io-client";

export const socket = io(`${BACKEND_HOST_URL}`);

export const state = {
  user: {},
  chatId: null,
};

export const setChatId = (chatId) => {
  state.chatId = chatId;
};

export const getCurrentChats = () => {
  return state.user.chats.filter((el) => {
    return el._id === state.chatId;
  });
};

export const insertNewMessage = (chatId, newMessage) => {
  for (let i = 0; i < state.user.chats.length; i++) {
    if (state.user.chats[i]._id === chatId) {
      state.user.chats[i].messages.push(newMessage);
      break;
    }
  }
};

axios.defaults.headers.common["authKey"] = sanitizeUserInput(
  JSON.parse(localStorage.getItem("chatzSignIn"))
);

export async function sendMessage(message) {
  try {
    const currentChatId = sanitizeUserInput(state.chatId);
    const messageCopy = sanitizeUserInput(message);

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

export async function isSignedIn() {
  try {
    const authKey = sanitizeUserInput(
      JSON.parse(localStorage.getItem("chatzSignIn"))
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
    return res.data;
  } catch (err) {
    throw err;
  }
}

export async function addMessage(chatId, message) {
  try {
    const authKey = sanitizeUserInput(
      JSON.parse(localStorage.getItem("chatzSignIn"))
    );
    chatId = sanitizeUserInput(chatId);
    message = sanitizeUserInput(message);

    if (!authKey || !chatId || !message) {
      throw Error("Invalid inputs");
    }

    const res = await axios.post(
      `${BACKEND_HOST_URL}/chats/message`,
      { chatId, message },
      {
        headers: { authKey },
      }
    );
    console.log(res);
    return res.data;
  } catch (err) {
    throw err;
  }
}
