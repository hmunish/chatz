import axios from "axios";
import View from "./view.js";
import { state, isSignedIn } from "./model.js";

async function handleIsSignedIn() {
  try {
    const authorized = await isSignedIn();
    console.log(authorized);
    if (!authorized) throw new Error("User not authorized");
  } catch (err) {
    View.redirectToLogin();
    throw err;
  }
}

async function init() {
  try {
    await handleIsSignedIn();
  } catch (err) {
    const errorMessage = err.response?.data.message || err.message;
    View.addAppResponse(errorMessage, "clr-red");
  }
}

init();
