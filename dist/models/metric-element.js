export class MetricElement {
  constructor(name) {
    this.name = name;
    this.htmlElement = document.getElementById(`${name.toLowerCase()}-metric`);
    this.progressBackground = this.htmlElement.getElementsByClassName("progress-background")[0];
    this.progressCircle = this.htmlElement.getElementsByClassName("progress-ring")[0];
    this.scoreLabel = this.htmlElement.getElementsByClassName("percentage-label")[0];
    this.radius = window.matchMedia("(width: 1080px)").matches && window.matchMedia("(height: 2340px)").matches ? 85 : 28;
    this.circumference = 2 * Math.PI * 120;
    this.updateSize();
  }
  setScore(score) {
    this.progressCircle.setAttribute("stroke-dasharray", `${this.circumference}`);
    this.progressCircle.setAttribute("stroke-dashoffset", `${this.circumference - score / 100 * this.circumference}`);
    this.scoreLabel.textContent = `${score}`;
  }
  updateSize() {
    if (window.matchMedia("(width: 1080px)").matches && window.matchMedia("(height: 2340px)").matches) {
      this.progressBackground.setAttribute("cx", "110");
      this.progressBackground.setAttribute("cy", "110");
      this.progressCircle.setAttribute("cx", "110");
      this.progressCircle.setAttribute("cy", "110");
    } else {
      this.progressBackground.setAttribute("cx", "35");
      this.progressBackground.setAttribute("cy", "35");
      this.progressCircle.setAttribute("cx", "35");
      this.progressCircle.setAttribute("cy", "35");
    }
    this.progressBackground.setAttribute("r", this.radius.toString());
    this.progressCircle.setAttribute("r", this.radius.toString());
  }
}
