// ==UserScript==
// @name        Driving test notification
// @namespace   https://github.com/vlad-vorotilov/
// @match       https://driverpracticaltest.dvsa.gov.uk/application*
// @grant       GM.getValue
// @version     1.2
// @author      vlad-vorotilov
// @description Script to automate notification about DVSA driving test, requires "licence", "postcode" values to be set
// @top-level-await
// ==/UserScript==

const START_PAGE = "https://driverpracticaltest.dvsa.gov.uk/application";

const FINAL_WAIT_SEC = 5 * 60;
const MORE_WAIT_SEC = 9;
const NUM_RES_TO_CHECK = 6;
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
  log(`Waiting for ${randTime} sec`);
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
  await wait(MORE_WAIT_SEC);
  $('#fetch-more-centres')[0].click();
}

function sendNotification(title, message) {
  log(`${title}; ${message}`);
  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  } else {
    const notification = new Notification(title, { body: message });
  }
}

function processTestCentres() {
  const testCentres = $('.test-centre-details-link');
  for(var i = 0; i < Math.min(NUM_RES_TO_CHECK, testCentres.length); i++) {
    const name = testCentres[i].querySelector('h4').innerHTML;
    const whenAvailable = testCentres[i].querySelector('h5').innerHTML.slice(13);
    if (whenAvailable.includes("No tests found on any date") && !NOTIFY_NO_APPOINTMENTS) {
      continue;
    }
    sendNotification("Driving Appointment", `${name} : ${whenAvailable}`);
    testCentres[i].click();
    return;
  }
}

function selectTime() {
  const bookableDates = document.getElementsByClassName("BookingCalendar-date--bookable");
  for(const date of bookableDates) {
    date.getElementsByClassName("BookingCalendar-dateLink")[0].click();
    break;
  }
}

function goToStart() {
  document.location.href = START_PAGE
}

async function unknownState() {
  sendDesktopNotification("Driving Appointment", "UNKNOWN STATE");
  await wait(FINAL_WAIT_SEC);
  location.reload();
}

async function main() {
  if(document.title === "Test centre" && $('.test-centre-details-link').length > 0) {
    processTestCentres();
  } else if (document.title === "Test date / time — test times available") {
    // selectTime();
    // temp wait until further logic is done
    await wait(FINAL_WAIT_SEC);
  }

  await wait();
  if (document.title === "Type of test") {
    await selectCar();
  } else if (document.title === "Licence details") {
    await fillLicense();
  } else if (document.title === "Test date") {
    await selectDate();
  } else if (document.title === "Test centre") {
    if ($('#fetch-more-centres').length > 0) {
      await getMoreResults();
    } else {
      await fillPostcode();
    }
  } else {
    await unknownState();
  }
}

main();
