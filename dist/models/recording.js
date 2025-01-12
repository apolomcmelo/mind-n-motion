import {Metrics} from "../enums/metrics.js";
export class Recording {
  constructor(subject = null, vehicle = null) {
    this.subject = subject;
    this.vehicle = vehicle;
    this.initialTimestamp = Date.now();
    this.metricRecords = [];
    this.journeyCoordinates = [];
  }
  recordsOf(metricName) {
    return this.metricRecords.filter((record) => record.name === metricName);
  }
  get speedRecords() {
    return this.recordsOf(Metrics[Metrics.SPEED].toLowerCase());
  }
}
