/* const scheme = 'http';
const hostName = '3.26.180.199';
const port = 3000;
const domain = `${scheme}://${hostName}:${port}`; */
const domain = 'http://localhost:3000';

const formSubmit = document.getElementById('formSubmit');

const expenseName = document.getElementById('expenseName');
const expensePrice = document.getElementById('expensePrice');
const expenseCategory = document.getElementById('expenseCategory');
const categories = document.getElementsByClassName('expenseCategory');
const premium = document.getElementById('premium');

const logOutButton = document.getElementById('logout');

const premiumFeatures = document.getElementById('premiumFeature');
const pdfButton = document.getElementById('pdfDownload');
const paginationButtons = document.getElementById('pagination');
paginationButtons.addEventListener('click', changeExpensePage);
const expensesPerPageForm = document.getElementById('expensesPerPageForm');

expensesPerPageForm.addEventListener('submit', changeDisplayNumber);

async function changeDisplayNumber(e) {
  e.preventDefault();

  const newDisplayNumber = document.getElementById('expensesPerPageSelect').value;
  console.log(newDisplayNumber);
  localStorage.setItem('displayNumber', newDisplayNumber);
  refreshDisplay(newDisplayNumber);
}

async function changeExpensePage(e) {
  if (e.target.id === 'expensesBack' || e.target.id === 'expensesForward') {
    const targetPageNumber = parseInt(e.target.textContent);
    const relativePagePosition = e.target.id;
    const expensesPerPage = getNumberOfItemsPerPage();
    let id;
    const items = document.getElementById('items');
    if (e.target.id === 'expensesBack') {
      id = items.lastElementChild.id;
    } else {
      id = items.firstElementChild.id;
    }

    const response = await axios.get(domain + '/entries/' + targetPageNumber, { headers: { Authorization: getToken() }, params: { items: expensesPerPage, relativePagePosition, id }});

    const currentPageExpenses = response.data.currentPageExpenses;
    const numberOfPages = response.data.numberOfPages;

    // load expenses and change button configuration

    displayEntriesFromArray(currentPageExpenses);

    configureButtons(numberOfPages, targetPageNumber);
  }
}

pdfButton.addEventListener('click', getPDFLink);

async function getPDFLink(e) {
  e.preventDefault();

  const startDate = document.getElementById('startDate').value;

  const endDate = document.getElementById('endDate').value;

  const response = await axios.get(domain + '/download', { headers: { Authorization: getToken() }, params: { start_date: startDate, end_date: endDate }});

  if (response.status === 200) {
    const a = document.createElement('a');
    a.href = response.data.fileUrl;
    a.download = 'myexpense.csv';
    console.log(response);
    a.click();
  } else {
    throw new Error(response.data.message);
  }
}

logOutButton.addEventListener('click', logOutUser);

async function logOutUser(e) {
  e.preventDefault();
  localStorage.removeItem('token');
  console.log('token removed!');
  window.location.href = '../login/login.html';
}

premium.addEventListener('click', createPaymentRequest);
async function createPaymentRequest(e) {
  e.preventDefault();
  const response = await axios.get(domain + '/purchase/createorder', { headers: { Authorization: getToken() }});
  const token = getToken();
  const options = {
    key: response.data.key_id,
    order_id: response.data.order._id,
    async handler (response) {
      const transactionResponse = await axios.post(domain + '/purchase/updatetransactionstatus', {
        order_id: options.order_id,
        payment_id: response.razorpay_payment_id,
        payment_status: 'SUCCESS',
      }, { headers: { Authorization: token }});

      localStorage.setItem('token', transactionResponse.data.token);

      window.location.reload();
    },
  };
  const rzpl = new Razorpay(options);
  rzpl.open();
  e.preventDefault();
  rzpl.on('payment.failed', async function(response) {
    alert('Something went wrong');
    await axios.post(domain + '/purchase/updatetransactionstatus', { // !!!!!!
      order_id: options.order_id,
      payment_id: response.razorpay_payment_id,
      payment_status: 'FAILURE',
    }, { headers: { Authorization: getToken() }});
  });
}

// Event listeners

formSubmit.addEventListener('click', addEntry);

window.addEventListener('DOMContentLoaded', refreshEntries);

const items = document.getElementById('items');
items.addEventListener('click', entryFunctions);

function entryFunctions(e) {
  try {
    if (e.target.classList.contains('edit')) {
      editEntry(e);
    } else if (e.target.classList.contains('delete')) {
      deleteEntry(e);
    }
  } catch (err) {
    console.log(err);
  }
}

// edit entry

async function editEntry(e) {
  try {
    const row = e.target.parentNode.parentNode;
    const name = row.children[1].innerText;
    const price = row.children[2].innerText;
    const category = row.children[3].innerText;
    const id = row.id;
    formSubmit.setAttribute('data-id', id);
    let categoryValue = '0';
    for (let i = 0; i < categories.length; i++) {
      if (categories[i].innerText === category) {
        categoryValue = categories[i].value;
      }
    }

    expenseName.value = name;
    expensePrice.value = price;
    expenseCategory.value = categoryValue;

    items.removeChild(row);
  } catch (error) {
    console.log(error);
  }
}

// delete entry

async function deleteEntry(e) {
  try {
    if (confirm('Are you sure?')) {
      const row = e.target.parentNode.parentNode;
      const id = row.id;
      const token = getToken();
      await axios.delete(domain + '/entry/' + id, { headers: { Authorization: token }});
      refreshEntries();
    }
  } catch (err) {
    console.log(err);
  }
}

// display Products and total value.

function refreshEntries() {
  try {
    const expensesPerPage = getNumberOfItemsPerPage();

    refreshDisplay(expensesPerPage);
  } catch (err) {
    console.log(err);
  }
}

// add an entry and update total price.

async function addEntry(e) {
  try {
    e.preventDefault();
    const name = expenseName.value;
    const price = expensePrice.value;
    const category =  expenseCategory.options[expenseCategory.value].text;//
    const token = getToken();
    const _id = formSubmit.getAttribute('data-id');
    const entry = {
      _id,
      name,
      price,
      category,
      token,
    };
    await axios.post(domain + '/entry', entry, { headers: { Authorization: token }});
    formSubmit.setAttribute('data-id', '');
    refreshEntries();

    // empty fields

    expenseName.value = '';
    expensePrice.value = '';
    expenseCategory.value = '1';
  } catch (err) {
    console.log(err);
  }
}

// configure pagination buttons

function configureButtons(numberOfPages, currentPage) {
  const nextPageButton = document.getElementById('expensesForward');

  if (currentPage >= numberOfPages) {
    nextPageButton.setAttribute('disabled', '');
    nextPageButton.innerText = '-';
  } else {
    nextPageButton.innerText = currentPage + 1;
    nextPageButton.disabled = false;
  }

  const currentPageButton = document.getElementById('currentExpenses');
  currentPageButton.setAttribute('disabled', '');
  currentPageButton.innerText = currentPage;

  const previousPageButton = document.getElementById('expensesBack');

  if (numberOfPages < 2 || currentPage === 1) {
    previousPageButton.setAttribute('disabled', '');
    previousPageButton.innerText = '-';
  } else {
    previousPageButton.innerText = currentPage - 1;
    previousPageButton.disabled = false;
  }
}

// create rows of data from an array

function displayEntriesFromArray(arrayOfExpenses) {
  const items = document.getElementById('items');
  items.innerHTML = '';
  arrayOfExpenses.forEach(element => {
    createRow(element['date'], element['name'], element['price'], element['category'], element['_id'], items);
  });

  if (arrayOfExpenses.length === 0) {
    items.innerHTML = '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
  }
}

// create table row from name, price with id.

function createRow(date, name, price, category, id, parent) {
  const row = document.createElement('tr');
  row.className = 'item';

  const dateData = document.createElement('td');
  dateData.appendChild(document.createTextNode(date.slice(0,10)));

  const nameData = document.createElement('td');
  nameData.appendChild(document.createTextNode(name));

  const priceData = document.createElement('td');
  priceData.appendChild(document.createTextNode(price));

  const categoryData = document.createElement('td');
  categoryData.appendChild(document.createTextNode(category));

  const editButton = document.createElement('button');
  editButton.className = 'btn btn-success edit';
  editButton.appendChild(document.createTextNode('edit'));
  const editTab = document.createElement('td');
  editTab.appendChild(editButton);

  const deleteButton = document.createElement('button');
  deleteButton.className = 'btn btn-danger delete';
  deleteButton.appendChild(document.createTextNode('delete'));
  const deleteTab = document.createElement('td');
  deleteTab.appendChild(deleteButton);

  row.id = id;

  row.appendChild(dateData);
  row.appendChild(nameData);
  row.appendChild(priceData);
  row.appendChild(categoryData);
  row.appendChild(editTab);
  row.appendChild(deleteTab);

  while (parent.childElementCount > (getNumberOfItemsPerPage() - 1)) {
    parent.removeChild(items.firstChild);
  }

  parent.appendChild(row);
}

function getNumberOfItemsPerPage() {
  const expensesPerPage = localStorage.getItem('displayNumber');
  if (expensesPerPage) return expensesPerPage;
  else {
    return document.getElementById('expensesPerPageSelect').value;
  }
}

function getToken() {
  try {
    const token = localStorage.getItem('token');
    return token;
  } catch (err) {
    console.log(err);
  }
}

async function refreshDisplay(expensesPerPage) {
  document.getElementById('expensesPerPageSelect').value = expensesPerPage;

  const token = getToken();

  const message = await axios.get(domain + '/entries', { headers: { Authorization: token }, params: { items: expensesPerPage }}); // ?
  const arrayOfExpenses = message.data.currentPageExpenses;

  const numberOfPages = message.data.numberOfPages;
  const startingPage = numberOfPages;

  configureButtons(numberOfPages, startingPage);

  const premiumStatus = message.data.premiumStatus;
  if (premiumStatus === true) {
    unlockPremium();
  }
  displayEntriesFromArray(arrayOfExpenses);
}

async function unlockPremium() {
  changePremiumButton();
  setMinAndMaxForDownloads();
  const leaderboardButton = document.getElementById('showLeaderboard');
  leaderboardButton.addEventListener('click', enableLeaderboard);
  const fileUrlButton = document.getElementById('showFileUrls');
  fileUrlButton.addEventListener('click', enableDownloadLinks);
}

function changePremiumButton() {
  premium.classList.add('disabled'/* , 'btn-warning' */);
  /* premium.classList.remove('btn-success'); */
  premium.style.visibility = 'hidden';
  premium.textContent = 'You are a premium user!';
  premiumFeatures.removeAttribute('hidden');
}

// set dates to have a minimum and maximum.
async function setMinAndMaxForDownloads() {
  const token = getToken();
  const response = await axios.get(domain + '/dates', { headers: { Authorization: token }});
  const max = response.data.beforeDate.date.slice(0, 10);
  const min = response.data.afterDate.date.slice(0, 10);
  const startDateField = document.getElementById('startDate');
  const endDateField = document.getElementById('endDate');
  startDateField.setAttribute('min', min);
  startDateField.setAttribute('max', max);
  endDateField.setAttribute('max', max);
  endDateField.setAttribute('min', min);
}

async function enableLeaderboard() {
  const leaderboardTableBody = document.getElementById('leaderboard');
  const leaderboardTable = document.getElementById('leaderboardTable');

  const token = getToken();

  leaderboardTable.toggleAttribute('hidden');

  if (leaderboardTable.hasAttribute('hidden')) {
    document.getElementById('showLeaderboard').value = 'Show Leaderboard';
    document.getElementById('showLeaderboard').innerText = 'Show Leaderboard';

    leaderboardTableBody.innerHTML = '';
  } else {
    document.getElementById('showLeaderboard').value = 'Hide Leaderboard';
    document.getElementById('showLeaderboard').innerText = 'Hide Leaderboard';

    const userLeaderBoardObject = await axios.get(domain + '/leaderboard', { headers: { Authorization: token }});

    Object.keys(userLeaderBoardObject.data).forEach(e => {
      const row = document.createElement('tr');
      const nameData = document.createElement('td');
      const expenseData = document.createElement('td');

      nameData.appendChild(document.createTextNode(userLeaderBoardObject.data[e].name));
      expenseData.appendChild(document.createTextNode(userLeaderBoardObject.data[e].totalExpense));

      row.appendChild(nameData);
      row.appendChild(expenseData);

      leaderboardTableBody.appendChild(row);
    });
  }
}

async function enableDownloadLinks() {
  const fileUrlTableBody = document.getElementById('fileUrlBody');
  const fileUrlTable = document.getElementById('fileUrlTable');

  const token = getToken();

  fileUrlTable.toggleAttribute('hidden');

  if (fileUrlTable.hasAttribute('hidden')) {
    document.getElementById('showFileUrls').value = 'Show File Urls';
    document.getElementById('showFileUrls').innerText = 'Show File Urls';

    fileUrlTableBody.innerHTML = '';
  } else {
    document.getElementById('showFileUrls').value = 'Hide File Urls';
    document.getElementById('showFileUrls').innerText = 'Hide File Urls';

    const userFileUrlObject = await axios.get(domain + '/fileUrls', { headers: { Authorization: token }});
    console.log(userFileUrlObject);
    userFileUrlObject.data.fileUrls.forEach(e => {
      const row = document.createElement('tr');
      const dateData = document.createElement('td');
      const urlData = document.createElement('td');
      const urlLink = document.createElement('a');

      dateData.appendChild(document.createTextNode(e.date.slice(0,10) + ' : ' /* + userFileUrlObject.data.fileUrls[e].url */));
      urlLink.appendChild(document.createTextNode(e.date.slice(11,19)));
      urlLink.setAttribute('href', e.url);
      urlData.appendChild(urlLink);

      row.appendChild(dateData);
      row.appendChild(urlData);

      fileUrlTableBody.appendChild(row);
    });
  }
}
