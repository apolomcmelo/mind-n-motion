import * as L from "leaflet";
import {MetricRecord} from "./models/metric-record";
import {ReportInfo} from "./models/report-info";
import {Metrics} from "./enums/metrics";
import {Utils} from "./utils";
import {DataPoint} from "./models/data-point";
import Chart from 'chart.js/auto';

export class ReportService {
    metrics: ReportInfo[] = []
    speed: ReportInfo
    map: L.Map
    chart: any
    chartElement: CanvasRenderingContext2D
    metricsChartColours: string[]

    constructor() {
        this.metricsChartColours = [
            'rgba(55, 124, 200, 0.5)',
            'rgba(210, 151, 20, 0.5)',
            'rgba(121, 126, 219, 0.5)',
            'rgba(25, 168, 83, 0.5)',
            'rgba(83, 199, 201, 0.5)',
            'rgba(223, 65, 52, 0.5)'
        ]

        this.chartElement = (document.getElementById('reportChart') as HTMLCanvasElement).getContext('2d')
        this.speed = new ReportInfo("speed")

        Utils.allMetrics().map(metric => this.metrics.push(new ReportInfo(metric.toString().toLowerCase())))
    }

    public generateReport() {
        const speedHistory = JSON.parse(localStorage.getItem("speedHistory")) as DataPoint[]
        const metricsHistory = this.metrics.map(m => JSON.parse(localStorage.getItem(`${m.name}History`)) as MetricRecord[])

        Utils.updateInfo(speedHistory.map(s => s.value), this.speed, "km/h")

        metricsHistory.forEach(metricHistory => {
            let reportInfo = this.metrics.find(metricInfo => metricInfo.name === metricHistory[0].name)
            Utils.updateInfo(metricHistory.map(metricRecord => metricRecord.data.value), reportInfo, "")
        })

        this.initReportMap()
        this.initReportChart(speedHistory, metricsHistory)
    }

    // #### Map
    private initReportMap() {
        const coordinates = localStorage.getItem("journeyCoordinates")

        if(coordinates) {
            const parsedCoordinates = JSON.parse(coordinates)
            const firstCoordinate = parsedCoordinates[0];
            const lastCoordinate = parsedCoordinates[parsedCoordinates.length - 1];

            this.map = L.map('report-map').setView(firstCoordinate, 15);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; Apolo Mc Melo'
            }).addTo(this.map);

            L.polyline(parsedCoordinates, { color: 'blue' }).addTo(this.map);

            L.marker(firstCoordinate).addTo(this.map);
            L.marker(lastCoordinate).addTo(this.map);
        }
    }

    private createSpeedDataset(data: DataPoint[]) {
        return {
            label: 'speed',
            data: data.map(dataPoint => ({
                x: dataPoint.timestamp,
                y: dataPoint.value
            })),
            borderColor: Utils.createChartVerticalGradient(this.chartElement),
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
            tension: 0.4,
        }
    }

    private createMetricDataset(data: MetricRecord[], colour: string) {
        return {
            label: data[0].name,
            data: data.map(dataPoint => ({
                x: dataPoint.data.timestamp,
                y: dataPoint.data.value
            })),
            borderColor: colour,
            borderWidth: 1,
            fill: false,
            pointRadius: 0,
            tension: 0.4,
        }
    }

    // #### Report
    private initReportChart(speedHistory: DataPoint[], metricsHistory: MetricRecord[][]) {
        if(this.chart) {
            this.chart.update()
        } else {
            let datasets = []

            datasets.push(this.createSpeedDataset(speedHistory))
            metricsHistory.forEach((history, index) => datasets.push(this.createMetricDataset(history, this.metricsChartColours[index])))

            this.chart = new Chart(this.chartElement, {
                type: 'line',
                data: {
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            type: 'category',
                            border: {
                                display: false
                            }
                        },
                        y: {
                            title: { display: false, text: 'Value' },
                            ticks: { autoSkip: true, maxTicksLimit: 10 },
                            beginAtZero: true,
                            border: { display: false },
                            grid: { color: '#282828' }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                                boxWidth: 12,
                                useBorderRadius: true,
                                borderRadius: 6
                            }
                        }
                    }
                }
            });
        }
    }

}