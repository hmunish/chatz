import validator from 'validator';
import axios from 'axios';
import { BACKEND_HOST_URL } from '../common/config';
import GlobalView from '../common/global-view';
import { qrySlct, sanitizeUserInput } from '../common/utility';

class RegistrationView extends GlobalView {
  title = qrySlct('.title');

  registrationForm = qrySlct('#registration-form');

  formSwitchBtn = qrySlct('button#form-switch');

  apiSignUpWrapper = qrySlct('.api-signup-wrapper');

  formContactSection = qrySlct('.form-sections.form-contact');

  phoneInput = qrySlct('#phone');

  registrationFormStatus = 'signin';

  constructor() {
    super();
    this._addAllHandlers();
  }

  _addAllHandlers() {
    this._addFormToggleHandler();
    this.addFormSubmitHandler();
  }

  _addFormToggleHandler() {
    this.formSwitchBtn.addEventListener('click', this.switchForm.bind(this));
  }

  addFormSubmitHandler(handler) {
    this.registrationForm.addEventListener('submit', handler);
  }

  switchForm() {
    if (this.registrationFormStatus === 'signin') {
      this.title.textContent = 'Sign Up';
      this.formSwitchBtn.innerHTML = "Have an Account?<br><span class='clr-green'>Sign In</span>";
      this.registrationFormStatus = 'signup';
    } else if (this.registrationFormStatus === 'signup') {
      this.title.textContent = 'Sign In';
      this.formSwitchBtn.innerHTML = "No Account?<br><span class='clr-green'>Sign Up</span>";
      this.registrationFormStatus = 'signin';
    }
    this.apiSignUpWrapper.classList.toggle('dp-no');
    this.formContactSection.classList.toggle('dp-no');
    this.phoneInput.toggleAttribute('disabled');
  }

  isValidInputs(formDetails) {
    const email = sanitizeUserInput(
      formDetails.get('email'),
      'Invalid Email Id',
      this,
    );
    const password = sanitizeUserInput(
      formDetails.get('password'),
      'Invalid Password',
      this,
    );
    const phone = sanitizeUserInput(
      formDetails.get('phone') || '0',
      'Invalid Phone Number',
      this,
    );
    if (!email || !password || !phone) return;
    if (!validator.isEmail(email)) return this.addAppResponse('Invalid Email Id', 'clr-red');
    if (
      !validator.isStrongPassword(password)
      && this.registrationFormStatus === 'signup'
    ) {
      return this.addAppResponse(
        'Please enter strong password<br>Password Requirements:- <br>Minimum Length: 8<br>One Lower Case<br>One Upper Case<br>One Special Symbol<br>',
        'clr-red',
      );
    }
    if (
      this.registrationFormStatus === 'signup'
      && !validator.isMobilePhone(phone)
    ) return this.addAppResponse('Invalid Phone Number', 'clr-red');

    return [email, password, phone];
  }

  async handleFormSubmit(e) {
    try {
      e.preventDefault();
      const formDetails = new FormData(e.target);
      // Validating user inputs for security & better user interface
      // Inputs will be validated on server-side as well
      const validInputs = this.isValidInputs(formDetails);
      if (!validInputs) return;

      if (validInputs.length === 3) {
        // should return array of all 3 user inputs if every user input is fine or else undefined

        const userData = {
          email: validInputs[0],
          password: validInputs[1],
          phone: validInputs[2],
        };

        // If user submitted sign-up form

        if (this.registrationFormStatus === 'signup') {
          await this.signUp(userData);
        } else {
          // Else user submitted sign-in form
          await this.signIn(userData);
        }
      }
    } catch (err) {
      this.addAppResponse(err.message, 'clr-red');
    }
  }

  async signUp(userData) {
    try {
      this.startLoadingSpinner();
      const response = await axios.post(
        `${BACKEND_HOST_URL}/users/signup`,
        userData,
      );
      if (response.status !== 201) throw new Error(response.data.message);
      this.addAppResponse(response.data.message);
      await this.signIn(userData);
      // If new user is created login the user
    } catch (err) {
      const errorMessage = err.response?.data.message || err.message;
      this.addAppResponse(errorMessage, 'clr-red');
      throw err;
    }
  }

  async signIn(userData) {
    try {
      this.startLoadingSpinner();
      const response = await axios.post(
        `${BACKEND_HOST_URL}/users/signin`,
        userData,
      );
      if (response.status !== 200) throw new Error(response.data.message);
      this.addAppResponse(response.data.message);
      this.addAppResponse('Redirecting to dashboard');
      this.startLoadingSpinner();

      // Setting authentication token for current user
      localStorage.setItem(
        'chatzSignIn',
        JSON.stringify(response.data.authKey),
      );

      // Redirecting user to dashboard page
      window.location.href = '/dashboard.html';
    } catch (err) {
      const errorMessage = err.response?.data.message || err.message;
      this.addAppResponse(errorMessage, 'clr-red');
      throw err;
    }
  }

  redirectToDashboard() {
    window.location.href = '/dashboard.html';
  }
}

export default new RegistrationView();
