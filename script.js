// Initialize map with Leaflet
const map = L.map('map', {
    center: [51.505, -0.09],
    zoom: 13,
    zoomControl: true,
});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

let pins = JSON.parse(localStorage.getItem('pins')) || [];
let currentPin = null;

// Function to show popup form with address and remarks
function displayPopup(lat, lng) {
    const popupForm = document.getElementById('popup-form');
    popupForm.style.display = 'block';
    document.getElementById('address').textContent = 'Fetching address...';
    document.getElementById('remarks').value = '';
    currentPin = { lat, lng };

    fetchAddress(lat, lng, address => {
        document.getElementById('address').textContent = address || 'Address not found';
        currentPin.address = address;
    });
}

// Function to fetch address using OpenStreetMap Nominatim API
function fetchAddress(lat, lng, callback) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => callback(data.display_name))
        .catch(() => callback(null));
}

// Function to save pin with remarks and address
function savePin() {
    const remarks = document.getElementById('remarks').value;
    if (!remarks.trim()) {
        alert('Please enter a remark.');
        return;
    }

    const { lat, lng, address } = currentPin;
    const pinData = { lat, lng, remarks, address };
    pins.push(pinData);
    localStorage.setItem('pins', JSON.stringify(pins));

    // Add marker on the map for the saved pin
    addMarkerToMap(pinData);
    addPinToSidebar(pinData);

    resetForm();
}

// Function to reset and hide popup form
function resetForm() {
    document.getElementById('popup-form').style.display = 'none';
    currentPin = null;
}

// Function to add pin to sidebar list
function addPinToSidebar(pinData) {
    const listItem = document.createElement('li');
    listItem.textContent = `${pinData.remarks} - ${pinData.address || 'Address not found'}`;
    listItem.addEventListener('click', () => {
        map.setView([pinData.lat, pinData.lng], 16);
    });
    document.getElementById('pin-list').appendChild(listItem);
}

// Function to add a marker on the map
function addMarkerToMap(pinData) {
    const marker = L.marker([pinData.lat, pinData.lng]).addTo(map);
    marker.bindPopup(`<b>${pinData.remarks}</b><br>${pinData.address || 'Address not found'}`);
}

// Map click event to drop a pin
map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    displayPopup(lat, lng);
});

// Event listeners for popup buttons
document.getElementById('save-pin').addEventListener('click', savePin);
document.getElementById('cancel').addEventListener('click', resetForm);

// Load pins from local storage on page load
pins.forEach(pin => {
    addPinToSidebar(pin);
    addMarkerToMap(pin); // Add marker for each saved pin on the map
});
