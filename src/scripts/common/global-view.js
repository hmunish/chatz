import { qrySlct } from "./utility";

export default class GlobalView {
  loadingSpinner = qrySlct("#loading-spinner");

  appResponseBox = qrySlct("#app-response-box");

  appResponseMessage = qrySlct("#app-response-message");

  addAppResponse(message = "", statusClass = "clr-green") {
    this.appResponseBox.classList.remove("dp-no");
    this.appResponseMessage.classList = statusClass;
    this.appResponseMessage.innerHTML += `<br>${message}`;
    this.stopLoadingSpinner();
    setTimeout(this.removeAppResponse.bind(this), 3000);
  }

  removeAppResponse() {
    this.appResponseMessage.textContent = "";
    this.appResponseBox.classList.add("dp-no");
  }

  startLoadingSpinner() {
    this.loadingSpinner.classList.remove("dp-no");
  }

  stopLoadingSpinner() {
    this.loadingSpinner.classList.add("dp-no");
  }

  renderNoResultsFound(element) {
    element.innerHTML = "<p style='padding: 15px'>No results found</p>";
  }
}
