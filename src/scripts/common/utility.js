import validator from "validator";
import DOMPurify from "dompurify";

/// //// UTILITY FUNCTIONS STARTS ///////

// Function to sanitize user input using Validator library
export function sanitizeUserInput(input, errMsg, instance) {
  let sanitizedInput = DOMPurify.sanitize(input);
  sanitizedInput = validator.escape(input);
  sanitizedInput = sanitizedInput.replace(/ /g, "");

  if (input === sanitizedInput) return sanitizedInput;

  if (instance) instance.addAppResponse(errMsg, "clr-red");
  return false;
}

// Function to sanitize chat messages using Validator library
export function sanitizeChatMessage(input, errMsg, instance) {
  let sanitizedInput = DOMPurify.sanitize(input);
  sanitizedInput = validator.escape(input);

  if (input === sanitizedInput) return sanitizedInput;

  if (instance) instance.addAppResponse(errMsg, "clr-red");
  return false;
}

// Function to return element using document.querySelector method to avoid repeatation of code
export function qrySlct(query) {
  return document.querySelector(query);
}

/// //// UTILITY FUNCTIONS ENDS ///////
