import * as L from "../_snowpack/pkg/leaflet.js";
import {ReportInfo} from "./models/report-info.js";
import {Utils} from "./utils.js";
import Chart from "../_snowpack/pkg/chartjs/auto.js";
import {Recording} from "./models/recording.js";
import {getPathLength} from "../_snowpack/pkg/geolib.js";
export class ReportService {
  constructor() {
    this.performanceMetrics = [];
    this.metricsChartColours = [
      "rgba(55, 124, 200, 0.5)",
      "rgba(210, 151, 20, 0.5)",
      "rgba(121, 126, 219, 0.5)",
      "rgba(25, 168, 83, 0.5)",
      "rgba(83, 199, 201, 0.5)",
      "rgba(223, 65, 52, 0.5)"
    ];
    this.chartElement = document.getElementById("reportChart").getContext("2d");
    this.speed = new ReportInfo("speed");
    this.distance = document.getElementById("distance");
    Utils.performanceMetrics().map((metric) => this.performanceMetrics.push(new ReportInfo(metric.toString().toLowerCase())));
  }
  generateReport() {
    const recordingData = JSON.parse(localStorage.getItem("recording"));
    this.recording = Object.assign(new Recording(), recordingData);
    const speedHistory = this.recording.recordsOf("speed").map((record) => record.data);
    const metricsHistory = this.performanceMetrics.map((metric) => this.recording.recordsOf(metric.name));
    this.updateRecordingMetadataInfo();
    this.updateDistanceInfo();
    Utils.updateInfo(speedHistory.map((s) => s.value), this.speed, "km/h");
    metricsHistory.forEach((metricHistory) => {
      let reportInfo = this.performanceMetrics.find((metricInfo) => metricInfo.name === metricHistory[0].name);
      Utils.updateInfo(metricHistory.map((metricRecord) => metricRecord.data.value), reportInfo, "");
    });
    this.initReportMap();
    this.initReportChart(speedHistory, metricsHistory);
  }
  initReportMap() {
    const coordinates = this.recording.journeyCoordinates;
    if (coordinates) {
      const firstCoordinate = coordinates[0];
      const lastCoordinate = coordinates[coordinates.length - 1];
      this.map = L.map("report-map").setView(firstCoordinate, 15);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; Apolo Mc Melo"
      }).addTo(this.map);
      L.polyline(coordinates, {color: "blue"}).addTo(this.map);
      L.marker(firstCoordinate).addTo(this.map);
      L.marker(lastCoordinate).addTo(this.map);
    }
  }
  createSpeedDataset(data) {
    return {
      label: "speed",
      data: data.map((dataPoint) => ({
        x: Utils.timestampToDate(dataPoint.timestamp),
        y: dataPoint.value
      })),
      borderColor: Utils.createChartVerticalGradient(this.chartElement),
      borderWidth: 2,
      fill: false,
      pointRadius: 0,
      tension: 0.4
    };
  }
  createMetricDataset(data, colour) {
    return {
      label: data[0].name,
      data: data.map((dataPoint) => ({
        x: Utils.timestampToDate(dataPoint.data.timestamp),
        y: dataPoint.data.value
      })),
      borderColor: colour,
      borderWidth: 1,
      fill: false,
      pointRadius: 0,
      tension: 0.4
    };
  }
  initReportChart(speedHistory, metricsHistory) {
    if (this.chart) {
      this.chart.update();
    } else {
      let datasets = [];
      datasets.push(this.createSpeedDataset(speedHistory));
      metricsHistory.forEach((history, index) => datasets.push(this.createMetricDataset(history, this.metricsChartColours[index])));
      this.chart = new Chart(this.chartElement, {
        type: "line",
        data: {
          datasets
        },
        options: {
          responsive: true,
          scales: {
            x: {
              type: "category",
              border: {
                display: false
              },
              ticks: {
                font: {
                  size: Utils.getLegendSize()
                }
              }
            },
            y: {
              title: {display: false, text: "Value"},
              ticks: {
                autoSkip: true,
                maxTicksLimit: 10,
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
              display: true,
              position: "bottom",
              labels: {
                boxWidth: Utils.getLegendSize(),
                useBorderRadius: true,
                borderRadius: 8,
                font: {
                  size: Utils.getChartLabelFontSize()
                }
              }
            }
          }
        }
      });
    }
  }
  updateRecordingMetadataInfo() {
    const subjectElement = document.getElementById("subject");
    subjectElement.innerText = this.recording.subject.name;
    const recordingTimeElement = document.getElementById("recording-time");
    recordingTimeElement.innerText = Utils.formatTimestamp(this.recording.initialTimestamp);
  }
  updateDistanceInfo() {
    const geolibCoordinates = this.recording.journeyCoordinates.map((coord) => ({
      latitude: coord.lat,
      longitude: coord.lng
    }));
    const totalDistance = getPathLength(geolibCoordinates);
    const totalTime = this.recording.finalTimestamp - this.recording.initialTimestamp;
    this.distance.innerText = `${Utils.formatDistance(totalDistance)} in ${Utils.formatElapsedTime(totalTime)}`;
  }
}
