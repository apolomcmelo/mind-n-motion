import {Utils} from "../utils.js";
export class DataPoint {
  constructor(timestamp, value) {
    this.timestamp = Utils.timestampToDate(timestamp);
    this.value = value;
  }
}
