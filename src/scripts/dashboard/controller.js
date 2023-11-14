import View from './view.js';
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
  createNewGroup,
  addGroupMember,
  insertMemberDetailsToGroup,
  searchContacts,
} from './model.js';

// Socket event listeners & handlers
socket.on('connect', () => {
  // Emitting event to join group(emailId)
  socket.emit('join-group', state.user.email);

  // Listening for new message socket event & calling function be executed on new message
  socket.on('message', (chatId, message) => {
    handleRecievedMessage(chatId, message);
  });

  // Listening for new chat socket event & adding the new chat in the current state chats array
  socket.on('newChat', (newChat) => {
    state.user.chats.unshift(newChat);
  });

  // Listening for new group socket event &
  // adding the new group in the current state chats & groups array
  socket.on('newGroupAdded', (group) => {
    state.user.chats.unshift(group);
    state.user.groups.unshift(group);
  });

  // Listening for new group member added socket event &
  // adding the new memeber in state group members array
  socket.on('groupMemberAdded', (groupId, contactDetails) => {
    insertMemberDetailsToGroup(groupId, contactDetails);
    View.renderGroupMembers(getCurrentChats()[0].members);
  });
});

// function to handle new recieved messages
function handleRecievedMessage(chatId, newMessage) {
  insertNewMessage(chatId, newMessage);
  sortChatNewest();
  View.renderChatContacts(state.user);
  // Checking if new message is recieved for the currently displayed chat
  if (chatId === state.chatId) {
    View.renderChatMessages(getCurrentChats(), state.user.email, true);
  } else {
    View.addNewMessageHighlight(chatId);
  }
}

// function to handle sending new message
async function handleSendMessage(form) {
  try {
    if (!state.chatId) throw Error('Please select a contact to send message');
    View.startLoadingSpinner();
    const isNewMessage = await sendMessage(form);
    if (isNewMessage) {
      View.renderChatMessages(getCurrentChats(), state.user.email, true);
      sortChatNewest();
      View.renderChatContacts(state.user);
      View.stopLoadingSpinner();
    }
  } catch (err) {
    View.addAppResponse(err.message, 'clr-red');
  }
}

// function to verify is user is signed in
async function handleIsSignedIn() {
  try {
    View.startLoadingSpinner();
    const authorized = await isSignedIn();
    if (!authorized) throw new Error('User not authorized');
    socket.emit('join-group', state.user.email);
    View.setUserEmailAsTitle(state.user.email);
    sortChatNewest();
    View.renderChatContacts(state.user);
    View.stopLoadingSpinner();
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
    View.addAppResponse(err.message, 'clr-red');
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
    View.addAppResponse(errorMessage, 'clr-red');
  }
}

// function to load all chat messages
async function handleLoadChat(chatId) {
  if (chatId === state.chatId) return;
  setChatId(chatId);
  View.renderChatMessages(getCurrentChats(), state.user.email);
}

// function to handle new group creation
async function handleCreateGroup(groupName) {
  try {
    View.startLoadingSpinner();
    const response = await createNewGroup(groupName);
    if (response) {
      sortChatNewest();
      View.renderChatContacts(state.user);
      View.toggleCreateGroupModal();
      View.stopLoadingSpinner();
    }
  } catch (err) {
    View.addAppResponse(err?.response?.data.message || err.message, 'clr-red');
  }
}

async function handleAddGroupMembersSearch(searchQuery) {
  try {
    if (!searchQuery) return View.renderAddGroupMemberUserSearch([]);
    const results = await searchUsers(searchQuery, state.chatId);
    View.renderAddGroupMemberUserSearch(results);
  } catch (err) {
    View.addAppResponse(err.message, 'clr-red');
  }
}

// function to handle new chat creation
async function handleAddGroupMember(contactEmailId) {
  try {
    View.startLoadingSpinner();
    await addGroupMember(contactEmailId);
    View.addAppResponse('Member added to the group');
  } catch (err) {
    const errorMessage = err.response?.data.message || err.message;
    View.addAppResponse(errorMessage, 'clr-red');
  }
}

// function to load contact details modal
function handleLoadContactDetailsModal() {
  View.toggleContactDetailsModal();
  View.renderGroupMembers(getCurrentChats()[0]?.members);
}

// function to handle contacts search
function handleSearchContact(query) {
  state.user.isContactSearch = false;
  if (!query) {
    return View.renderChatContacts(state.user);
  }
  const chats = searchContacts(query);
  const stateCopy = JSON.parse(JSON.stringify(state));
  stateCopy.user.chats = chats;
  View.renderChatContacts(stateCopy.user);
  state.user.isContactSearch = true;
}

// Initial function to be called on app start
async function init() {
  try {
    await handleIsSignedIn();
    View.addHandlerUserSearch(handleUserSearch);
    View.addHandlerStartChat(handleCreateChat);
    View.addHanlderLoadChat(handleLoadChat);
    View.addHandlerSearchContacts(handleSearchContact);
    View.addHandlerFormSendMessage(handleSendMessage);
    View.addHandlerCreateGroup(handleCreateGroup);
    View.addHandlerAddGroupMembersUserSearch(handleAddGroupMembersSearch);
    View.addHandlerAddGroupMember(handleAddGroupMember);
    View.addHandlerContactDetailModalToggle(handleLoadContactDetailsModal);
  } catch (err) {
    const errorMessage = err.response?.data.message || err.message;
    View.addAppResponse(errorMessage, 'clr-red');
  }
}

// Calling initial function on the app start
init();
