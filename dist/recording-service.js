import * as L from "../_snowpack/pkg/leaflet.js";
import {LatLng} from "../_snowpack/pkg/leaflet.js";
import {DataPoint} from "./models/data-point.js";
import {Utils} from "./utils.js";
import Chart from "../_snowpack/pkg/chartjs/auto.js";
import {MetricElement} from "./models/metric-element.js";
import {MetricRecord} from "./models/metric-record.js";
import {properties} from "./configuration/properties.js";
import {DataStream, EmotivService} from "../_snowpack/pkg/emotiv-ts.js";
import {Recording} from "./models/recording.js";
import {Subject} from "./models/subject.js";
import {Gender} from "./enums/genders.js";
import {Vehicle} from "./models/vehicle.js";
export class RecordingService {
  constructor() {
    this.emotivConnected = false;
    this.performanceMetrics = [];
    this.subject = new Subject("Apolo Melo", 25, "England", Gender.MALE);
    this.vehicle = new Vehicle("car", "Mini", "Cooper", 123);
    this.metricsIndexMap = new Map([
      ["attention", 1],
      ["engagement", 3],
      ["excitement", 5],
      ["stress", 8],
      ["relaxation", 10],
      ["interest", 12]
    ]);
    this.speedometer = document.getElementById("speedometer");
    this.chartElement = document.getElementById("speedChart").getContext("2d");
    this.initPerformanceMetrics();
    this.initChart();
    this.getCurrentLocation();
    this.connectEmotiv();
  }
  connectEmotiv() {
    Utils.log("Connecting to Emotiv...");
    Utils.log("Emotiv URL: " + properties.emotiv.url, "debug");
    Utils.log("Emotiv Credentials: " + JSON.stringify(properties.emotiv.credentials), "debug");
    try {
      this.emotivService = new EmotivService(properties.emotiv.url, properties.emotiv.credentials);
      this.emotivService.connect().then(() => {
        this.emotivConnected = true;
        Utils.log("Connected to Emotiv.");
      }).catch((error) => {
        Utils.log(error, "error");
        window.alert(error);
      });
    } catch (error) {
      Utils.log(error, "error");
      window.alert(error);
    }
  }
  startRecording() {
    this.resetData();
    if (this.emotivConnected) {
      this.recording = new Recording(this.subject, this.vehicle);
      this.emotivService.readData([DataStream.METRICS], (dataStream) => this.handleMetricsSubscription(dataStream));
      this.watchId = navigator.geolocation.watchPosition((position) => this.handleGeolocationSubscription(position), (error) => Utils.log("Error watching the position: " + JSON.stringify(error), "error"), {enableHighAccuracy: true});
    } else {
      window.alert("EMOTIV not connected");
      this.connectEmotiv();
    }
  }
  handleGeolocationSubscription(position) {
    Utils.log("Coordinates: " + JSON.stringify(position.coords), "debug");
    const currentSpeedInKmPerHour = Math.round(position.coords.speed * 3.6);
    const currentLatLngCoordinate = L.latLng(position.coords.latitude, position.coords.longitude);
    this.updateSpeed(new DataPoint(new Date().getTime(), currentSpeedInKmPerHour));
    this.updatePositionOnMap(currentLatLngCoordinate);
  }
  getSpeedRecord(latLngCoordinates) {
    const now = new Date();
    if (this.recording.speedRecords.length > 0 && this.recording.journeyCoordinates.length > 0) {
      let previousTime = this.recording.speedRecords[this.recording.speedRecords.length - 1].data.timestamp;
      let previousLatLng = this.recording.journeyCoordinates[this.recording.journeyCoordinates.length - 1];
      const elapsedTime = (now.getTime() - previousTime) / 1e3;
      const distance = previousLatLng.distanceTo(latLngCoordinates);
      Utils.log("Distance: " + distance, "debug");
      Utils.log("Elapsed time: " + elapsedTime, "debug");
      const currentSpeedInKmPerHour = Math.round(distance / elapsedTime * 3.6);
      Utils.log("Speed: " + currentSpeedInKmPerHour, "debug");
      return new DataPoint(now.getTime(), currentSpeedInKmPerHour);
    }
    return new DataPoint(now.getTime(), 0);
  }
  stopRecording() {
    this.recording.finalTimestamp = Date.now();
    navigator.geolocation.clearWatch(this.watchId);
    this.watchId = null;
    localStorage.setItem("recording", JSON.stringify(this.recording));
    Utils.log("Speed History: " + JSON.stringify(this.recording.speedRecords), "debug");
    Utils.log("Metrics History: " + JSON.stringify(this.recording.metricRecords.filter((metric) => metric.name != "speed")), "debug");
    Utils.log("Journey Coordinates: " + JSON.stringify(this.recording.journeyCoordinates), "debug");
    this.emotivService.dataStreamService.unsubscribe([DataStream.METRICS], Utils.log);
  }
  resetData() {
    Utils.log("Resetting data...");
    localStorage.clear();
  }
  initPerformanceMetrics() {
    Utils.performanceMetrics().forEach((metric) => {
      const metricElement = new MetricElement(metric.toString().toLowerCase());
      metricElement.setScore(0);
      this.performanceMetrics.push(metricElement);
    });
  }
  updateMetric(metricRecord) {
    this.recording.metricRecords.push(metricRecord);
    this.performanceMetrics.find((m) => m.name == metricRecord.name).setScore(metricRecord.data.value);
  }
  handleMetricsSubscription(dataStream) {
    let metricsScores = dataStream[DataStream.METRICS];
    if (metricsScores) {
      this.performanceMetrics.forEach((metric) => {
        const metricRecord = new MetricRecord(metric.name.toLowerCase(), new DataPoint(dataStream["time"] * 1e3, Math.round(metricsScores[this.metricsIndexMap.get(metric.name)] * 100)));
        this.updateMetric(metricRecord);
      });
    }
  }
  updateSpeed(speedRecord) {
    this.recording.metricRecords.push(new MetricRecord("speed", speedRecord));
    Utils.log("Speed: " + speedRecord.value, "debug");
    Utils.log("Metrics Record: " + JSON.stringify(this.recording.metricRecords), "debug");
    this.speedometer.textContent = `${speedRecord.value}`;
    Utils.updateChartWith(this.chart, this.chartElement, speedRecord);
  }
  initChart() {
    this.chart = new Chart(this.chartElement, {
      type: "line",
      data: {
        labels: [],
        datasets: [{
          label: "Speed (km/h)",
          data: [],
          borderColor: Utils.createChartHorizontalGradient(this.chartElement),
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
          tension: 0.4
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
            title: {display: false, text: "Speed (km/h)"},
            ticks: {
              autoSkip: true,
              maxTicksLimit: 4,
              font: {
                size: Utils.getChartLabelFontSize()
              }
            },
            beginAtZero: true,
            border: {display: false},
            grid: {color: "#282828"}
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
  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => this.initMap(position.coords), (error) => Utils.log("Error getting the current location: " + JSON.stringify(error), "error"), {enableHighAccuracy: true});
    } else {
      Utils.log("Geolocation is not supported by this browser.", "warn");
    }
  }
  initMap(coordinates) {
    const latLng = new LatLng(coordinates.latitude, coordinates.longitude);
    this.map = L.map("map").setView(latLng, 19).panTo(latLng);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; Apolo Mc Melo"
    }).addTo(this.map);
    L.marker(latLng).addTo(this.map);
  }
  updatePositionOnMap(latLngCoordinates) {
    this.recording.journeyCoordinates.push(latLngCoordinates);
    this.map.setView(latLngCoordinates, 18);
  }
  simulateMetricsChange(timestamp) {
    this.performanceMetrics.forEach((metric) => {
      const metricRecord = new MetricRecord(metric.name.toLowerCase(), new DataPoint(timestamp, Math.round(Math.random() * 80) + 20));
      this.updateMetric(metricRecord);
    });
  }
  simulateSpeedChange(timestamp) {
    const speedRecord = new DataPoint(timestamp, Math.floor(Math.random() * 120) + 60);
    this.updateSpeed(speedRecord);
  }
}
