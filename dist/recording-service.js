import * as L from "../_snowpack/pkg/leaflet.js";
import {DataPoint} from "./models/data-point.js";
import {Utils} from "./utils.js";
import {LatLng} from "../_snowpack/pkg/leaflet.js";
import Chart from "../_snowpack/pkg/chartjs/auto.js";
import {MetricElement} from "./models/metric-element.js";
import {MetricRecord} from "./models/metric-record.js";
export class RecordingService {
  constructor() {
    this.metrics = [];
    this.speedHistory = [];
    this.metricsHistory = [];
    this.journeyCoordinates = [];
    this.speedometer = document.getElementById("speedometer");
    this.chartElement = document.getElementById("speedChart").getContext("2d");
    this.initMetrics();
    this.initChart();
    this.getCurrentLocation();
  }
  startRecording() {
    this.resetData();
    this.watchId = navigator.geolocation.watchPosition((position) => {
      const currentSpeedInKmPerHour = Math.round(position.coords.speed * 3.6);
      this.updatePositionOnMap(position.coords);
      this.updateSpeed(new DataPoint(position.timestamp, currentSpeedInKmPerHour));
    }, (error) => console.error("Error watching the position", error), {enableHighAccuracy: true});
  }
  stopRecording() {
    navigator.geolocation.clearWatch(this.watchId);
    this.watchId = null;
    localStorage.setItem("speedHistory", JSON.stringify(this.speedHistory));
    localStorage.setItem("journeyCoordinates", JSON.stringify(this.journeyCoordinates));
    Utils.allMetrics().forEach((metric) => {
      const lowerCaseMetric = metric.toString().toLowerCase();
      const singleMetricHistory = this.metricsHistory.filter((m) => m.name === lowerCaseMetric);
      localStorage.setItem(`${lowerCaseMetric}History`, JSON.stringify(singleMetricHistory));
    });
    console.debug("Speed History", this.speedHistory);
    console.debug("Metrics History", this.metricsHistory);
    console.debug("Journey Coordinates", this.journeyCoordinates);
  }
  resetData() {
    localStorage.clear();
    this.speedHistory = [];
    this.metricsHistory = [];
    this.journeyCoordinates = [];
  }
  initMetrics() {
    Utils.allMetrics().forEach((metric) => {
      const metricElement = new MetricElement(metric.toString().toLowerCase());
      metricElement.setScore(0);
      this.metrics.push(metricElement);
    });
  }
  updateMetric(metricRecord) {
    this.metricsHistory.push(metricRecord);
    this.metrics.find((m) => m.name == metricRecord.name).setScore(metricRecord.data.value);
  }
  updateSpeed(speedRecord) {
    this.speedHistory.push(speedRecord);
    this.speedometer.textContent = `${speedRecord.value}`;
    Utils.updateChartWith(this.chart, this.chartElement, speedRecord);
  }
  initChart() {
    this.chart = new Chart(this.chartElement, {
      type: "line",
      data: {
        labels: this.speedHistory.map((data) => data.timestamp),
        datasets: [{
          label: "Speed (km/h)",
          data: this.speedHistory.map((data) => data.value),
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
            ticks: {autoSkip: true, maxTicksLimit: 4},
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
      navigator.geolocation.getCurrentPosition((position) => {
        this.initMap(position.coords);
      }, (error) => console.error("Error getting the current location", error), {enableHighAccuracy: true});
    } else {
      console.warn("Geolocation is not supported by this browser.");
    }
  }
  initMap(coordinates) {
    const latLng = new LatLng(coordinates.latitude, coordinates.longitude);
    this.map = L.map("map").setView(latLng, 18);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; Apolo Mc Melo"
    }).addTo(this.map);
    L.marker(latLng).addTo(this.map);
  }
  updatePositionOnMap(coordinates) {
    const latLng = new LatLng(coordinates.latitude, coordinates.longitude);
    this.journeyCoordinates.push(latLng);
    this.map.setView(latLng, 18);
  }
  simulateMetricsChange(timestamp) {
    this.metrics.forEach((metric) => {
      const metricRecord = new MetricRecord(metric.name.toLowerCase(), new DataPoint(timestamp, Math.round(Math.random() * 80) + 20));
      this.metricsHistory.push(metricRecord);
      this.updateMetric(metricRecord);
    });
  }
  simulateSpeedChange(timestamp) {
    const speedRecord = new DataPoint(timestamp, Math.floor(Math.random() * 120) + 60);
    this.speedHistory.push(speedRecord);
    this.updateSpeed(speedRecord);
  }
}
