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

  addHandlerUserSearch(handler) {
    this.searchUserInput.addEventListener("keyup", (e) => {
      handler(e.target.value);
    });
  }

  renderStartChatUserSearch(arr) {
    if (arr.length === 0)
      return this.renderNoResultsFound(this.startChatUserSearchResults);
    let markup = ``;
    arr.forEach((i) => {
      markup += `
      <div>
      <img src="#" alt="Contact" />
      <div class="user-search-results-details-box" data-id="${i._id}">
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
          handler(e.target.parentElement.dataset.id);
        }
      },
      true
    );
  }

  renderNewContact(data) {
    const markup = `
    <div class="contact-details" data-id="${data._id}">
    <img src="/contact-1.614cf4ca.png" alt="">
    <div class="chat-details">
      <h2>${data.users[0].email}</h2>
      <p>Travis Barker is a very nice &amp; humble man</p>
    </div>
    <div class="message-details">
      <p class="message-time">16:45</p>
      <p class="message-status">✓</p>
    </div>
  </div>
    `;
    this.contactList.insertAdjacentHTML("afterbegin", markup);
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
