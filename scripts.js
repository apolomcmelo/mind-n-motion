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
    speedChart: null,
    speedChartElement: document.getElementById('speedChart').getContext('2d'),
    speedHistory: [],
    metricsHistory: [],
    journeyCoordinates: []
}

appProperties.dom.startStopButton.addEventListener('click', (event) => {
    if (appProperties.watchId) { // It is stopping
        navigator.geolocation.clearWatch(appProperties.watchId);

        appProperties.watchId = null;
        localStorage.setItem("SpeedHistory", JSON.stringify(appProperties.speedHistory))

        metrics.forEach(metric => {
            const singleMetricHistory = appProperties.metricsHistory.filter(m => m.name === metric.name)
            localStorage.setItem(`${metric.name}History`, JSON.stringify(singleMetricHistory))
        })

        console.debug("Speed History", appProperties.speedHistory)
        console.debug("Metrics History", appProperties.metricsHistory)

        appProperties.speedHistory = []
        appProperties.metricsHistory = []
    } else { // It is starting
        localStorage.clear()
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

function updateMetricsScore(metric) {
    appProperties.metricsHistory.push({name: metric.name, score: metric.score, timestamp: Date.now()})

    const radius = 28; // Radius of the ring bars
    const circumference = 2 * Math.PI * radius;

    const metricElement = document.getElementById(`${metric.name.toLowerCase()}-metric`)
    const progressCircle = metricElement.getElementsByClassName("progress-ring")[0]
    const scoreLabel = metricElement.getElementsByClassName("percentage-label")[0]

    progressCircle.setAttribute('stroke-dasharray', `${circumference}`);
    progressCircle.setAttribute('stroke-dashoffset', `${circumference - (metric.score / 100) * circumference}`);
    scoreLabel.textContent = `${metric.score}`;
}

function updateSpeed(position) {
    const speedInKmPerHour = Math.round(position.coords.speed * 3.6);

    appProperties.dom.speedometer.textContent = `${speedInKmPerHour}`

    updateChartWith({timestamp: position.timestamp, speed: speedInKmPerHour})
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

function startServiceWorker() {
    navigator.serviceWorker.register('./service-worker.js', {
        scope: './'
    });
}

function initSpeedChart() {
    appProperties.speedChart = new Chart(appProperties.speedChartElement, {
        type: 'line',
        data: {
            labels: appProperties.speedHistory.map(data => { formatTimestamp(data.timestamp)}), // X-axis labels
            datasets: [{
                label: 'Speed (km/h)',
                data: appProperties.speedHistory.map(data => data.speed), // Y-axis data
                borderColor: createChartGradient(appProperties.speedChartElement),
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
                    grid: { color: '#393939' }
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

function updateChartWith(newDataPoint) {
    appProperties.speedHistory.push(newDataPoint);

    appProperties.speedChart.data.labels.push(formatTimestamp(newDataPoint.timestamp));

    appProperties.speedChart.data.datasets[0].data.push(newDataPoint.speed);
    appProperties.speedChart.data.datasets[0].borderColor = createChartGradient(appProperties.speedChartElement);

    appProperties.speedChart.update();
}

function createChartGradient(chartElement) {
    // Create the gradient for the line
    const gradient = chartElement.createLinearGradient(0, 0, chartElement.canvas.width, 0);
    gradient.addColorStop(0, '#9D00FF');
    gradient.addColorStop(0.25, '#00F0FF');

    return gradient;
}

function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleTimeString('en-US', {hour12: false});
}

function simulateMetricsChange() {
    metrics.forEach((metric) => {
        metric.score = Math.floor(Math.random() * 80) + 20 // Random metric between 20 and 100
        updateMetricsScore(metric)
    })
}

function simulateSpeedChange() {
    const newTimestamp = Date.now();
    const newSpeed = Math.floor(Math.random() * 120) + 60; // Random speed between 60 and 120
    appProperties.dom.speedometer.textContent = `${newSpeed}`
    updateChartWith({timestamp: newTimestamp, speed: newSpeed});
}

window.onload = () => {
    metrics.forEach(metric => updateMetricsScore(metric))
    getCurrentLocation()
    initSpeedChart()
    startServiceWorker()

    // Simulate adding new data points every 5 seconds
    setInterval(() => {
        simulateMetricsChange();
        simulateSpeedChange();
    }, 2000);
}