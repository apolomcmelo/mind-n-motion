export class MetricElement {
    private radius = 28; // Radius of the ring bars
    private circumference = 2 * Math.PI * this.radius;

    private htmlElement: HTMLElement
    private progressCircle: Element
    private scoreLabel: Element

    name: string
    constructor(name: string) {
        this.name = name

        this.htmlElement = document.getElementById(`${name.toLowerCase()}-metric`)
        this.progressCircle = this.htmlElement.getElementsByClassName("progress-ring")[0]
        this.scoreLabel = this.htmlElement.getElementsByClassName("percentage-label")[0]
    }

    public setScore(score: number) {
        this.progressCircle.setAttribute('stroke-dasharray', `${this.circumference}`);
        this.progressCircle.setAttribute('stroke-dashoffset', `${this.circumference - (score / 100) * this.circumference}`);
        this.scoreLabel.textContent = `${score}`;
    }
}