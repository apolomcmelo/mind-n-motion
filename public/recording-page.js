const metrics = [
    { name: "Interest", score: 0 },
    { name: "Excitement", score: 0 },
    { name: "Attention", score: 0 },
    { name: "Engagement", score: 0 },
    { name: "Relaxation", score: 0 },
    { name: "Stress", score: 0 }
]

const recording = {
    speedometer: document.getElementById("speedometer"),
    map: null,
    watchId: null,
    chart: null,
    chartElement: document.getElementById('speedChart').getContext('2d'),
    speedHistory: [],
    metricsHistory: [],
    journeyCoordinates: []
}

// #### Metrics
function updateMetricsScore(metric) {
    const radius = 28; // Radius of the ring bars
    const circumference = 2 * Math.PI * radius;

    const metricElement = document.getElementById(`${metric.name.toLowerCase()}-metric`)
    const progressCircle = metricElement.getElementsByClassName("progress-ring")[0]
    const scoreLabel = metricElement.getElementsByClassName("percentage-label")[0]

    progressCircle.setAttribute('stroke-dasharray', `${circumference}`);
    progressCircle.setAttribute('stroke-dashoffset', `${circumference - (metric.score / 100) * circumference}`);
    scoreLabel.textContent = `${metric.score}`;
}

// #### Speed
function updateSpeed(position) {
    const speedRecord = {
        timestamp: position.timestamp,
        speed: Math.round(position.coords.speed * 3.6)
    };

    recording.speedHistory.push(speedRecord);

    recording.speedometer.textContent = `${speedRecord.speed}`
    updateChartWith(recording.chart, recording.chartElement, speedRecord.timestamp, speedRecord.speed);

}
function initSpeedChart() {
    recording.chart = new Chart(recording.chartElement, {
        type: 'line',
        data: {
            labels: recording.speedHistory.map(data => { formatTimestamp(data.timestamp)}), // X-axis labels
            datasets: [{
                label: 'Speed (km/h)',
                data: recording.speedHistory.map(data => data.speed), // Y-axis data
                borderColor: createChartHorizontalGradient(recording.chartElement),
                borderWidth: 2,
                fill: false,
                pointRadius: 0, // Hide the dots in the chart
                tension: 0.4, // Smooth curve
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: false,
                    border: {
                        display: false
                    }
                },
                y: {
                    title: { display: false, text: 'Speed (km/h)' },
                    ticks: { autoSkip: true, maxTicksLimit: 4 },
                    beginAtZero: true,
                    border: { display: false },
                    grid: { color: '#282828' }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// #### Map
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
    recording.map = L.map('map').setView(latLong, 18);
    // Add OpenStreetMap tile layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; Apolo Mc Melo'
    }).addTo(recording.map);

    L.marker(latLong).addTo(recording.map);
}

function updatePositionOnMap(position) {
    const latLong = [position.latitude,position.longitude];

    recording.journeyCoordinates.push(latLong);
    recording.map.setView(latLong, 18);

    L.polyline(recording.journeyCoordinates, { color: 'blue' }).addTo(recording.map);
}

// #### Business Logic
function startRecording() {
    localStorage.clear()
    recording.watchId = navigator.geolocation.watchPosition(
        (position) => {
            updatePositionOnMap(position.coords)
            updateSpeed(position)
        },
        (error) => console.error("Error watching the position", error),
        {enableHighAccuracy: true});
}

function stopRecording() {
    navigator.geolocation.clearWatch(recording.watchId);
    recording.watchId = null;

    localStorage.setItem("SpeedHistory", JSON.stringify(recording.speedHistory))

    metrics.forEach(metric => {
        const singleMetricHistory = recording.metricsHistory.filter(m => m.name === metric.name)
        localStorage.setItem(`${metric.name}History`, JSON.stringify(singleMetricHistory))
    })

    console.debug("Speed History", recording.speedHistory)
    console.debug("Metrics History", recording.metricsHistory)

    recording.speedHistory = []
    recording.metricsHistory = []
}

// #### Simulation Functions
function simulateMetricsChange() {
    metrics.forEach((metric) => {
        const metricRecord = {
            name: metric.name,
            score: Math.floor(Math.random() * 80) + 20, // Random metric between 20 and 100
            timestamp: Date.now()
        };

        recording.metricsHistory.push(metricRecord)

        updateMetricsScore(metricRecord)
    })
}

function simulateSpeedChange() {
    const speedRecord = {
        timestamp: Date.now(),
        speed: Math.floor(Math.random() * 120) + 60 // Random speed between 60 and 120
    };

    recording.speedometer.textContent = `${speedRecord.speed}`
    recording.speedHistory.push(speedRecord);

    updateChartWith(recording.chart, recording.chartElement, speedRecord.timestamp, speedRecord.speed);
}