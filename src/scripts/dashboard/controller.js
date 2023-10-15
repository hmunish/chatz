import View from './view.js';
import {
  state, isSignedIn, searchUsers, createChat,
} from './model.js';

async function handleIsSignedIn() {
  try {
    const authorized = await isSignedIn();
    if (!authorized) throw new Error('User not authorized');
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
    View.addAppResponse(err.message, 'clr-red');
  }
}

async function handleCreateChat(contactEmailId, contactId) {
  try {
    const results = await createChat(contactEmailId, contactId);
    View.renderNewContact(results);
  } catch (err) {
    const errorMessage = err.response?.data.message || err.message;
    View.addAppResponse(errorMessage, 'clr-red');
  }
}

async function init() {
  try {
    await handleIsSignedIn();
    View.addHandlerUserSearch(handleUserSearch);
    View.addHandlerStartChat(handleCreateChat);
  } catch (err) {
    const errorMessage = err.response?.data.message || err.message;
    View.addAppResponse(errorMessage, 'clr-red');
  }
}

init();
