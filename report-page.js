

const report = {
    dom: {
        speed: {
            max: document.getElementById('maxSpeed'),
            avg: document.getElementById('avgSpeed')
        },
        metrics: {
            interest: {
                max: document.getElementById('maxInterest'),
                avg: document.getElementById('avgInterest')
            },
            excitement: {
                max: document.getElementById('maxExcitement'),
                avg: document.getElementById('avgExcitement')
            },
            attention: {
                max: document.getElementById('maxAttention'),
                avg: document.getElementById('avgAttention')
            },
            engagement: {
                max: document.getElementById('maxEngagement'),
                avg: document.getElementById('avgEngagement')
            },
            relaxation: {
                max: document.getElementById('maxRelaxation'),
                avg: document.getElementById('avgRelaxation')
            },
            stress: {
                max: document.getElementById('maxStress'),
                avg: document.getElementById('avgStress')
            },
        }
    },
    map: null,
    chart: null,
    chartElement: document.getElementById('reportChart').getContext('2d'),
    metricsHistory: [],
    journeyCoordinates: []
}

// #### Map
function initReportMap() {
    const coordinates = localStorage.getItem("JourneyCoordinates")

    if(coordinates) {
        const parsedCoordinates = JSON.parse(coordinates)
        const latLong = parsedCoordinates[0];

        report.map = L.map('report-map').setView(latLong, 15);
        // Add OpenStreetMap tile layer
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; Apolo Mc Melo'
        }).addTo(report.map);

        L.polyline(parsedCoordinates, { color: 'blue' }).addTo(report.map);

        L.marker(latLong).addTo(report.map);
        L.marker(parsedCoordinates[parsedCoordinates.length - 1]).addTo(report.map);
    }
}

function createSpeedDataset(data) {
    return {
        label: 'Speed',
        data: data.map(dataPoint => ({
            x: formatTimestamp(dataPoint.timestamp),
            y: dataPoint.speed
        })),
        borderColor: createChartVerticalGradient(report.chartElement),
        // backgroundColor: 'rgba(0, 255, 255, 0.2)', // Semi-transparent fill
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        tension: 0.4,
    }
}

function createMetricDataset(data, colour) {
    return {
        label: data[0].name,
        data: data.map(dataPoint => ({
            x: formatTimestamp(dataPoint.timestamp),
            y: dataPoint.score
        })),
        borderColor: colour,
        // backgroundColor: colour,
        // borderDash: [3, 3], // Dotted line
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        tension: 0.4,
    }
}
// #### Report
function initReportChart(parsedSpeedHistory, parsedInterestHistory, parsedExcitementHistory, parsedAttentionHistory, parsedEngagementHistory, parsedRelaxationHistory, parsedStressHistory) {
    if(report.chart) {
        report.chart.update()
    } else {
        let datasets = []

        datasets.push(createSpeedDataset(parsedSpeedHistory))
        datasets.push(createMetricDataset(parsedInterestHistory, 'rgba(55, 124, 200, 0.5)'))
        datasets.push(createMetricDataset(parsedExcitementHistory, 'rgba(210, 151, 20, 0.5)'))
        datasets.push(createMetricDataset(parsedAttentionHistory, 'rgba(121, 126, 219, 0.5)'))
        datasets.push(createMetricDataset(parsedEngagementHistory, 'rgba(25, 168, 83, 0.5)'))
        datasets.push(createMetricDataset(parsedRelaxationHistory, 'rgba(83, 199, 201, 0.5)'))
        datasets.push(createMetricDataset(parsedStressHistory, 'rgba(223, 65, 52, 0.5)'))

        report.chart = new Chart(report.chartElement, {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'category', // Use formatted timestamps for X-axis
                        beginAtZero: true,
                        border: {
                            display: false
                        }
                    },
                    y: {
                        title: { display: false, text: 'Value' },
                        ticks: { autoSkip: true, maxTicksLimit: 10 },
                        beginAtZero: true,
                        border: { display: false },
                        grid: { color: '#282828' }
                    }
                },
                plugins: {
                    legend: {
                        display: true, // Display the legend
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            useBorderRadius: true,
                            borderRadius: 6
                        }
                    }
                }
            }
        });
    }
}

// #### Business Logic
function generateReport() {
    const speedHistory = localStorage.getItem("SpeedHistory")
    const interestHistory = localStorage.getItem("InterestHistory")
    const excitementHistory = localStorage.getItem("ExcitementHistory")
    const attentionHistory = localStorage.getItem("AttentionHistory")
    const engagementHistory = localStorage.getItem("EngagementHistory")
    const relaxationHistory = localStorage.getItem("RelaxationHistory")
    const stressHistory = localStorage.getItem("StressHistory")

    if(speedHistory) {
        const parsedSpeedHistory = JSON.parse(speedHistory)
        const parsedInterestHistory = JSON.parse(interestHistory)
        const parsedExcitementHistory = JSON.parse(excitementHistory)
        const parsedAttentionHistory = JSON.parse(attentionHistory)
        const parsedEngagementHistory = JSON.parse(engagementHistory)
        const parsedRelaxationHistory = JSON.parse(relaxationHistory)
        const parsedStressHistory = JSON.parse(stressHistory)

        const speedArray = parsedSpeedHistory.map(data => data.speed)
        const interestArray = parsedInterestHistory.map(data => data.score)
        const excitementArray = parsedExcitementHistory.map(data => data.score)
        const attentionArray = parsedAttentionHistory.map(data => data.score)
        const engagementArray = parsedEngagementHistory.map(data => data.score)
        const relaxationArray = parsedRelaxationHistory.map(data => data.score)
        const stressArray = parsedStressHistory.map(data => data.score)

        updateInfo(speedArray, report.dom.speed, "km/h")
        updateInfo(interestArray, report.dom.metrics.interest, "")
        updateInfo(excitementArray, report.dom.metrics.excitement, "")
        updateInfo(attentionArray, report.dom.metrics.attention, "")
        updateInfo(engagementArray, report.dom.metrics.engagement, "")
        updateInfo(relaxationArray, report.dom.metrics.relaxation, "")
        updateInfo(stressArray, report.dom.metrics.stress, "")

        initReportMap()
        initReportChart(parsedSpeedHistory, parsedInterestHistory, parsedExcitementHistory, parsedAttentionHistory, parsedEngagementHistory, parsedRelaxationHistory, parsedStressHistory)
    }
}