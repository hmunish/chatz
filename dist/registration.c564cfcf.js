a("#loading-spinner"),a("#app-response-box"),a("#app-response-message"),a("section.registration");const n=a(".title"),e=a("#registration-form"),t=a("button#form-switch"),s=a(".api-signup-wrapper"),i=a(".form-sections.form-contact"),o=a("#phone");let r="signin";// Function to return element using document.querySelector method to avoid repeatation of code
function a(n){return document.querySelector(n)}/// //// UTILITY FUNCTIONS ENDS ///////
/// //// FUNCTIONS ENDS HERE ///////
//# sourceMappingURL=registration.c564cfcf.js.map
/// //// EVENT LISTENERS STARTS ///////
t.addEventListener("click",function(){"signin"===r?(n.textContent="Sign Up",t.innerHTML="Have an Account?<br><span class='clr-green'>Sign In</span>",r="signup"):"signup"===r&&(n.textContent="Sign In",t.innerHTML="No Account?<br><span class='clr-green'>Sign Up</span>",r="signin"),s.classList.toggle("dp-no"),i.classList.toggle("dp-no"),o.toggleAttribute("disabled")}),e.addEventListener("submit",/// //// EVENT LISTENERS ENDS ///////
/// //// FUNCTIONS STARTS HERE ///////
function(n){n.preventDefault();let e=new FormData(n.target),t=e.get("email"),s=e.get("password");console.log(t,s,phone=e.get("phone"))}),console.log(DOMPurify.sanitize("munish*&(((    ***"));
//# sourceMappingURL=registration.c564cfcf.js.map
