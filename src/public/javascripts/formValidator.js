const passwordField = document.getElementsByName("password")[0];
const rePasswordField = document.getElementsByName("re_password")[0];
const invalidPasswordField = document.getElementById("invalid_password");

// Checks if current state of password fields is okay (passwords match or are being edited)
function passwordsOkay() {
    return passwordField.value == rePasswordField.value
    || passwordField.value == ""
    || rePasswordField.value == "";
}

// If the input is not okay, warn the user
function checkMatchingPasswords() {
    if(!passwordsOkay()) invalidPasswordField.appendChild(document.createTextNode("Passwords do not match."));
}

// If input is okay, remove the warning
function checkMatchingPasswordsOnChange() {
    if(passwordsOkay()) invalidPasswordField.innerHTML = "";
}

// Checks if form is valid to submit
// HTML 'required' tags check for empty fields
// Server checks for existing username
function checkSubmit() {
    return passwordField.value == rePasswordField.value && passwordField.value != "";
}

// Attach validation listeners
passwordField.addEventListener("focusout", checkMatchingPasswords);
passwordField.addEventListener("input", checkMatchingPasswordsOnChange);
rePasswordField.addEventListener("focusout", checkMatchingPasswords);
rePasswordField.addEventListener("input", checkMatchingPasswordsOnChange);