const metrics = [
    { name: "Interest", score: 0 },
    { name: "Excitement", score: 0 },
    { name: "Attention", score: 0 },
    { name: "Engagement", score: 0 },
    { name: "Relaxation", score: 0 },
    { name: "Stress", score: 0 }
]

function updateMetricsScore() {
    const radius = 28; // Radius of the ring bars
    const circumference = 2 * Math.PI * radius;

    metrics.forEach(metric => {
        const metricElement = document.getElementById(`${metric.name.toLowerCase()}-metric`)
        const progressCircle = metricElement.getElementsByClassName("progress-ring")[0]
        const scoreLabel = metricElement.getElementsByClassName("percentage-label")[0]

        progressCircle.setAttribute('stroke-dasharray', circumference + "");
        progressCircle.setAttribute('stroke-dashoffset', (circumference - (metric.score / 100) * circumference) + "");
        scoreLabel.textContent = `${metric.score}`;
    })
}

function loadMap(location) {
    const map = document.getElementById("map")
    const mapsUri = `https://www.google.com/maps/embed/v1/place?key=${config.GOOGLE_MAPS_API_KEY}&q=${location.latitude},${location.longitude}`

    map.setAttribute("src", mapsUri);
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => loadMap(position.coords),
            (error) => console.error("Error getting the current location", error),
            {enableHighAccuracy: true}
        );
    } else {
        console.warn("Geolocation is not supported by this browser.");
    }
}

window.onload = () => {
    updateMetricsScore()
    getLocation()
}