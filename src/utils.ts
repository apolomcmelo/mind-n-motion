import {ReportInfo} from "./models/report-info";
import {DataPoint} from "./models/data-point";
import {Chart} from "chart.js";
import {Metrics} from "./enums/metrics";

class UtilsService
{
    private static _instance: UtilsService;

    private constructor() { }

    public static get instance() {  return this._instance || (this._instance = new this()); }

    public getAverage(array: number[]) {
        return Math.round(array.reduce((sum, currentValue) => sum + currentValue, 0) / array.length);
    }

    public getMax(array: number[]) {
        return Math.max(...array)
    }

    public timestampToDate(timestamp: number) {
        return new Date(timestamp).toLocaleTimeString('en-US', {hour12: false});
    }

    // Chart Utils
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
            .filter(prop => isNaN(parseInt(prop)));
    }
}

export const Utils = UtilsService.instance;