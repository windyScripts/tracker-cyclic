/* const scheme = 'http';
const hostName = '3.26.180.199';
const port = 3000;
const domain = `${scheme}://${hostName}:${port}`; */
const domain = 'http://localhost:3000';

const form = document.querySelector('#form');
const feedback = document.querySelector('#feedback');

// login details

const userNameField = document.querySelector('#name');
const emailField = document.querySelector('#email');
const passwordField = document.querySelector('#password');

// login redirect

const toLoginButton = document.querySelector('#toLogin');
toLoginButton.addEventListener('click', loginRedirect);

function loginRedirect() {
  window.location.href = '../login/login.html';
}

// frontend validation and handling response

form.addEventListener('submit', validateAndSubmitForm);

async function validateAndSubmitForm(e) {
  e.preventDefault();
  try {
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
    } else {
      const entry = {
        userName: userNameField.value,
        password: passwordField.value,
        email: emailField.value,
      };
      await axios.post(domain + '/auth/new', entry);
      userNameField.value = '';
      passwordField.value = '';
      emailField.value = '';
      feedback.textContent = 'Success!';
    }
  } catch (err) {
    console.log(err);
    feedback.textContent = err.response.data.message;
  }
}
