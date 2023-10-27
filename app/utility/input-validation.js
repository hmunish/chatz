const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const { window } = new JSDOM('');
const DOMPurify = createDOMPurify(window);
const validator = require('validator');

const sanitizeUserInput = (input) => {
  try {
    if (!input) return false;
    let sanitizedInput = DOMPurify.sanitize(input);
    sanitizedInput = validator.escape(input);
    sanitizedInput = sanitizedInput.replace(/ /g, '');

    if (input === sanitizedInput) return sanitizedInput;
    return false;
  } catch (err) {
    throw new Error(err);
  }
};

const sanitizeChatMessage = (input) => {
  try {
    if (!input) return false;
    let sanitizedInput = DOMPurify.sanitize(input);
    sanitizedInput = validator.escape(input);

    if (input === sanitizedInput) return sanitizedInput;
    return false;
  } catch (err) {
    throw new Error(err);
  }
};

const isValidInputs = (userDetails, type) => {
  try {
    if (type === 'authKey') {
      const authKey = sanitizeUserInput(userDetails || '_', 'Invalid auth key');
      if (!authKey) return false;
      return true;
    }

    const email = sanitizeUserInput(userDetails.email, 'Invalid Email Id');
    const password = sanitizeUserInput(
      userDetails.password,
      'Invalid Password',
    );
    const phone = sanitizeUserInput(
      userDetails.phone || '0',
      'Invalid Phone Number',
    );

    if (!email || !password || !phone) return false;
    if (!validator.isEmail(email)) return false;
    if (type === 'signup' && !validator.isMobilePhone(phone)) return false;
    return [email, password, phone];
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = { isValidInputs, sanitizeUserInput, sanitizeChatMessage };
