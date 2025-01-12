import {Metrics} from "./enums/metrics.js";
class UtilsService {
  constructor() {
  }
  static get instance() {
    return this._instance || (this._instance = new this());
  }
  log(message, level = "info") {
    console[level](message);
    let log = document.createElement("span");
    log.textContent = message;
    log.classList.add(level);
    let logElement = document.getElementById("log");
    logElement.appendChild(log);
  }
  getAverage(array) {
    return Math.round(array.reduce((sum, currentValue) => sum + currentValue, 0) / array.length);
  }
  getMax(array) {
    return Math.max(...array);
  }
  timestampToDate(timestamp) {
    return new Date(timestamp).toLocaleTimeString("en-US", {hour12: false});
  }
  createChartHorizontalGradient(chartElement) {
    const gradient = chartElement.createLinearGradient(0, 0, chartElement.canvas.width, 0);
    gradient.addColorStop(0, "#9D00FF");
    gradient.addColorStop(0.25, "#00F0FF");
    return gradient;
  }
  createChartVerticalGradient(chartElement) {
    const gradient = chartElement.createLinearGradient(0, 0, 0, chartElement.canvas.height);
    gradient.addColorStop(0, "#00F0FF");
    gradient.addColorStop(1, "#9D00FF");
    return gradient;
  }
  updateChartWith(chart, chartElement, dataPoint) {
    chart.data.labels.push(dataPoint.timestamp);
    chart.data.datasets[0].data.push(dataPoint.value);
    chart.data.datasets[0].borderColor = this.createChartHorizontalGradient(chartElement);
    chart.update();
  }
  updateInfo(data, reportInfo, infoSuffix) {
    reportInfo.max.innerText = `Max: ${this.getMax(data)}${infoSuffix}`;
    reportInfo.avg.innerText = `Avg: ${this.getAverage(data)}${infoSuffix}`;
  }
  allMetrics() {
    return Object.getOwnPropertyNames(Metrics).filter((prop) => isNaN(parseInt(prop)));
  }
  performanceMetrics() {
    return this.allMetrics().filter((metric) => metric != "SPEED");
  }
}
export const Utils = UtilsService.instance;
