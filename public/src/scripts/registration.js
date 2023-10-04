import validator from "validator";
import DOMPurify from "dompurify";
import axios from "axios";
import { BACKEND_HOST_URL } from "./config";

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

document.addEventListener("DOMContentLoaded", async () => {
  await isSignedIn();
  formSwitchBtn.addEventListener("click", switchForm);
  registrationForm.addEventListener("submit", handleFormSubmit);
});

/// //// EVENT LISTENERS ENDS ///////

/// //// FUNCTIONS STARTS HERE ///////

async function isSignedIn() {
  try {
    const response = await axios.get(`${BACKEND_HOST_URL}/users/isSignedIn`, {
      headers: { authKey: JSON.parse(localStorage.getItem("chatzSignIn")) },
    });

    if (response.status === 200) {
      addAppResponse("Already signed in");
      window.location.href = "/chats.html";
    }
  } catch (err) {
    // Error can be avoided here as application requirement
    return err;
  }
}

async function handleFormSubmit(e) {
  try {
    e.preventDefault();
    const formDetails = new FormData(e.target);
    // Validating user inputs for security & better user interface
    // Inputs will be validated on server-side as well
    const validInputs = isValidInputs(formDetails);
    if (!validInputs) return;

    if (validInputs.length === 3) {
      // should return array of all 3 user inputs if every user input is fine or else undefined

      const userData = {
        email: validInputs[0],
        password: validInputs[1],
        phone: validInputs[2],
      };

      // If user submitted sign-up form

      if (registrationFormStatus === "signup") {
        await signUp(userData);
      }

      // Else user submitted sign-in form
      else {
        await signIn(userData);
      }
    }
  } catch (err) {
    addAppResponse(err.message, "clr-red");
  }
}

async function signUp(userData) {
  try {
    startLoadingSpinner();
    const response = await axios.post(
      `${BACKEND_HOST_URL}/users/signup`,
      userData
    );
    if (response.status !== 201) throw new Error(response.data.message);
    addAppResponse(response.data.message);
    await signIn(userData);
    // If new user is created login the user
  } catch (err) {
    const errorMessage = err.response?.data.message || err.message;
    addAppResponse(errorMessage, "clr-red");
    throw err;
  }
}

async function signIn(userData) {
  try {
    startLoadingSpinner();
    const response = await axios.post(
      `${BACKEND_HOST_URL}/users/signin`,
      userData
    );
    if (response.status !== 200) throw new Error(response.data.message);
    addAppResponse(response.data.message);
    addAppResponse("Redirecting to dashboard");
    startLoadingSpinner();

    // Setting authentication token for current user
    localStorage.setItem("chatzSignIn", JSON.stringify(response.data.authKey));

    // Redirecting user to dashboard page
    window.location.href = "/chats.html";
  } catch (err) {
    const errorMessage = err.response?.data.message || err.message;
    addAppResponse(errorMessage, "clr-red");
    throw err;
  }
}

function isValidInputs(formDetails) {
  const email = sanitizeUserInput(formDetails.get("email"), "Invalid Email Id"),
    password = sanitizeUserInput(
      formDetails.get("password"),
      "Invalid Password"
    ),
    phone = sanitizeUserInput(
      formDetails.get("phone") || "0",
      "Invalid Phone Number"
    );
  if (!email || !password || !phone) return;
  if (!validator.isEmail(email))
    return addAppResponse("Invalid Email Id", "clr-red");
  if (
    !validator.isStrongPassword(password) &&
    registrationFormStatus === "signup"
  )
    return addAppResponse(
      "Please enter strong password<br>Password Requirements:- <br>Minimum Length: 8<br>One Lower Case<br>One Upper Case<br>One Special Symbol<br>",
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
