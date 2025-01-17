import * as L from "leaflet";
import {LatLng} from "leaflet";
import {DataPoint} from "./models/data-point";
import {Utils} from "./utils";
import Chart from 'chart.js/auto';
import {MetricElement} from "./models/metric-element";
import {MetricRecord} from "./models/metric-record";
import {properties} from "./configuration/properties";
import {DataStream, EmotivService} from "emotiv-ts";
import {Recording} from "./models/recording";
import {Subject} from "./models/subject";
import {Gender} from "./enums/genders";
import {Vehicle} from "./models/vehicle";

export class RecordingService {
    emotivService: EmotivService
    emotivConnected: boolean = false
    metricsIndexMap: Map<string, number>

    performanceMetrics: MetricElement[] = []
    speedometer: HTMLElement
    map: L.Map
    watchId?: number
    chart: any
    chartElement: CanvasRenderingContext2D

    recording: Recording
    // Remove the hardcoded Subject and Vehicle
    subject = new Subject("Apolo Melo", 25, "England", Gender.MALE)
    vehicle = new Vehicle("car", "Mini", "Cooper", 123)

    constructor() {
        this.metricsIndexMap =
            new Map([
                ["attention", 1],
                ["engagement", 3],
                ["excitement", 5],
                ["stress", 8],
                ["relaxation", 10],
                ["interest", 12]
            ]);

        this.speedometer = document.getElementById("speedometer")
        this.chartElement = (document.getElementById('speedChart') as HTMLCanvasElement).getContext('2d')

        this.initPerformanceMetrics()
        this.initChart()
        this.getCurrentLocation()

        this.connectEmotiv()
    }

    private connectEmotiv() {
        Utils.log("Connecting to Emotiv...");
        Utils.log("Emotiv URL: " + properties.emotiv.url, "debug")
        Utils.log("Emotiv Credentials: " + JSON.stringify(properties.emotiv.credentials), "debug")

        try {
            this.emotivService = new EmotivService(properties.emotiv.url, properties.emotiv.credentials);
            this.emotivService.connect()
                .then(() => {
                    this.emotivConnected = true;
                    Utils.log("Connected to Emotiv.")
                })
                .catch((error) => {
                    Utils.log(error, "error")
                    window.alert(error)
                })
        } catch (error) {
            Utils.log(error, "error")
            window.alert(error)
        }
    }

    public startRecording() {
        this.resetData();

        if(this.emotivConnected) {
            this.recording = new Recording(this.subject, this.vehicle)

            // Record Metrics by subscribing to Emotiv
            this.emotivService.readData([DataStream.METRICS], (dataStream) => this.handleMetricsSubscription(dataStream))

            // Record the Position and Speed
            this.watchId = navigator.geolocation.watchPosition(
                (position) => this.handleGeolocationSubscription(position),
                (error) => Utils.log("Error watching the position: " + JSON.stringify(error), "error"),
                { enableHighAccuracy: true }
            )
        } else {
            window.alert("EMOTIV not connected")
            this.connectEmotiv()
        }
    }

    private handleGeolocationSubscription(position: GeolocationPosition) {
        Utils.log("Coordinates: " + JSON.stringify(position.coords), "debug")

        const currentSpeedInKmPerHour = Math.round(position.coords.speed * 3.6) // Convert m/s to km/h
        const currentLatLngCoordinate = L.latLng(
            position.coords.latitude,
            position.coords.longitude
        )

        this.updateSpeed(new DataPoint(new Date().getTime(), currentSpeedInKmPerHour))
        this.updatePositionOnMap(currentLatLngCoordinate)
    }

// Deprecating since the mobile version returns the speed in the coordinates
    private getSpeedRecord(latLngCoordinates: LatLng) {
        const now = new Date();

        if(this.recording.speedRecords.length > 0 && this.recording.journeyCoordinates.length > 0) {
            let previousTime = this.recording.speedRecords[this.recording.speedRecords.length-1].data.timestamp
            let previousLatLng = this.recording.journeyCoordinates[this.recording.journeyCoordinates.length-1]

            const elapsedTime = (now.getTime() - previousTime) / 1000; // In seconds
            const distance = previousLatLng.distanceTo(latLngCoordinates);
            Utils.log("Distance: " + distance, "debug")
            Utils.log("Elapsed time: " + elapsedTime, "debug")

            const currentSpeedInKmPerHour = Math.round((distance / elapsedTime) * 3.6);
            Utils.log("Speed: " + currentSpeedInKmPerHour, "debug")
            return new DataPoint(now.getTime(), currentSpeedInKmPerHour);
        }

        return new DataPoint(now.getTime(), 0)
    }

    public stopRecording() {
        this.recording.finalTimestamp = Date.now()
        navigator.geolocation.clearWatch(this.watchId);

        this.watchId = null;

        localStorage.setItem("recording", JSON.stringify(this.recording))

        Utils.log("Speed History: " + JSON.stringify(this.recording.speedRecords), "debug")
        Utils.log("Metrics History: " + JSON.stringify(this.recording.metricRecords.filter(metric => metric.name != "speed")), "debug")
        Utils.log("Journey Coordinates: " + JSON.stringify(this.recording.journeyCoordinates), "debug")

        // Unsubscribe Emotiv data stream
        this.emotivService.dataStreamService.unsubscribe([DataStream.METRICS], Utils.log)
    }

    private resetData() {
        Utils.log("Resetting data...")
        localStorage.clear();
    }

    // #### Metrics
    private initPerformanceMetrics() {
        Utils.performanceMetrics().forEach(metric => {
            const metricElement = new MetricElement(metric.toString().toLowerCase());
            metricElement.setScore(0)

            this.performanceMetrics.push(metricElement)
        })
    }
    private updateMetric(metricRecord: MetricRecord) {
        this.recording.metricRecords.push(metricRecord)

        this.performanceMetrics.find(m => m.name == metricRecord.name).setScore(metricRecord.data.value)
    }
    private handleMetricsSubscription(dataStream: any) {
        let metricsScores = dataStream[DataStream.METRICS];

        if (metricsScores) {
            this.performanceMetrics.forEach((metric) => {
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
        this.recording.metricRecords.push(new MetricRecord("speed", speedRecord));
        Utils.log("Speed: " + speedRecord.value, "debug")
        Utils.log("Metrics Record: " + JSON.stringify(this.recording.metricRecords), "debug")

        this.speedometer.textContent = `${speedRecord.value}`
        Utils.updateChartWith(this.chart, this.chartElement, speedRecord);
    }

    private initChart() {
        this.chart = new Chart(this.chartElement, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Speed (km/h)',
                    data: [],
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
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: 4,
                            font: {
                                size: Utils.getChartLabelFontSize()
                            }
                        },
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
                (position) => this.initMap(position.coords),
                (error) => Utils.log("Error getting the current location: " + JSON.stringify(error), "error"),
                { enableHighAccuracy: true }
            );
        } else {
            Utils.log("Geolocation is not supported by this browser.", "warn")
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
        this.recording.journeyCoordinates.push(latLngCoordinates);
        this.map.setView(latLngCoordinates, 18);
    }

    // #### Simulation Functions
    public simulateMetricsChange(timestamp: number) {
        this.performanceMetrics.forEach((metric) => {
            const metricRecord = new MetricRecord(metric.name.toLowerCase(), new DataPoint(timestamp, Math.round(Math.random() * 80) + 20))// Random metric between 20 and 100

            this.updateMetric(metricRecord)
        })
    }

    public simulateSpeedChange(timestamp: number) {
        const speedRecord = new DataPoint(timestamp, Math.floor(Math.random() * 120) + 60) // Random speed between 60 and 120

        this.updateSpeed(speedRecord)
    }
}