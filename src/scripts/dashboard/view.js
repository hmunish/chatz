import GlobalView from "../common/global-view";

class DashboardView extends GlobalView {
  contactSection = document.querySelector("section.contacts");

  contactList = document.querySelector(".contacts-list");

  chatSection = document.querySelector("section.chats");

  backArrow = document.querySelector("img.back-arrow");

  startChatBtn = document.querySelector("button.start-chat");

  startChat = document.querySelector("div.start-chat");

  startChatCloseIcon = document.querySelector("#close-select-contact");

  searchUserInput = document.querySelector("#start-chat-search-contacts");

  startChatUserSearchResults = document.querySelector(
    "div.start-chat-search-results"
  );

  chatBox = document.querySelector("div.chat-box");

  sendMessageForm = document.querySelector("form.send-message");

  constructor() {
    super();
    this._addAllHandlers();
  }

  _addHandlerSlideContactSection() {
    this.contactList.addEventListener("click", (e) => {
      if (!e.target.parentElement.classList.contains("chat-details")) return;
      this.renderChat();
    });
  }

  _addHandlerChatBackArrow() {
    this.backArrow.addEventListener("click", this.renderChat.bind(this));
  }

  _addHandlersStartChatToggle() {
    this.startChatBtn.addEventListener(
      "click",
      this.toggleStartChatBox.bind(this)
    );

    this.startChatCloseIcon.addEventListener(
      "click",
      this.toggleStartChatBox.bind(this)
    );
  }

  _addAllHandlers() {
    this._addHandlerSlideContactSection();
    this._addHandlerChatBackArrow();
    this._addHandlersStartChatToggle();
    this.addHandlerStartChat();
  }

  // Method to add handler to send message form submit event
  addHandlerFormSendMessage(handler) {
    this.sendMessageForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handler(e.target.message.value);
      e.target.reset();
    });
  }

  addHanlderLoadChat(handler) {
    this.contactList.addEventListener("click", (e) => {
      const chatId = e.target.closest(".contact-details")?.dataset.id;
      if (chatId) {
        handler(chatId);
      }
    });
  }

  addHandlerUserSearch(handler) {
    this.searchUserInput.addEventListener("keyup", (e) => {
      handler(e.target.value);
    });
  }

  renderChatMessages(chats, myEmailId) {
    let markup = ``;

    chats[0].messages.forEach((msg) => {
      if (msg.userEmail === myEmailId) {
        markup += `
      <div class="message-holder own-message">
        <p>${msg.message}</p>
        <p class="message-time">
        ${msg.messageSentAt} <span class="message-status">&check;</span>
        </p>
      </div>
        `;
      } else {
        markup += `
        <div class="contact-message-wrapper">
        <img src="./assets/contact-1.png" alt="" />
        <div class="message-holder contact-message">
          <p>${msg.message}</p>
          <p class="message-time">
            <span class="message-status"></span> ${msg.messageSentAt.slice(
              11,
              16
            )}
          </p>
        </div>
      </div>
        `;
      }
    });

    this.chatBox.innerHTML = markup;
    this.chatBox.scrollTop = this.chatBox.scrollHeight;
  }

  renderStartChatUserSearch(arr) {
    if (arr.length === 0) {
      return this.renderNoResultsFound(this.startChatUserSearchResults);
    }
    let markup = "";
    arr.forEach((i) => {
      markup += `
      <div>
      <img src="#" alt="Contact" />
      <div class="user-search-results-details-box" data-emailid="${i.email}" data-id="${i._id}">
        <h2>${i.email}</h2>
        <p>Busy</p>
      </div>
    </div>
      `;
      this.startChatUserSearchResults.innerHTML = markup;
    });
  }

  addHandlerStartChat(handler) {
    this.startChatUserSearchResults.addEventListener(
      "click",
      (e) => {
        if (
          e.target.parentElement.classList.contains(
            "user-search-results-details-box"
          )
        ) {
          const { emailid, id } = e.target.parentElement.dataset;
          handler(emailid, id);
        }
      },
      true
    );
  }

  renderNewContact(data, emailId) {
    const markup = `-
    <div class="contact-details" data-id="${data._id}">
    <img src="/contact-1.614cf4ca.png" alt="">
    <div class="chat-details">
      <h2>${data.users.filter((email) => email !== emailId)}</h2>
      <p></p>
    </div>
    <div class="message-details">
      <p class="message-time">16:45</p>
      <p class="message-status">✓</p>
    </div>
  </div>
    `;
    this.contactList.insertAdjacentHTML("afterbegin", markup);
  }

  renderChatContacts(user) {
    let markup = "";

    user.chats.forEach((chat) => {
      console.log(chat);
      const lastMessage =
        chat.messages[chat.messages.length > 0 ? chat.messages.length - 1 : 0];
      markup += `
      <div class="contact-details" data-id="${chat._id}">
    <img src="/contact-1.614cf4ca.png" alt="">
    <div class="chat-details">
      <h2>${chat.users.filter((email) => email !== user.email)}</h2>
      <p>${lastMessage?.message || ""}</p>
    </div>
    <div class="message-details">
      <p class="message-time">${
        lastMessage?.messageSentAt.slice(11, 16) || chat.createdAt.slice(11, 16)
      }</p>
      <div class="new-message-alert dp-no"></div>
    </div>
  </div>
      `;
    });

    this.contactList.innerHTML = markup;
  }

  addNewMessageHighlight(chatId) {
    this.contactList
      .querySelector(`[data-id="${chatId}"]`)
      .querySelector("div.new-message-alert")
      .classList.remove("dp-no");
  }

  removeNewMessageHighlight(chatId) {
    this.contactList
      .querySelector(`[data-id="${chatId}"]`)
      .querySelector("div.new-message-alert")
      .classList.add("dp-no");
  }

  toggleStartChatBox() {
    this.startChat.classList.toggle("dp-no");
  }

  getDashboardWidth() {
    return document.querySelector("#dashboard").clientWidth;
  }

  slideContactSection() {
    const transformProperty = this.contactSection.style.transform;
    if (transformProperty === "translateX(-150%)") {
      this.contactSection.style.transform = "translateX(0)";
    } else {
      this.contactSection.style.transform = "translateX(-150%)";
    }
  }

  renderChat() {
    if (this.getDashboardWidth() < 1000) {
      this.slideContactSection();
    }
  }

  redirectToLogin() {
    window.location.href = "/registration.html";
  }
}

export default new DashboardView();
