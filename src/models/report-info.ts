export class ReportInfo {
    name: string
    max: HTMLElement
    avg: HTMLElement

    constructor(name: string) {
        this.name = name
        this.max = document.getElementById(`max-${name}`)
        this.avg = document.getElementById(`avg-${name}`)
    }

}