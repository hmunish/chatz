import validator from "validator";
import DOMPurify from "dompurify";

const loadingSpinner = qrySlct("#loading-spinner");
const appResponseBox = qrySlct("#app-response-box");
const appResponseMessage = qrySlct("#app-response-message");
const registrationSection = qrySlct("section.registration");
const title = qrySlct(".title");
const registrationForm = qrySlct("#registration-form");
const formSwitchBtn = qrySlct("button#form-switch");
const apiSignUpWrapper = qrySlct(".api-signup-wrapper");
const formContactSection = qrySlct(".form-sections.form-contact");
const phoneInput = qrySlct("#phone");

let registrationFormStatus = "signin";

/// //// EVENT LISTENERS STARTS ///////

formSwitchBtn.addEventListener("click", switchForm);

registrationForm.addEventListener("submit", handleFormSubmit);

/// //// EVENT LISTENERS ENDS ///////

/// //// FUNCTIONS STARTS HERE ///////

function handleFormSubmit(e) {
  e.preventDefault();
  const formDetails = new FormData(e.target);
  const validInputs = isValidInputs(formDetails);
  if (!validInputs) return;
  if (validInputs.length === 3) {
    startLoadingSpinner();
  }
}

function isValidInputs(formDetails) {
  const email = sanitizeUserInput(formDetails.get("email"), "Invalid Email Id"),
    password = sanitizeUserInput(
      formDetails.get("password"),
      "Invalid Password"
    );
  phone = sanitizeUserInput(
    formDetails.get("phone") || "0",
    "Invalid Phone Number"
  );

  if (!email || !password || !phone) return;

  if (!validator.isEmail(email))
    return addAppResponse("Invalid Email Id", "clr-red");
  if (!validator.isStrongPassword(password))
    return addAppResponse(
      "Please enter strong password<br>Minimum Length: 8<br>One Lower Case<br>One Upper Case<br>One Special Symbol<br>",
      "clr-red"
    );
  if (registrationFormStatus === "signup" && !validator.isMobilePhone(phone))
    return addAppResponse("Invalid Phone Number", "clr-red");

  return [email, password, phone];
}

function addAppResponse(message = "", statusClass = "clr-green") {
  appResponseBox.classList.remove("dp-no");
  appResponseMessage.classList = statusClass;
  appResponseMessage.innerHTML += `<br>${message}`;
  stopLoadingSpinner();
  setTimeout(removeAppResponse, 3000);
}

function removeAppResponse() {
  appResponseMessage.textContent = "";
  appResponseBox.classList.add("dp-no");
}

function startLoadingSpinner() {
  loadingSpinner.classList.remove("dp-no");
}

function stopLoadingSpinner() {
  loadingSpinner.classList.add("dp-no");
}

function switchForm() {
  if (registrationFormStatus === "signin") {
    title.textContent = "Sign Up";
    formSwitchBtn.innerHTML =
      "Have an Account?<br><span class='clr-green'>Sign In</span>";
    registrationFormStatus = "signup";
  } else if (registrationFormStatus === "signup") {
    title.textContent = "Sign In";
    formSwitchBtn.innerHTML =
      "No Account?<br><span class='clr-green'>Sign Up</span>";
    registrationFormStatus = "signin";
  }
  apiSignUpWrapper.classList.toggle("dp-no");
  formContactSection.classList.toggle("dp-no");
  phoneInput.toggleAttribute("disabled");
}

/// //// UTILITY FUNCTIONS STARTS ///////

// Function to sanitize user input using Validator library
function sanitizeUserInput(input, errMsg) {
  let sanitizedInput = DOMPurify.sanitize(input);
  sanitizedInput = validator.escape(input);
  sanitizedInput = sanitizedInput.replace(/ /g, "");
  if (input === sanitizedInput) return sanitizedInput;
  addAppResponse(errMsg, "clr-red");
  return false;
}

// Function to return element using document.querySelector method to avoid repeatation of code
function qrySlct(query) {
  return document.querySelector(query);
}

/// //// UTILITY FUNCTIONS ENDS ///////

/// //// FUNCTIONS ENDS HERE ///////
