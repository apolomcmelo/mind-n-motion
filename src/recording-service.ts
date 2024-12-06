import * as L from "leaflet";
import {DataPoint} from "./models/data-point";
import {Utils} from "./utils";
import {LatLng} from "leaflet";
import Chart from 'chart.js/auto';
import {MetricElement} from "./models/metric-element";
import {MetricRecord} from "./models/metric-record";

export class RecordingService {
    metrics: MetricElement[] = []
    speedometer: HTMLElement
    map: L.Map
    watchId?: number
    chart: any
    chartElement: CanvasRenderingContext2D
    speedHistory: DataPoint[] = []
    metricsHistory: MetricRecord[] = []
    journeyCoordinates: LatLng[] = []

    constructor() {
        this.speedometer = document.getElementById("speedometer")
        this.chartElement = (document.getElementById('speedChart') as HTMLCanvasElement).getContext('2d')

        this.initMetrics()
        this.initChart()
        this.getCurrentLocation()
    }

    public startRecording() {
        this.resetData();

        // Record the Position and Speed
        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                const currentSpeedInKmPerHour = Math.round(position.coords.speed * 3.6)

                this.updatePositionOnMap(position.coords)
                this.updateSpeed(new DataPoint(position.timestamp, currentSpeedInKmPerHour))
            },
            (error) => console.error("Error watching the position", error),
            { enableHighAccuracy: true }
        );

        // Record Metrics by subscribing to Emotiv
    }

    public stopRecording() {
        navigator.geolocation.clearWatch(this.watchId);

        this.watchId = null;

        localStorage.setItem("speedHistory", JSON.stringify(this.speedHistory))
        localStorage.setItem("journeyCoordinates", JSON.stringify(this.journeyCoordinates))

        Utils.allMetrics().forEach(metric => {
            const lowerCaseMetric = metric.toString().toLowerCase()
            const singleMetricHistory = this.metricsHistory.filter(m => m.name === lowerCaseMetric)
            localStorage.setItem(`${lowerCaseMetric}History`, JSON.stringify(singleMetricHistory))
        })

        console.debug("Speed History", this.speedHistory)
        console.debug("Metrics History", this.metricsHistory)
        console.debug("Journey Coordinates", this.journeyCoordinates)
    }

    private resetData() {
        localStorage.clear();
        this.speedHistory = []
        this.metricsHistory = []
        this.journeyCoordinates = []
    }

    // #### Metrics
    private initMetrics() {
        Utils.allMetrics().forEach(metric => {
            const metricElement = new MetricElement(metric.toString().toLowerCase());
            metricElement.setScore(0)

            this.metrics.push(metricElement)
        })
    }
    private updateMetric(metricRecord: MetricRecord) {
        this.metricsHistory.push(metricRecord)

        this.metrics.find(m => m.name == metricRecord.name).setScore(metricRecord.data.value)
    }

    // #### Speed
    private updateSpeed(speedRecord: DataPoint) {
        this.speedHistory.push(speedRecord);

        this.speedometer.textContent = `${speedRecord.value}`
        Utils.updateChartWith(this.chart, this.chartElement, speedRecord);
    }

    private initChart() {
        this.chart = new Chart(this.chartElement, {
            type: 'line',
            data: {
                labels: this.speedHistory.map(data => data.timestamp),
                datasets: [{
                    label: 'Speed (km/h)',
                    data: this.speedHistory.map(data => data.value),
                    borderColor: Utils.createChartHorizontalGradient(this.chartElement),
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                    tension: 0.4,
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
    private getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.initMap(position.coords)
                },
                (error) => console.error("Error getting the current location", error),
                { enableHighAccuracy: true }
            );
        } else {
            console.warn("Geolocation is not supported by this browser.");
        }
    }

    private initMap(coordinates: GeolocationCoordinates) {
        const latLng = new LatLng(coordinates.latitude,coordinates.longitude);
        this.map = L.map('map').setView(latLng, 18);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; Apolo Mc Melo'
        }).addTo(this.map);

        L.marker(latLng).addTo(this.map);
    }

    private updatePositionOnMap(coordinates: GeolocationCoordinates) {
        const latLng = new LatLng(coordinates.latitude,coordinates.longitude);

        this.journeyCoordinates.push(latLng);
        this.map.setView(latLng, 18);
    }

    // #### Simulation Functions
    public simulateMetricsChange(timestamp: number) {
        this.metrics.forEach((metric) => {
            const metricRecord = new MetricRecord(metric.name.toLowerCase(), new DataPoint(timestamp, Math.round(Math.random() * 80) + 20))// Random metric between 20 and 100

            this.updateMetric(metricRecord)
        })
    }

    public simulateSpeedChange(timestamp: number) {
        const speedRecord = new DataPoint(timestamp, Math.floor(Math.random() * 120) + 60) // Random speed between 60 and 120

        this.speedHistory.push(speedRecord);

        this.updateSpeed(speedRecord)
    }
}