class DashboardView {
  contactSection = document.querySelector("section.contacts");
  contactList = document.querySelector(".contacts-list");
  chatSection = document.querySelector("section.chats");
  backArrow = document.querySelector("img.back-arrow");

  constructor() {
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

  _addAllHandlers() {
    this._addHandlerSlideContactSection();
    this._addHandlerChatBackArrow();
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
}

const Dashboard = new DashboardView();
