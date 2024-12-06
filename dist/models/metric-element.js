export class MetricElement {
  constructor(name) {
    this.radius = 28;
    this.circumference = 2 * Math.PI * this.radius;
    this.name = name;
    this.htmlElement = document.getElementById(`${name.toLowerCase()}-metric`);
    this.progressCircle = this.htmlElement.getElementsByClassName("progress-ring")[0];
    this.scoreLabel = this.htmlElement.getElementsByClassName("percentage-label")[0];
  }
  setScore(score) {
    this.progressCircle.setAttribute("stroke-dasharray", `${this.circumference}`);
    this.progressCircle.setAttribute("stroke-dashoffset", `${this.circumference - score / 100 * this.circumference}`);
    this.scoreLabel.textContent = `${score}`;
  }
}
