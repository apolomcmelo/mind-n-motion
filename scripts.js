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
    watchId: null,
    speedHistory: []
}

appProperties.dom.startStopButton.addEventListener('click', (event) => {
    if (appProperties.watchId) {
        navigator.geolocation.clearWatch(appProperties.watchId);

        appProperties.watchId = null;
        console.log("Speed History", appProperties.speedHistory)

    } else {
        appProperties.watchId = navigator.geolocation.watchPosition(
            (position) => {
                updateMap(position.coords)
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

function updateMap(position) {
    const map = document.getElementById("map")
    let currentPosition = `${position.latitude},${position.longitude}`;
    // const mapsUri = `https://www.google.com/maps/embed/v1/streetview?key=${config.GOOGLE_MAPS_API_KEY}&location=${currentPosition}`
    const mapsUri = `https://www.google.com/maps/embed/v1/place?key=${config.GOOGLE_MAPS_API_KEY}&q=${currentPosition}`

    map.setAttribute("src", mapsUri);
}

function updateSpeed(position) {
    let speedInKmPerHour = Math.round(position.coords.speed * 3.6);
    appProperties.dom.speedometer.textContent = `${speedInKmPerHour}`
    appProperties.speedHistory.push({timestamp: position.timestamp, speed: speedInKmPerHour})
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => updateMap(position.coords),
            (error) => console.error("Error getting the current location", error),
            {enableHighAccuracy: true}
        );
    } else {
        console.warn("Geolocation is not supported by this browser.");
    }
}

window.onload = () => {
    updateMetricsScore()
    getCurrentLocation()
}