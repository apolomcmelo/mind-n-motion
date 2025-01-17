import {ReportInfo} from "./models/report-info";
import {DataPoint} from "./models/data-point";
import {Chart} from "chart.js";
import {Metrics} from "./enums/metrics";

class UtilsService
{
    private static _instance: UtilsService;

    private constructor() { }

    public static get instance() {  return this._instance || (this._instance = new this()); }

    public log(message: string, level: string = "info") {
        console[level](message)

        let log = document.createElement("span")
        log.textContent = message
        log.classList.add(level)

        let logElement = document.getElementById("log")
        logElement.appendChild(log)
    }
    public getAverage(array: number[]) {
        return Math.round(array.reduce((sum, currentValue) => sum + currentValue, 0) / array.length);
    }

    public getMax(array: number[]) {
        return Math.max(...array)
    }

    public timestampToDate(timestamp: number) {
        return new Date(timestamp).toLocaleTimeString('en-US', {hour12: false});
    }

    public formatElapsedTime(elapsedMs: number): string {
        if (elapsedMs < 0) {
            throw new Error("End timestamp must be greater than or equal to start timestamp.");
        }

        if (elapsedMs < 1000) {
            return `${elapsedMs} milliseconds`;
        }

        const elapsedSeconds = elapsedMs / 1000;
        if (elapsedSeconds < 60) {
            return `${Math.floor(elapsedSeconds)} seconds`;
        }

        const elapsedMinutes = elapsedSeconds / 60;
        if (elapsedMinutes < 60) {
            return `${Math.floor(elapsedMinutes)} minutes`;
        }

        const elapsedHours = Math.floor(elapsedMinutes / 60);
        const remainingMinutes = Math.floor(elapsedMinutes % 60);

        if(remainingMinutes == 0) {
            return `${elapsedHours} hours`;
        } else {
            return `${elapsedHours} hours and ${remainingMinutes} minutes`;
        }
    }

    public formatTimestamp(timestamp: number): string {
        const date = new Date(timestamp);

        const options: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,  // 24-hour format
        };

        return date.toLocaleTimeString("en-GB", options).replace("at", "-");
    }

    public formatDistance(distance: number): string {
       return distance < 1000 ? `${distance.toFixed(0)}m` : `${(distance / 1000).toFixed(2)}km`;
    }

    // Chart Utils
    public getChartLabelFontSize() {
        return this.isMobile() ? 8 : 12;
    }

    public getLegendSize() {
        return this.isMobile() ? 8 : 12;
    }

    public getLegendBorderRadius() {
        return this.isMobile() ? 6 : 8;
    }

    public createChartHorizontalGradient(chartElement: CanvasRenderingContext2D) {
        const gradient = chartElement.createLinearGradient(0, 0, chartElement.canvas.width, 0);

        gradient.addColorStop(0, '#9D00FF');
        gradient.addColorStop(0.25, '#00F0FF');

        return gradient;
    }

    public createChartVerticalGradient(chartElement: CanvasRenderingContext2D) {
        const gradient = chartElement.createLinearGradient(0, 0, 0, chartElement.canvas.height);

        gradient.addColorStop(0, '#00F0FF');
        gradient.addColorStop(1, '#9D00FF');

        return gradient;
    }

    public updateChartWith(chart: Chart, chartElement: CanvasRenderingContext2D, dataPoint: DataPoint) {
        chart.data.labels.push(dataPoint.timestamp);
        chart.data.datasets[0].data.push(dataPoint.value);

        chart.data.datasets[0].borderColor = this.createChartHorizontalGradient(chartElement);

        chart.update();
    }

    public updateInfo(data: number[], reportInfo: ReportInfo, infoSuffix: string) {
        reportInfo.max.innerText = `Max: ${this.getMax(data)}${infoSuffix}`
        reportInfo.avg.innerText = `Avg: ${this.getAverage(data)}${infoSuffix}`
    }

    public allMetrics() {
        return Object
            .getOwnPropertyNames(Metrics)
            .filter(prop => isNaN(parseInt(prop)))
    }

    public performanceMetrics() {
        return this.allMetrics().filter(metric => metric != "SPEED")
    }

    public isMobile() {
        return window.matchMedia('(device-width: 360px)').matches &&
               window.matchMedia('(device-height: 780px)').matches &&
               window.matchMedia('(-webkit-device-pixel-ratio: 3)').matches
    }
}

export const Utils = UtilsService.instance;