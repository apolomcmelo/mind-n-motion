export class ReportInfo {
    max: HTMLElement
    avg: HTMLElement

    constructor(name: string) {
        this.max = document.getElementById(`max${name}`)
        this.avg = document.getElementById(`avg${name}`)
    }

}