

const report = {
    map: null,
    chart: null,
    chartElement: document.getElementById('reportChart').getContext('2d'),
    speedHistory: [],
    metricsHistory: [],
    journeyCoordinates: []
}

// #### Map
function initMap(position) {
    const latLong = [position.latitude,position.longitude];
    report.map = L.map('map').setView(latLong, 18);
    // Add OpenStreetMap tile layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; Apolo Mc Melo'
    }).addTo(report.map);

    L.marker(latLong).addTo(report.map);
}

function updatePositionOnMap(position) {
    const latLong = [position.latitude,position.longitude];

    report.journeyCoordinates.push(latLong);
    report.map.setView(latLong, 18);

    L.polyline(report.journeyCoordinates, { color: 'blue' }).addTo(report.map);
}

// #### Report
function initReportChart() {
    report.reportChart = new Chart(report.chartElement, {
        type: 'line',
        data: {
            labels: report.speedHistory.map(data => { formatTimestamp(data.timestamp)}), // X-axis labels
            datasets: [{
                label: 'Speed (km/h)',
                data: report.speedHistory.map(data => data.speed), // Y-axis data
                borderColor: createChartGradient(report.chartElement),
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

// #### Business Logic
