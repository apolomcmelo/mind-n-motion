export class ReportInfo {
  constructor(name) {
    this.name = name;
    this.max = document.getElementById(`max-${name}`);
    this.avg = document.getElementById(`avg-${name}`);
  }
}
