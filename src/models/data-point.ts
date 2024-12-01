import {Utils} from "../utils";

export class DataPoint {
    timestamp: string
    value: number

    constructor(timestamp: number, value: number) {
        this.timestamp = Utils.timestampToDate(timestamp)
        this.value = value
    }

}