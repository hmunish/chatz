import axios from "axios";
import { BACKEND_HOST_URL } from "../common/config";
import { sanitizeUserInput } from "../common/utility";
import validator from "validator";

export async function signUp(userData) {
  try {
    const response = await axios.post(
      `${BACKEND_HOST_URL}/users/signup`,
      userData
    );
    if (response.status !== 201) throw new Error(response.data.message);
    return response;
  } catch (err) {
    throw err;
  }
}

export async function signIn(userData) {
  try {
    const response = await axios.post(
      `${BACKEND_HOST_URL}/users/signin`,
      userData
    );
    if (response.status !== 200) throw new Error(response.data.message);
    return response;
  } catch (err) {
    throw err;
  }
}

export function isValidInputs(formDetails, viewInstance) {
  const email = sanitizeUserInput(
    formDetails.get("email"),
    "Invalid Email Id",
    viewInstance
  );
  const password = sanitizeUserInput(
    formDetails.get("password"),
    "Invalid Password",
    viewInstance
  );
  const phone = sanitizeUserInput(
    formDetails.get("phone") || "0",
    "Invalid Phone Number",
    viewInstance
  );
  if (!email || !password || !phone) return;
  if (!validator.isEmail(email))
    return viewInstance.addAppResponse("Invalid Email Id", "clr-red");
  if (
    viewInstance.registrationFormStatus === "signup" &&
    !validator.isMobilePhone(phone)
  )
    return viewInstance.addAppResponse("Invalid Phone Number", "clr-red");
  if (
    !validator.isStrongPassword(password) &&
    viewInstance.registrationFormStatus === "signup"
  ) {
    return viewInstance.addAppResponse(
      "Please enter strong password<br>Password Requirements:- <br>Minimum Length: 8<br>One Lower Case<br>One Upper Case<br>One Special Symbol<br>",
      "clr-red"
    );
  }

  return [email, password, phone];
}

export async function isSignedIn() {
  try {
    const authKey = localStorage.getItem("chatzSignIn");
    if (!authKey) return false;
    const response = await axios.get(`${BACKEND_HOST_URL}/users/isSignedIn`, {
      headers: { authKey },
    });
    if (response.status === 200) return true;
  } catch (err) {
    return false;
  }
}
