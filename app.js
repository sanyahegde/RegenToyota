let map;
let directionsService;
let directionsRenderer;
let avoidHighways = false;

// Constants for regenerative braking calculations
const percent = 0.6; // energy recaptured percentage
const mass = 1930; // in kilograms of BZ4X full EV model
const mileEnergy = 1150000; // Joules per mile
const conversion = 2.237; // mph to m/s
const battery = 20; // Battery constant

function openPopup() {
 document.getElementById("popup").classList.add("open-popup");
}

function closePopup() {
 document.getElementById("popup").classList.remove("open-popup");
}

function initMap() {
 map = new google.maps.Map(document.getElementById('map'), {
 center: { lat: -34.397, lng: 150.644 },

 zoom: 6
 });
 directionsService = new google.maps.DirectionsService();
 directionsRenderer = new google.maps.DirectionsRenderer();
 directionsRenderer.setMap(map);

 new google.maps.places.Autocomplete(document.getElementById('origin-input'));
 new google.maps.places.Autocomplete(document.getElementById('destination-input'));

 document.getElementById('calculate-distance').addEventListener('click', calculateAndDisplayRoute);
 document.getElementById('avoid-highways').addEventListener('change', () => {
 avoidHighways = document.getElementById('avoid-highways').checked;
 calculateAndDisplayRegenMiles(); // Recalculate when the checkbox state changes
 });
}

function calculateAndDisplayRoute() {
 const origin = document.getElementById('origin-input').value;
 const destination = document.getElementById('destination-input').value;
 const selectedMode = document.querySelector('input[name="type"]:checked').id.split('-')[1].toUpperCase();

 directionsService.route({
 origin: origin,
 destination: destination,
 travelMode: google.maps.TravelMode[selectedMode],
 avoidHighways: avoidHighways
 }, (response, status) => {
 if (status === 'OK') {
 directionsRenderer.setDirections(response);
 displayRouteInfo(response);
 if (avoidHighways) {
 calculateAndDisplayRegenMiles(response.routes[0].legs[0].distance.value / 1609.34); // Convert meters to miles
 } else {
 document.getElementById('energy-output').textContent = ''; // Clear regenerative miles display
 }
 // Now let's check the condition for the popup after displaying the route
 const distanceInMiles = response.routes[0].legs[0].distance.value / 1609.34; // Convert meters to miles
 if ((distanceInMiles - battery) < 10) {
 openPopup(); // Open the popup if the condition is met
 }
 } else {
 window.alert('Directions request failed due to ' + status);
 }
 });

}

let popupShown = false;  // This variable will track if the popup has been shown

function openPopup() {
  if (!popupShown) {  // Only show the popup if it hasn't been shown before
    document.getElementById("popup").classList.add("open-popup");
    document.getElementById("question").style.display = "block";
    document.getElementById("content").style.display = "none";
    popupShown = true;  // Set this to true so the popup won't be shown again
  }
}

// Modify this function to set regen mode based on user choice
function generateOptimalPath(shouldGenerateOptimal) {
  let question = document.getElementById("question");
  let content = document.getElementById("content");
  let messageTitle = document.getElementById("messageTitle");
  let message = document.getElementById("message");

  // Hide the question and show the answer content
  question.style.display = "none";
  content.style.display = "block";

  if (shouldGenerateOptimal) {
    messageTitle.innerText = "New Optimal Path Given!";
    message.innerText = "Tips: Please consider turning off/down the AC/Heater, Seat Warmers, Radio, etc.";
    // Check the regen mode checkbox and recalculate the route
    document.getElementById('avoid-highways').checked = true;
    avoidHighways = true;
    calculateAndDisplayRoute(); // Recalculate the route with regen mode
  } else {
    messageTitle.innerText = "Have a safe trip!";
    message.innerText = "Enjoy your journey and drive safely.";
  }

  // Set a timeout to close the answer after 5 seconds
  setTimeout(closePopup, 5000);
}
// Popup related code
// Other functions and code ...

// function openPopup() {
//  document.getElementById("popup").classList.add("open-popup");
//  document.getElementById("question").style.display = "block"; // Show the question
//  document.getElementById("content").style.display = "none"; // Hide the answer
// }

// function generateOptimalPath(shouldGenerateOptimal) {
//  let question = document.getElementById("question");
//  let content = document.getElementById("content");
//  let messageTitle = document.getElementById("messageTitle");
//  let message = document.getElementById("message");

//  // Hide the question and show the answer content
//  question.style.display = "none";
//  content.style.display = "block";

//  if (shouldGenerateOptimal) {
//  messageTitle.innerText = "New Optimal Path Given!";
//  message.innerText = "Tips: Please consider turning off/down the AC/Heater, Seat Warmers, Radio, etc.";
//  } else {
//  messageTitle.innerText = "Have a safe trip!";
//  message.innerText = "Enjoy your journey and drive safely.";
//  }

//  // Set a timeout to close the answer after 5 seconds
//  setTimeout(closePopup, 5000);
// }

function closePopup() {
 document.getElementById("popup").classList.remove("open-popup");
}


function displayRouteInfo(response) {
 const route = response.routes[0].legs[0];
 const distanceOutput = document.getElementById('output');
 distanceOutput.innerHTML = `<div><strong>Distance:</strong> ${route.distance.text}</div><div><strong>Duration:</strong> ${route.duration.text}</div>`;
}

function calculateAndDisplayRegenMiles(distance = 0) {
 if (avoidHighways && distance > 0) {
 const speed = 50 / conversion; // Convert speed to m/s from mph
 const totalEnergy = 0.5 * percent * mass * speed * speed;
 const regenMiles = totalEnergy / mileEnergy;
 const energyOutput = document.getElementById('energy-output');
 energyOutput.textContent = `Regenerative Miles: ${(regenMiles * distance).toFixed(2)}`;
 }
}

window.initMap = initMap;
