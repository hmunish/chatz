const loadingSpinner = qrySlct('#loading-spinner');
const appResponseBox = qrySlct('#app-response-box');
const appResponseMessage = qrySlct('#app-response-message');
const registrationSection = qrySlct('section.registration');
const title = qrySlct('.title');
const registrationForm = qrySlct('#registration-form');
const formSwitchBtn = qrySlct('button#form-switch');
const apiSignUpWrapper = qrySlct('.api-signup-wrapper');
const formContactSection = qrySlct('.form-sections.form-contact');
const phoneInput = qrySlct('#phone');

let registrationFormStatus = 'signin';

/// //// EVENT LISTENERS STARTS ///////

formSwitchBtn.addEventListener('click', switchForm);

/// //// EVENT LISTENERS ENDS ///////

/// //// FUNCTIONS STARTS HERE ///////

function addAppResponse(message = '', statusClass = 'clr-green') {
  appResponseBox.classList.remove('dp-no');
  appResponseMessage.classList = statusClass;
  appResponseMessage.textContent += message;
  setTimeout(removeAppResponse, 3000);
}

function removeAppResponse() {
  appResponseMessage.textContent = '';
  appResponseBox.classList.add('dp-no');
}

function toggleLoader() {
  loadingSpinner.classList.toggle('dp-no');
}

function switchForm() {
  if (registrationFormStatus === 'signin') {
    title.textContent = 'Sign Up';
    formSwitchBtn.innerHTML = "Have an Account?<br><span class='clr-green'>Sign In</span>";
    registrationFormStatus = 'signup';
  } else if (registrationFormStatus === 'signup') {
    title.textContent = 'Sign In';
    formSwitchBtn.innerHTML = "No Account?<br><span class='clr-green'>Sign Up</span>";
    registrationFormStatus = 'signin';
  }
  apiSignUpWrapper.classList.toggle('dp-no');
  formContactSection.classList.toggle('dp-no');
  phoneInput.toggleAttribute('disabled');
}

/// //// UTILITY FUNCTIONS STARTS ///////

// Function to return element using document.querySelector method to avoid repeatation of code
function qrySlct(query) {
  return document.querySelector(query);
}

/// //// UTILITY FUNCTIONS ENDS ///////

/// //// FUNCTIONS ENDS HERE ///////
