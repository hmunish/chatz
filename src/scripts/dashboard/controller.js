import View from "./view.js";
import {
  socket,
  state,
  isSignedIn,
  searchUsers,
  createChat,
  setChatId,
  addMessage,
  getCurrentChats,
  sendMessage,
  insertNewMessage,
  sortChatNewest,
} from "./model.js";

socket.on("connect", () => {
  console.log("Socket Connected");
  socket.emit("join-group", state.user.email);

  socket.on("message", (chatId, message) => {
    handleRecievedMessage(chatId, message);
    console.log("message recieved by: ", message, " on chat id ", chatId);
  });

  socket.on("newChat", (newChat) => {
    console.log("New chat recieved");
    state.user.chats.unshift(newChat);
  });
});

function handleRecievedMessage(chatId, newMessage) {
  insertNewMessage(chatId, newMessage);

  sortChatNewest();
  View.renderChatContacts(state.user);
  // Checking if new message is recieved for the currently displayed chat
  if (chatId === state.chatId) {
    View.renderChatMessages(getCurrentChats(), state.user.email);
  } else {
    View.addNewMessageHighlight(chatId);
  }
}

async function handleSendMessage(message) {
  try {
    const isNewMessage = await sendMessage(message);
    if (isNewMessage) {
      View.renderChatMessages(getCurrentChats(), state.user.email);
      sortChatNewest();
      View.renderChatContacts(state.user);
    }
  } catch (err) {
    View.addAppResponse(err.message, "clr-red");
  }
}

async function handleIsSignedIn() {
  try {
    const authorized = await isSignedIn();
    if (!authorized) throw new Error("User not authorized");
    socket.emit("join-group", state.user.email);
    View.setUserEmailAsTitle(state.user.email);
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
    View.startLoadingSpinner();
    View.toggleStartChatBox();
    const results = await createChat(contactEmailId, contactId);
    View.renderNewContact(results, state.user.email);
    View.stopLoadingSpinner();
  } catch (err) {
    const errorMessage = err.response?.data.message || err.message;
    View.addAppResponse(errorMessage, "clr-red");
  }
}

async function handleLoadChat(chatId) {
  if (chatId === state.chatId) return;
  setChatId(chatId);
  View.renderChatMessages(getCurrentChats(), state.user.email);
}

async function init() {
  try {
    await handleIsSignedIn();
    View.addHandlerUserSearch(handleUserSearch);
    View.addHandlerStartChat(handleCreateChat);
    View.addHanlderLoadChat(handleLoadChat);
    View.addHandlerFormSendMessage(handleSendMessage);

    console.log(state);

    // addMessage("652c34979a86aa82a9472f9f", "tested");
  } catch (err) {
    const errorMessage = err.response?.data.message || err.message;
    View.addAppResponse(errorMessage, "clr-red");
  }
}

init();
