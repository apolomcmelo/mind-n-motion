import {Utils} from "../utils.js";
export class MetricElement {
  constructor(name) {
    this.name = name;
    this.htmlElement = document.getElementById(`${name.toLowerCase()}-metric`);
    this.progressBackground = this.htmlElement.getElementsByClassName("progress-background")[0];
    this.progressCircle = this.htmlElement.getElementsByClassName("progress-ring")[0];
    this.scoreLabel = this.htmlElement.getElementsByClassName("percentage-label")[0];
    this.radius = Utils.isMobile() ? 85 : 28;
    this.circumference = 2 * Math.PI * 120;
    this.updateSize();
  }
  setScore(score) {
    this.progressCircle.setAttribute("stroke-dasharray", `${this.circumference}`);
    this.progressCircle.setAttribute("stroke-dashoffset", `${this.circumference - score / 100 * this.circumference}`);
    this.scoreLabel.textContent = `${score}`;
  }
  updateSize() {
    const svgSize = (Utils.isMobile() ? 110 : 35).toString();
    this.progressBackground.setAttribute("cx", svgSize);
    this.progressBackground.setAttribute("cy", svgSize);
    this.progressBackground.setAttribute("r", this.radius.toString());
    this.progressCircle.setAttribute("cx", svgSize);
    this.progressCircle.setAttribute("cy", svgSize);
    this.progressCircle.setAttribute("r", this.radius.toString());
  }
}
