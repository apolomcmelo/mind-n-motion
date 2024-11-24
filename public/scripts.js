const metrics = [
    { name: "Interest", score: 0 },
    { name: "Excitement", score: 0 },
    { name: "Attention", score: 0 },
    { name: "Engagement", score: 0 },
    { name: "Relaxation", score: 0 },
    { name: "Stress", score: 0 }
]

const appProperties = {
    dom: {
        startStopButton: document.getElementById('start-stop-button'),
        startStopButtonIcon: document.getElementById('start-stop-button-icon'),
        speedometer: document.getElementById("speedometer")
    },
    map: null,
    watchId: null,
    speedHistory: [],
    journeyCoordinates: []
}

appProperties.dom.startStopButton.addEventListener('click', (event) => {
    if (appProperties.watchId) {
        navigator.geolocation.clearWatch(appProperties.watchId);

        appProperties.watchId = null;
        console.log("Speed History", appProperties.speedHistory)
    } else {
        appProperties.watchId = navigator.geolocation.watchPosition(
            (position) => {
                updatePositionOnMap(position.coords)
                updateSpeed(position)
            },
            (error) => console.error("Error watching the position", error),
            {enableHighAccuracy: true});

    }
    toggleStartStop();
});

function toggleStartStop() {
    appProperties.dom.startStopButtonIcon.classList.toggle("ri-play-fill");
    appProperties.dom.startStopButtonIcon.classList.toggle("ri-stop-fill");
}

function updateMetricsScore() {
    const radius = 28; // Radius of the ring bars
    const circumference = 2 * Math.PI * radius;

    metrics.forEach(metric => {
        const metricElement = document.getElementById(`${metric.name.toLowerCase()}-metric`)
        const progressCircle = metricElement.getElementsByClassName("progress-ring")[0]
        const scoreLabel = metricElement.getElementsByClassName("percentage-label")[0]

        progressCircle.setAttribute('stroke-dasharray', `${circumference}`);
        progressCircle.setAttribute('stroke-dashoffset', `${circumference - (metric.score / 100) * circumference}`);
        scoreLabel.textContent = `${metric.score}`;
    })
}

function updateSpeed(position) {
    const speedInKmPerHour = Math.round(position.coords.speed * 3.6);
    appProperties.dom.speedometer.textContent = `${speedInKmPerHour}`
    appProperties.speedHistory.push({timestamp: position.timestamp, speed: speedInKmPerHour})
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                initMap(position.coords)
            },
            (error) => console.error("Error getting the current location", error),
            {enableHighAccuracy: true}
        );
    } else {
        console.warn("Geolocation is not supported by this browser.");
    }
}

function initMap(position) {
    const latLong = [position.latitude,position.longitude];
    appProperties.map = L.map('map').setView(latLong, 18);
    // Add OpenStreetMap tile layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; Apolo Mc Melo'
    }).addTo(appProperties.map);

    L.marker(latLong).addTo(appProperties.map);
}

function updatePositionOnMap(position) {
    const latLong = [position.latitude,position.longitude];

    appProperties.journeyCoordinates.push(latLong);
    appProperties.map.setView(latLong, 18);

    L.polyline(appProperties.journeyCoordinates, { color: 'blue' }).addTo(appProperties.map);
    L.marker(latLong).addTo(appProperties.map);
}

window.onload = () => {
    updateMetricsScore()
    getCurrentLocation()
}