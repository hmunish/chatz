import axios from "axios";
import { sanitizeUserInput } from "../common/utility";
import { BACKEND_HOST_URL } from "../common/config";

export const state = {
  user: {},
};

export async function isSignedIn() {
  try {
    const authKey = sanitizeUserInput(
      JSON.parse(localStorage.getItem("chatzSignIn"))
    );
    if (!authKey) return false;
    const response = await axios.get(`${BACKEND_HOST_URL}/users/isSignedIn`, {
      headers: { authKey: JSON.parse(localStorage.getItem("chatzSignIn")) },
    });
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

    if (!authKey || !contactEmailId || !contactId)
      throw Error("Invalid inputs");

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
