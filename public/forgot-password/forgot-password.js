/* const scheme = 'http';
const hostName = '3.26.180.199';
const port = 3000;
const domain = `${scheme}://${hostName}:${port}`; */
const domain = 'http://localhost:3000';

const form = document.querySelector('#form');
const emailField = document.querySelector('#email');
const toLoginButton = document.querySelector('#toLogin');

form.addEventListener('submit', onEmailSubmit);

toLoginButton.addEventListener('click', loginRedirect);

async function onEmailSubmit(e) {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
  } else {
    const email = emailField.value;
    const response = await axios.post(domain + '/password/forgotpassword', { email });
    if (response.status === 200) {
      const emailValidFeedback = document.querySelector('#feedback');
      emailValidFeedback.textContent = 'Request submitted.';
      emailField.value = '';
    }
  }
}

function loginRedirect() {
  window.location.href = '../login/login.html';
}
