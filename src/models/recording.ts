import {Subject} from "./subject";
import {Vehicle} from "./vehicle";
import {MetricRecord} from "./metric-record";
import {LatLng} from "leaflet";
import {Metrics} from "../enums/metrics";

export class Recording {
    subject: Subject
    vehicle: Vehicle
    initialTimestamp: number
    finalTimestamp: number
    metricRecords: MetricRecord[]
    journeyCoordinates: LatLng[]

    constructor(subject: Subject = null, vehicle: Vehicle = null) {
        this.subject = subject
        this.vehicle = vehicle
        this.initialTimestamp = Date.now()
        this.metricRecords = []
        this.journeyCoordinates = []
    }

    recordsOf(metricName: string) {
        return this.metricRecords.filter(record => record.name === metricName)
    }

    get speedRecords(): MetricRecord[] {
        return this.recordsOf(Metrics[Metrics.SPEED].toLowerCase())
    }
}