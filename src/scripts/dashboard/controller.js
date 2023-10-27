import View from "./view.js";
import {
  socket,
  state,
  isSignedIn,
  searchUsers,
  createChat,
  setChatId,
  getCurrentChats,
  sendMessage,
  insertNewMessage,
  sortChatNewest,
} from "./model.js";

// Socket event listeners & handlers
socket.on("connect", () => {
  // Emitting event to join group(emailId)
  socket.emit("join-group", state.user.email);

  // Listening for new message socket event & calling function be executed on new message
  socket.on("message", (chatId, message) => {
    handleRecievedMessage(chatId, message);
  });

  // Listening for new chat socket event & adding the new chat in the current state chats array
  socket.on("newChat", (newChat) => {
    state.user.chats.unshift(newChat);
  });
});

// function to handle new recieved messages
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

// function to handle sending new message
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

// function to verify is user is signed in
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

// function to handle user search for new chat creation
async function handleUserSearch(searchQuery) {
  try {
    if (!searchQuery) return View.renderStartChatUserSearch([]);
    const results = await searchUsers(searchQuery);
    View.renderStartChatUserSearch(results);
  } catch (err) {
    View.addAppResponse(err.message, "clr-red");
  }
}

// function to handle new chat creation
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

// function to load all chat messages
async function handleLoadChat(chatId) {
  if (chatId === state.chatId) return;
  setChatId(chatId);
  View.renderChatMessages(getCurrentChats(), state.user.email);
}

// Initial function to be called on app start
async function init() {
  try {
    await handleIsSignedIn();
    View.addHandlerUserSearch(handleUserSearch);
    View.addHandlerStartChat(handleCreateChat);
    View.addHanlderLoadChat(handleLoadChat);
    View.addHandlerFormSendMessage(handleSendMessage);
  } catch (err) {
    const errorMessage = err.response?.data.message || err.message;
    View.addAppResponse(errorMessage, "clr-red");
  }
}

// Calling initial function on the app start
init();
