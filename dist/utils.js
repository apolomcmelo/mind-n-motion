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
  formatElapsedTime(elapsedMs) {
    if (elapsedMs < 0) {
      throw new Error("End timestamp must be greater than or equal to start timestamp.");
    }
    if (elapsedMs < 1e3) {
      return `${elapsedMs} milliseconds`;
    }
    const elapsedSeconds = elapsedMs / 1e3;
    if (elapsedSeconds < 60) {
      return `${Math.floor(elapsedSeconds)} seconds`;
    }
    const elapsedMinutes = elapsedSeconds / 60;
    if (elapsedMinutes < 60) {
      return `${Math.floor(elapsedMinutes)} minutes`;
    }
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    const remainingMinutes = Math.floor(elapsedMinutes % 60);
    if (remainingMinutes == 0) {
      return `${elapsedHours} hours`;
    } else {
      return `${elapsedHours} hours and ${remainingMinutes} minutes`;
    }
  }
  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const options = {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    };
    return date.toLocaleTimeString("en-GB", options).replace("at", "-");
  }
  formatDistance(distance) {
    return distance < 1e3 ? `${distance.toFixed(0)}m` : `${(distance / 1e3).toFixed(2)}km`;
  }
  getChartLabelFontSize() {
    return this.isMobile() ? 28 : 12;
  }
  getLegendSize() {
    return this.isMobile() ? 20 : 12;
  }
  getLegendBorderRadius() {
    return this.isMobile() ? 16 : 8;
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
  isMobile() {
    return window.matchMedia("min-width: 360px").matches && window.matchMedia("max-width: 390px").matches && window.matchMedia("min-height: 780px").matches && window.matchMedia("max-height: 850px").matches && window.matchMedia("-webkit-device-pixel-ratio: 3").matches;
  }
}
export const Utils = UtilsService.instance;
