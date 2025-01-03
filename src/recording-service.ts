import * as L from "leaflet";
import {LatLng} from "leaflet";
import {DataPoint} from "./models/data-point";
import {Utils} from "./utils";
import Chart from 'chart.js/auto';
import {MetricElement} from "./models/metric-element";
import {MetricRecord} from "./models/metric-record";
import {properties} from "./configuration/properties";
import {DataStream, EmotivService} from "emotiv-ts";

export class RecordingService {
    emotivService: EmotivService
    emotivConnected: boolean = false
    metricsIndexMap: Map<string, number>

    metrics: MetricElement[] = []
    speedometer: HTMLElement
    map: L.Map
    watchId?: number
    chart: any
    chartElement: CanvasRenderingContext2D
    speedHistory: DataPoint[] = []
    metricsHistory: MetricRecord[] = []
    journeyCoordinates: LatLng[] = []

    logElement: HTMLElement

    constructor() {
        this.metricsIndexMap = new Map()

        this.metricsIndexMap.set("attention", 1)
        this.metricsIndexMap.set("engagement", 3)
        this.metricsIndexMap.set("excitement", 5)
        this.metricsIndexMap.set("stress", 8)
        this.metricsIndexMap.set("relaxation", 10)
        this.metricsIndexMap.set("interest", 12)

        this.speedometer = document.getElementById("speedometer")
        this.chartElement = (document.getElementById('speedChart') as HTMLCanvasElement).getContext('2d')

        // Remove after debuging on Mobile
        this.logElement = document.getElementById("log")

        this.initMetrics()
        this.initChart()
        this.getCurrentLocation()

        this.connectEmotiv()
    }

    public logOnScreen(message: string, level: string = "info") {
        let log = document.createElement("span")
        log.textContent = message
        log.classList.add(level)

        this.logElement.appendChild(log)
    }

    private connectEmotiv() {
        console.log("Connecting to Emotiv...")
        this.logOnScreen("Connecting to Emotiv...");
        this.logOnScreen("Emotiv URL: " + properties.emotiv.url, "debug")
        this.logOnScreen("Emotiv Credentials: " + JSON.stringify(properties.emotiv.credentials), "debug")

        try {
            this.emotivService = new EmotivService(properties.emotiv.url, properties.emotiv.credentials);
            this.emotivService.connect()
                .then(() => {
                    this.emotivConnected = true;
                    this.logOnScreen("Connected to Emotiv.")
                })
                .catch((error) => {
                    console.error(error)
                    this.logOnScreen(error, "error")
                    window.alert(error)
                })
        } catch (error) {
            console.error(error)
            this.logOnScreen(error, "error")
            window.alert(error)
        }
    }

    public startRecording() {
        this.resetData();

        // Record Metrics by subscribing to Emotiv
        if(this.emotivConnected) {
            this.emotivService.readData([DataStream.METRICS], (dataStream) => this.handleMetricsSubscription(dataStream))

            // Record the Position and Speed
            this.watchId = navigator.geolocation.watchPosition(
                (position) => {
                    console.debug("Coordinates", position.coords)
                    this.logOnScreen("Coordinates: " + JSON.stringify(position.coords), "debug")
                    // const currentSpeedInKmPerHour = Math.round(position.coords.speed * 3.6)
                    const currentLatLngCoordinate = L.latLng(
                        position.coords.latitude,
                        position.coords.longitude
                    )
                    this.updateSpeed(this.getSpeedRecord(currentLatLngCoordinate))
                    this.updatePositionOnMap(currentLatLngCoordinate)
                },
                (error) => {
                    console.error("Error watching the position", error)
                    this.logOnScreen("Error watching the position: " + JSON.stringify(error), "error")
                },
                { enableHighAccuracy: true }
            );
        } else {
            window.alert("EMOTIV not connected")
            this.connectEmotiv()
        }
    }

    private getSpeedRecord(latLngCoordinates: LatLng) {
        const now = new Date();

        if(this.speedHistory.length > 0 && this.journeyCoordinates.length > 0) {
            let previousTime = this.speedHistory[this.speedHistory.length-1].timestamp
            let previousLatLng = this.journeyCoordinates[this.journeyCoordinates.length-1]

            const elapsedTime = (now.getTime() - previousTime) / 1000; // In seconds
            const distance = previousLatLng.distanceTo(latLngCoordinates);
            console.debug("Distance", distance)
            console.debug("Elapsed time: ", elapsedTime, "debug")
            this.logOnScreen("Distance: " + distance, "debug")
            this.logOnScreen("Elapsed time: " + elapsedTime, "debug")

            const currentSpeedInKmPerHour = Math.round((distance / elapsedTime) * 3.6);
            console.debug("Speed", currentSpeedInKmPerHour)
            this.logOnScreen("Speed: " + currentSpeedInKmPerHour, "debug")
            return new DataPoint(now.getTime(), currentSpeedInKmPerHour);
        }

        return new DataPoint(now.getTime(), 0)
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
        this.logOnScreen("Speed History: " + JSON.stringify(this.speedHistory), "debug")
        this.logOnScreen("Metrics History: " + JSON.stringify(this.metricsHistory), "debug")
        this.logOnScreen("Journey Coordinates: " + JSON.stringify(this.journeyCoordinates), "debug")

        // Unsubscribe Emotiv data stream
    }

    private resetData() {
        this.logOnScreen("Resetting data...")
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
    private handleMetricsSubscription(dataStream: any) {
        let metricsScores = dataStream[DataStream.METRICS];

        if (metricsScores) {
            this.metrics.forEach((metric) => {
                const metricRecord = new MetricRecord(
                    metric.name.toLowerCase(),
                    new DataPoint(
                        dataStream['time'] * 1000, // The Emotiv stream returns the timestamp in seconds, so converting here to ms
                        Math.round(metricsScores[this.metricsIndexMap.get(metric.name)] * 100)
                    )
                )

                this.updateMetric(metricRecord)
            })

        }
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
                labels: this.speedHistory.map(data => Utils.timestampToDate(data.timestamp)),
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
                (error) => {
                    console.error("Error getting the current location", error)
                    this.logOnScreen("Error getting the current location: " + JSON.stringify(error), "error")
                },
                { enableHighAccuracy: true }
            );
        } else {
            console.warn("Geolocation is not supported by this browser.");
            this.logOnScreen("Geolocation is not supported by this browser.", "warn")
        }
    }

    private initMap(coordinates: GeolocationCoordinates) {
        const latLng = new LatLng(coordinates.latitude,coordinates.longitude);
        this.map = L.map('map').setView(latLng, 19).panTo(latLng);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; Apolo Mc Melo'
        }).addTo(this.map);

        L.marker(latLng).addTo(this.map);
    }

    private updatePositionOnMap(latLngCoordinates: LatLng) {
        this.journeyCoordinates.push(latLngCoordinates);
        this.map.setView(latLngCoordinates, 18);
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