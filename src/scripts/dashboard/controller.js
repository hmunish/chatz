import View from "./view.js";
import { socket, state, isSignedIn, searchUsers, createChat } from "./model.js";

socket.on("connect", () => {
  console.log("Socket Connected");
  socket.emit("join-group", state.user.email);

  socket.on("group-joined", () => {
    console.log("Group Joined");
  });

  socket.on("message", () => {
    console.log("message recieved");
  });
});

async function handleIsSignedIn() {
  try {
    const authorized = await isSignedIn();
    if (!authorized) throw new Error("User not authorized");
    socket.emit("join-group", state.user.email);
    View.renderChatContacts(state.user);
  } catch (err) {
    View.redirectToLogin();
  }
}

async function handleUserSearch(searchQuery) {
  try {
    if (!searchQuery) return View.renderStartChatUserSearch([]);
    const results = await searchUsers(searchQuery);
    View.renderStartChatUserSearch(results);
  } catch (err) {
    View.addAppResponse(err.message, "clr-red");
  }
}

async function handleCreateChat(contactEmailId, contactId) {
  try {
    const results = await createChat(contactEmailId, contactId);
    View.renderNewContact(results, state.user.email);
  } catch (err) {
    const errorMessage = err.response?.data.message || err.message;
    View.addAppResponse(errorMessage, "clr-red");
  }
}

async function init() {
  try {
    await handleIsSignedIn();
    View.addHandlerUserSearch(handleUserSearch);
    View.addHandlerStartChat(handleCreateChat);
  } catch (err) {
    const errorMessage = err.response?.data.message || err.message;
    View.addAppResponse(errorMessage, "clr-red");
  }
}

init();
