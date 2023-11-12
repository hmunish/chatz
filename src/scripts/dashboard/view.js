import contactImage from '../../assets/contact-1.png';
import downloadImage from '../../assets/download-icon.png';
import GlobalView from '../common/global-view';

class DashboardView extends GlobalView {
  userEmailTitle = document.querySelector('div.header > h1.title');

  sidebar = document.querySelector('section.sidebar');

  contactSection = document.querySelector('section.contacts');

  contactList = document.querySelector('.contacts-list');

  chatSection = document.querySelector('section.chats');

  chatContactDetailsBox = document.querySelector('.chat-contact-details');

  backArrow = document.querySelector('img.back-arrow');

  startChatBtn = document.querySelector('button.start-chat');

  startChat = document.querySelector('div.start-chat');

  startChatCloseIcon = document.querySelector('#close-select-contact');

  createGroupBtn = document.querySelector('button.create-group');

  createGroupModal = document.querySelector('div.create-group');

  createGroupCloseIcon = document.querySelector('#close-create-group');

  addGroupMemberCloseIcon = document.querySelector(
    '#close-add-group-members-modal',
  );

  createGroupForm = document.querySelector('form.create-group');

  searchUserInput = document.querySelector('#start-chat-search-contacts');

  startChatUserSearchResults = document.querySelector(
    'div.start-chat-search-results',
  );

  addGroupMemberBtn = document.querySelector('#add-group-member');

  addGroupMemberModal = document.querySelector('div.add-group-members');

  addGroupMembersSearchInput = document.querySelector(
    '#add-group-members-search-contacts',
  );

  addGroupMembersUserSearchResults = document.querySelector(
    '.add-group-members-search-results',
  );

  contactDetailIcon = document.querySelector('#details-contact');

  contactDetailModal = document.querySelector('div.contact-details-modal');

  contactDetailModalCloseIcon = document.querySelector(
    '#close-contact-details-modal',
  );

  groupMemberList = document.querySelector(
    'div.contact-details-modal-members-results',
  );

  chatBox = document.querySelector('div.chat-box');

  sendMessageForm = document.querySelector('form.send-message');

  messageInput = document.querySelector('input[name=message]');

  messageFileInput = document.querySelector('input.attach-file');

  attachFileBtn = document.querySelector('img.attach-file');

  signoutBtn = document.querySelector('button#signout');

  fileMessageFrame = document.querySelector('.fileMessageFrame');

  constructor() {
    super();
    this._addAllHandlers();
  }

  _addHandlerSlideContactSection() {
    this.contactList.addEventListener('click', (e) => {
      if (!e.target.parentElement.classList.contains('chat-details')) return;
      // Removing new message highlighter
      e.target.parentElement.nextElementSibling
        .querySelector('div.new-message-alert')
        .classList.add('dp-no');
      this.renderChat();
    });
  }

  _addHandlerChatBackArrow() {
    this.backArrow.addEventListener('click', this.renderChat.bind(this));
  }

  _addHandlersStartChatToggle() {
    this.startChatBtn.addEventListener(
      'click',
      this.toggleStartChatBox.bind(this),
    );

    this.startChatCloseIcon.addEventListener(
      'click',
      this.toggleStartChatBox.bind(this),
    );
  }

  _addHandlerCreateGroupToggle() {
    this.createGroupBtn.addEventListener(
      'click',
      this.toggleCreateGroupModal.bind(this),
    );
    this.createGroupCloseIcon.addEventListener(
      'click',
      this.toggleCreateGroupModal.bind(this),
    );
  }

  _addHandlerAddGroupMemberToggle() {
    this.addGroupMemberBtn.addEventListener('click', () => {
      this.toggleAddGroupMemberModal();
      this.toggleContactDetailsModal();
    });

    this.addGroupMemberCloseIcon.addEventListener('click', () => {
      this.toggleAddGroupMemberModal();
      this.toggleContactDetailsModal();
    });
  }

  _addHandlerCloseContactDetailModal() {
    this.contactDetailModalCloseIcon.addEventListener(
      'click',
      this.toggleContactDetailsModal.bind(this),
    );
  }

  _addHandlerSignout() {
    this.signoutBtn.addEventListener('click', this.signout.bind(this));
  }

  _addHandlerShowUploadFile() {
    this.attachFileBtn.addEventListener('click', () => {
      this.messageFileInput.click();
    });
  }

  _addHandlerOnFileUpload() {
    this.messageFileInput.addEventListener('change', (e) => {
      this.messageInput.value = `FILE:- ${e.target.value}`;
    });
  }

  _addAllHandlers() {
    this._addHandlerSlideContactSection();
    this._addHandlerChatBackArrow();
    this._addHandlersStartChatToggle();
    this._addHandlerCreateGroupToggle();
    this._addHandlerAddGroupMemberToggle();
    this._addHandlerCloseContactDetailModal();
    this._addHandlerSignout();
    this._addHandlerShowUploadFile();
    this._addHandlerOnFileUpload();
    this.addHandlerStartChat();
  }

  addHandlerCreateGroup(handler) {
    this.createGroupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handler(e.target.newGroupName.value);
    });
  }

  // Method to add handler to send message form submit event
  addHandlerFormSendMessage(handler) {
    this.sendMessageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handler(e.target);
      e.target.reset();
    });
  }

  addHanlderLoadChat(handler) {
    this.contactList.addEventListener('click', (e) => {
      const contactDetailsBox = e.target.closest('.contact-details');
      if (!contactDetailsBox) return;
      const chatId = contactDetailsBox.dataset.id;
      const contactEmail = contactDetailsBox.querySelector('h2').textContent;
      this.renderChatContactEmail(contactEmail);
      handler(chatId);
    });
  }

  addHandlerUserSearch(handler) {
    this.searchUserInput.addEventListener('keyup', (e) => {
      handler(e.target.value);
    });
  }

  addHandlerContactDetailModalToggle(handler) {
    this.contactDetailIcon.addEventListener('click', handler);
  }

  addHandlerAddGroupMembersUserSearch(handler) {
    this.addGroupMembersSearchInput.addEventListener('keyup', (e) => {
      handler(e.target.value);
    });
  }

  renderChatMessages(chats, myEmailId, isNewMessage = false) {
    let markup = '';
    const messages = isNewMessage
      ? chats[0].messages.slice(-1)
      : chats[0].messages;

    messages.forEach((msg) => {
      const time = new Date(msg.messageSentAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      const messageMarkup = !msg.isFile
        ? `<p>${msg.message}</p>`
        : `<iframe src='${msg.message}' id=${msg._id} scrolling="no" allowfullscreen="" frameborder="0" class='file-message'></iframe> <button class='downloadFileBtn' onclick = downloadUrl('${msg.message}')><img src='${downloadImage}'/></button>`;
      if (msg.userEmail === myEmailId) {
        markup += `
      <div class="message-holder own-message">
        ${messageMarkup}
        <p class="message-time">
        ${time} <span class="message-status">&check;</span>
        </p>
      </div>
        `;
      } else {
        markup += `
        <div class="contact-message-wrapper">
        <img src="${contactImage}" alt="" />
        <div class="message-holder contact-message">
          ${messageMarkup}
          <p class="message-time">
            <span class="message-status"></span> ${time}
          </p>
        </div>
      </div>
        `;
      }
    });

    if (isNewMessage) this.chatBox.insertAdjacentHTML('beforeend', markup);
    else this.chatBox.innerHTML = markup;
    this.chatBox.scrollTop = this.chatBox.scrollHeight;
  }

  renderStartChatUserSearch(arr) {
    if (arr.length === 0) {
      return this.renderNoResultsFound(this.startChatUserSearchResults);
    }
    let markup = '';
    arr.forEach((i) => {
      markup += `
      <div>
      <img src="${contactImage}" alt="Contact" />
      <div class="user-search-results-details-box" data-emailid="${i.email}" data-id="${i._id}">
        <h2>${i.email}</h2>
        <p></p>
      </div>
    </div>
      `;
      this.startChatUserSearchResults.innerHTML = markup;
    });
  }

  renderAddGroupMemberUserSearch(arr) {
    if (arr.length === 0) {
      return this.renderNoResultsFound(this.addGroupMembersUserSearchResults);
    }
    let markup = '';
    arr.forEach((i) => {
      markup += `
      <div>
      <img src="${contactImage}" alt="Contact" />
      <div class="user-search-results-details-box" data-emailid="${i.email}" data-id="${i._id}">
        <h2>${i.email}</h2>
        <p></p>
      </div>
    </div>
      `;
      this.addGroupMembersUserSearchResults.innerHTML = markup;
    });
  }

  addHandlerStartChat(handler) {
    this.startChatUserSearchResults.addEventListener(
      'click',
      (e) => {
        if (
          e.target.parentElement.classList.contains(
            'user-search-results-details-box',
          )
        ) {
          const { emailid, id } = e.target.parentElement.dataset;
          handler(emailid, id);
        }
      },
      true,
    );
  }

  addHandlerAddGroupMember(handler) {
    this.addGroupMembersUserSearchResults.addEventListener(
      'click',
      (e) => {
        if (
          e.target.parentElement.classList.contains(
            'user-search-results-details-box',
          )
        ) {
          const { emailid, id } = e.target.parentElement.dataset;
          handler(emailid, id);
        }
      },
      true,
    );
  }

  renderNewContact(data, emailId) {
    const time = new Date(data.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const markup = `
    <div class="contact-details" data-id="${data._id}">
    <img src="${contactImage}" alt="">
    <div class="chat-details">
      <h2>${data.users.filter((email) => email !== emailId)}</h2>
      <p></p>
    </div>
    <div class="message-details">
    <p class="message-time">${time}</p>
    <p class="message-status"></p>
    <div class="new-message-alert dp-no"></div>
    </div>
  </div>
    `;
    this.contactList.insertAdjacentHTML('afterbegin', markup);
  }

  renderChatContacts(user) {
    let markup = '';

    user.chats.forEach((chat) => {
      const lastMessage = chat.messages[chat.messages.length > 0 ? chat.messages.length - 1 : 0];
      const today = new Date(
        new Date().toLocaleDateString('en-US', {
          timeZone: Date.getTimezoneOffset,
        }),
      );
      let time = lastMessage
        ? new Date(lastMessage.messageSentAt)
        : new Date(chat.createdAt);

      // Converting message date to time format if it is sent today or date format
      time = time < today
        ? time.toLocaleDateString('en-US', {
          timeZone: Date.getTimezoneOffset,
        })
        : time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      markup += `
      <div class="contact-details" data-id="${chat._id}">
    <img src="${contactImage}" alt="">
    <div class="chat-details">
      <h2>${
  chat.name || chat.users.filter((email) => email !== user.email)
}</h2>
      <p>${lastMessage?.message || ''}</p>
    </div>
    <div class="message-details">
      <p class="message-time">${time}</p>
      <div class="new-message-alert dp-no"></div>
    </div>
  </div>
      `;
    });

    this.contactList.innerHTML = markup;
  }

  renderChatContactEmail(email) {
    this.chatContactDetailsBox.innerHTML = `<h2>${email}</h2>`;
  }

  setUserEmailAsTitle(email) {
    this.userEmailTitle.innerHTML = `${email}`;
  }

  addNewMessageHighlight(chatId) {
    this.contactList
      .querySelector(`[data-id="${chatId}"]`)
      .querySelector('div.new-message-alert')
      .classList.remove('dp-no');
  }

  removeNewMessageHighlight(chatId) {
    this.contactList
      .querySelector(`[data-id="${chatId}"]`)
      .querySelector('div.new-message-alert')
      .classList.add('dp-no');
  }

  renderGroupMembers(members) {
    let markup = '';
    if (!members) {
      this.hideAddMemberButton();
      markup = '<p style="padding: 15px">No Details</p>';
      this.groupMemberList.innerHTML = markup;
      return;
    }
    members.forEach((member) => {
      const isAdmin = member.isAdmin
        ? '<p class="admin-highlight">Admin</p>'
        : '';
      markup += `
        <div ${member._id}>
        <img src="${contactImage}" alt="Contact" />
        <div>
          <h2>${member.email}</h2>
        </div>
        ${isAdmin}
      </div>
        `;
    });

    this.groupMemberList.innerHTML = markup;
    this.showAddMemberButton();
  }

  hideAddMemberButton() {
    this.addGroupMemberBtn.classList.add('dp-no');
  }

  showAddMemberButton() {
    this.addGroupMemberBtn.classList.remove('dp-no');
  }

  toggleCreateGroupModal() {
    this.createGroupModal.classList.toggle('dp-no');
  }

  toggleStartChatBox() {
    this.startChat.classList.toggle('dp-no');
  }

  toggleContactDetailsModal() {
    return this.contactDetailModal.classList.toggle('dp-no');
  }

  toggleAddGroupMemberModal() {
    this.addGroupMemberModal.classList.toggle('dp-no');
  }

  getDashboardWidth() {
    return document.querySelector('#dashboard').clientWidth;
  }

  toggleSidebar() {
    this.sidebar.classList.toggle('dp-no');
  }

  slideContactSection() {
    const transformProperty = this.contactSection.style.transform;
    if (transformProperty === 'translateX(-150%)') {
      this.contactSection.style.transform = 'translateX(0)';
    } else {
      this.contactSection.style.transform = 'translateX(-150%)';
    }
  }

  renderChat() {
    if (this.getDashboardWidth() < 1000) {
      this.slideContactSection();
      this.toggleSidebar();
    }
  }

  signout() {
    localStorage.removeItem('chatzSignIn');
    this.redirectToLogin();
  }

  redirectToLogin() {
    window.location.href = '/registration.html';
  }
}

export default new DashboardView();
