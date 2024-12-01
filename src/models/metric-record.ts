import {DataPoint} from "./data-point";

export class MetricRecord {
    name: string
    data: DataPoint

    constructor(name: string, data: DataPoint) {
        this.name = name;
        this.data = data;
    }
}