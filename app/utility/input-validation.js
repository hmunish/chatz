const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);
const validator = require("validator");

const sanitizeUserInput = (input, errMsg) => {
  try {
    let sanitizedInput = DOMPurify.sanitize(input);
    sanitizedInput = validator.escape(input);
    sanitizedInput = sanitizedInput.replace(/ /g, "");

    if (input === sanitizedInput) return sanitizedInput;
    return false;
  } catch (err) {
    throw new Error(err);
  }
};

exports.isValidInputs = (userDetails, type) => {
  try {
    if (type === "authKey") {
      const authKey = sanitizeUserInput(userDetails || "_", "Invalid auth key");
      if (!authKey) return false;
      return true;
    }

    const email = sanitizeUserInput(userDetails.email, "Invalid Email Id"),
      password = sanitizeUserInput(userDetails.password, "Invalid Password"),
      phone = sanitizeUserInput(
        userDetails.phone || "0",
        "Invalid Phone Number"
      );

    if (!email || !password || !phone) return false;
    if (!validator.isEmail(email)) return false;
    if (type === "signup" && !validator.isMobilePhone(phone)) return false;
    return [email, password, phone];
  } catch (err) {
    throw new Error(err);
  }
};
