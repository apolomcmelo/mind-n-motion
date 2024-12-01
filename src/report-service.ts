import * as L from "leaflet";
import {LatLng} from "leaflet";
import {MetricRecord} from "./models/metric-record";
import {ReportInfo} from "./models/report-info";
import {Metrics} from "./enums/metrics";

export class ReportService {
    metrics: ReportInfo[]
    speed: ReportInfo
    map: L.Map
    chart: any
    chartElement: CanvasRenderingContext2D
    metricsHistory: MetricRecord[]
    journeyCoordinates: LatLng[]

    constructor() {
        this.chartElement = (document.getElementById('reportChart') as HTMLCanvasElement).getContext('2d')
        this.speed = new ReportInfo("Speed")

        Object
            .values(Metrics)
            .map(metric => this.metrics.push(new ReportInfo(metric.toString().toLowerCase())))
    }

    public generateReport() {
        // TO BE IMPLEMENTED
    }

}