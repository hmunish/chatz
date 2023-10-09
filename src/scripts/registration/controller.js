import View from "./view";
import { isSignedIn, isValidInputs, signIn, signUp } from "./model";

async function handleIsUserSignedIn() {
  const res = await isSignedIn();
  if (res) {
    View.addAppResponse("Already signed in");
    View.redirectToDashboard();
  }
}

async function handleFormSubmit(e) {
  try {
    e.preventDefault();
    const formDetails = new FormData(e.target);
    // Validating user inputs for security & better user interface
    // Inputs will be validated on server-side as well
    const validInputs = isValidInputs(formDetails, View);
    if (!validInputs) return;

    if (validInputs.length === 3) {
      // should return array of all 3 user inputs if every user input is fine or else undefined

      const userData = {
        email: validInputs[0],
        password: validInputs[1],
        phone: validInputs[2],
      };

      // If user submitted sign-up form

      if (View.registrationFormStatus === "signup") {
        await handleSignUp(userData);
      } else {
        // Else user submitted sign-in form
        await handleSignIn(userData);
      }
    }
  } catch (err) {
    View.addAppResponse(err.message, "clr-red");
  }
}

async function handleSignUp(userData) {
  try {
    View.startLoadingSpinner();
    const response = await signUp(userData);
    View.addAppResponse(response.data.message);
    await handleSignIn(userData);
    // If new user is created login the user
  } catch (err) {
    const errorMessage = err.response?.data.message || err.message;
    View.addAppResponse(errorMessage, "clr-red");
    throw err;
  }
}

async function handleSignIn(userData) {
  try {
    View.startLoadingSpinner();
    const response = await signIn(userData);
    View.addAppResponse(response.data.message);
    View.addAppResponse("Redirecting to dashboard");
    View.startLoadingSpinner();

    // Setting authentication token for current user
    localStorage.setItem("chatzSignIn", JSON.stringify(response.data.authKey));

    // Redirecting user to dashboard page
    window.location.href = "/dashboard.html";
  } catch (err) {
    const errorMessage = err.response?.data.message || err.message;
    View.addAppResponse(errorMessage, "clr-red");
    throw err;
  }
}

async function init() {
  await handleIsUserSignedIn();
  View.addFormSubmitHandler(handleFormSubmit);
}

init();
