const GOOGLE_MAPS_API_KEY = "API_KEY" // TODO Remove the key before commiting

const metrics = [
    { name: "Interest", score: 75 },
    { name: "Excitement", score: 93 },
    { name: "Attention", score: 45 },
    { name: "Engagement", score: 60 },
    { name: "Relaxation", score: 40 },
    { name: "Stress", score: 3 }
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

function initMap() {
    const map = document.getElementById("map")
    const mapsUri = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=Rome`

    map.setAttribute("src", mapsUri);
}

window.onload = () => {
    updateMetricsScore()
    initMap()
}