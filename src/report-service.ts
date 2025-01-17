import * as L from "leaflet";
import {MetricRecord} from "./models/metric-record";
import {ReportInfo} from "./models/report-info";
import {Utils} from "./utils";
import {DataPoint} from "./models/data-point";
import Chart from 'chart.js/auto';
import {Recording} from "./models/recording";
import {getPathLength} from "geolib";

export class ReportService {
    performanceMetrics: ReportInfo[] = []
    speed: ReportInfo
    distance: HTMLElement
    map: L.Map
    chart: any
    chartElement: CanvasRenderingContext2D
    metricsChartColours: string[]
    recording: Recording

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
        this.distance = document.getElementById("distance")

        Utils.performanceMetrics().map(metric => this.performanceMetrics.push(new ReportInfo(metric.toString().toLowerCase())))
    }

    public generateReport() {
        const recordingData = (JSON.parse(localStorage.getItem("recording")) as Recording)
        this.recording = Object.assign(new Recording(), recordingData);

        const speedHistory = this.recording.recordsOf("speed").map(record => record.data)
        const metricsHistory = this.performanceMetrics.map(metric => this.recording.recordsOf(metric.name))

        this.updateRecordingMetadataInfo()
        this.updateDistanceInfo()
        Utils.updateInfo(speedHistory.map(s => s.value), this.speed, "km/h")

        metricsHistory.forEach(metricHistory => {
            let reportInfo = this.performanceMetrics.find(metricInfo => metricInfo.name === metricHistory[0].name)
            Utils.updateInfo(metricHistory.map(metricRecord => metricRecord.data.value), reportInfo, "")
        })

        this.initReportMap()
        this.initReportChart(speedHistory, metricsHistory)
    }

    // #### Map
    private initReportMap() {
        const coordinates = this.recording.journeyCoordinates

        if(coordinates) {
            const firstCoordinate = coordinates[0];
            const lastCoordinate = coordinates[coordinates.length - 1];

            this.map = L.map('report-map').setView(firstCoordinate, 15);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; Apolo Mc Melo'
            }).addTo(this.map);

            L.polyline(coordinates, { color: 'blue' }).addTo(this.map);

            L.marker(firstCoordinate).addTo(this.map);
            L.marker(lastCoordinate).addTo(this.map);
        }
    }

    private createSpeedDataset(data: DataPoint[]) {
        return {
            label: 'speed',
            data: data.map(dataPoint => ({
                x: Utils.timestampToDate(dataPoint.timestamp),
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
                x: Utils.timestampToDate(dataPoint.data.timestamp),
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

    private updateRecordingMetadataInfo() {
        const subjectElement = document.getElementById("subject")
        subjectElement.innerText = this.recording.subject.name

        const recordingTimeElement = document.getElementById("recording-time")
        recordingTimeElement.innerText = Utils.formatTimestamp(this.recording.initialTimestamp)
    }

    private updateDistanceInfo() {
        const geolibCoordinates = this.recording.journeyCoordinates.map(coord => ({
            latitude: coord.lat,
            longitude: coord.lng,
        }));

        const totalDistance = getPathLength(geolibCoordinates);
        const totalTime = this.recording.finalTimestamp - this.recording.initialTimestamp;

        this.distance.innerText = `${Utils.formatDistance(totalDistance)} in ${Utils.formatElapsedTime(totalTime)}`;
    }

}