// ==UserScript==
// @name        Driving test notification
// @namespace   https://github.com/vlad-vorotilov/
// @match       https://driverpracticaltest.dvsa.gov.uk/application*
// @grant       GM.getValue
// @version     1.1
// @author      vlad-vorotilov
// @description Script to automate notification about DVSA driving test, requires "licence", "postcode" values to be set
// @top-level-await
// ==/UserScript==

const START_PAGE = "https://driverpracticaltest.dvsa.gov.uk/application";

const FINAL_WAIT_SEC = 15 * 60;
const MIN_SEARCH_RESULTS = 6;
const NOTIFY_NO_APPOINTMENTS = false;

function log(val) {
  const now = new Date();
  console.log(now.toISOString() + " : " + String(val));
}

function formatTodayDate() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yy = String(today.getFullYear()).slice(2)

  return dd + '/' + mm + '/' + yy;
}

async function wait(min_sec = 1, delta_sec = 3) {
  const randTime = Math.random() * (delta_sec) + min_sec;
  await new Promise(r => setTimeout(r, randTime * 1000));
}

async function selectCar() {
  $('#test-type-car').click();
}

async function fillLicense() {
  const licence = await GM.getValue("licence");
  $('#driving-licence')[0].value = licence;
  await wait();
  $('#special-needs-none').click();
  await wait();
  $('#driving-licence-submit').click();
}

async function selectDate() {
  const datePicker = $('#test-choice-calendar');
  datePicker[0].value = formatTodayDate();
  await wait();
  $('#driving-licence-submit').click();
}

async function fillPostcode() {
  const postcode = await GM.getValue("postcode");
  $('#test-centres-input')[0].value = postcode;
  await wait();
  $('#test-centres-submit').click();
}

async function getMoreResults() {
  $('#fetch-more-centres')[0].click();
}

function parseTestCentres() {
  const testCentres = $('.test-centre-details-link');
  var availableTestCentres = new Map();
  for (const testCentre of testCentres) {
    const name = testCentre.querySelector('h4').innerHTML;
    const whenAvailable = testCentre.querySelector('h5').innerHTML.slice(13);
    if (whenAvailable.includes("No tests found on any date") && !NOTIFY_NO_APPOINTMENTS) {
      continue;
    }

    availableTestCentres.set(name, whenAvailable);
  }
  return availableTestCentres;
}


async function sendTelegramMessage(title, message) {
  const botToken = await GM.getValue("telegramBotToken");
  const botUrl = `https://api.telegram.org/bot${botToken}/sendMessage`
  const chatId = await GM.getValue("telegramChatId");
  const text = `*${title}*\n${message}`
  const data = {
    chat_id: chatId,
    text: text,
    parse_mode: "markdown"
  }
  const response = await fetch(botUrl, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.ok;
}

function sendDesktopNotification(title, message) {
  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  } else {
    const notification = new Notification(title, { body: message });
  }
}

async function sendNotification(title, message) {
  await sendTelegramMessage(title, message);
  sendDesktopNotification(title, message);
}

async function processTestCentersRes() {
  const availableTestCentres = parseTestCentres();
  if (availableTestCentres.size == 0) {
    log("No appointments");
  } else {
    var message = "";
    for (const [name, when] of availableTestCentres) {
      message += `${name} : ${when}\n`;
    }
    log(message);
    await sendNotification("Driving Appointment", message);
  }
  await wait(FINAL_WAIT_SEC);
  location.reload();
}

function goToStart() {
  document.location.href = START_PAGE
}

async function handleBotCheck() {
  sendDesktopNotification("Driving Appointment", "Bot check!");
  await wait(FINAL_WAIT_SEC);
  location.reload();
}

async function main() {
  await wait();
  if (document.title.includes("Type of test")) {
    await selectCar();
  } else if (document.title.includes("Licence details")) {
    await fillLicense();
  } else if (document.title.includes("Test date")) {
    await selectDate();
  } else if (document.title.includes("Test centre")) {
    if ($('#search-results').length == 0) {
      await fillPostcode();
    } else if ($('.test-centre-details-link').length < MIN_SEARCH_RESULTS) {
      await getMoreResults();
    } else {
      await processTestCentersRes();
    }
  } else if (document.title === "") {
    await handleBotCheck();
  } else {
    goToStart();
  }
}

main();
