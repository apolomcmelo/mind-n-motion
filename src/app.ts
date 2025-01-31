import {Pages} from "./enums/pages";
import {RecordingService} from "./recording-service";
import {ReportService} from "./report-service";

export class App {
    // UI Elements
    pages: HTMLElement[]

    // Buttons
    reportButton: HTMLElement
    settingsButton: HTMLElement
    recordingButton: HTMLElement
    recordingButtonIcon: HTMLElement

    isRecording: Boolean = false
    isRecordingPageVisible = true

    // Pages Services
    recordingService: RecordingService
    reportService: ReportService

    constructor() {
        // Bind UI elements
        this.pages = Array.from(document.querySelectorAll('.page'))
        this.settingsButton = document.getElementById("settings-page-button")
        this.recordingButton = document.getElementById('start-stop-button')
        this.recordingButtonIcon = document.getElementById('start-stop-button-icon')
        this.reportButton = document.getElementById("report-page-button")

        // Instantiate services
        this.recordingService = new RecordingService()
        this.reportService = new ReportService()

        this.registerButtonListeners()
        this.loadRecordingPage();  // This is the initial page

        // this.startSimulation()
    }

    private registerButtonListeners() {
        this.settingsButton.addEventListener('click', (event) => this.loadSettingsPage())
        this.reportButton.addEventListener('click', (event) => this.loadReportPage())
        this.recordingButton.addEventListener('click', (event) => {
            this.loadRecordingPage();

            if (this.isRecording) {
                this.recordingService.stopRecording();
                this.toggleRecording();
            } else if(this.isRecordingPageVisible){
                this.recordingService.startRecording();
                this.toggleRecording();
            } else {
                this.isRecordingPageVisible = true;
                this.recordingButtonIcon.classList.add("ri-play-fill");
                this.recordingButtonIcon.classList.remove("ri-brain-2-line");
            }

        });
    }

    private toggleRecording() {
        this.recordingButtonIcon.classList.toggle("ri-play-fill");
        this.recordingButtonIcon.classList.toggle("ri-stop-fill");
        this.isRecording = !this.isRecording
    }

    private resetRecordingPage() {
        this.isRecordingPageVisible = false;
        this.recordingButtonIcon.classList.remove("ri-stop-fill");
        this.recordingButtonIcon.classList.remove("ri-play-fill");
        this.recordingButtonIcon.classList.add("ri-brain-2-line");
    }

    private loadSettingsPage() {
        if(this.isRecording) {
            alert("Please stop recording before changing page")
            return;
        }
        this.settingsButton.classList.add("active");
        this.recordingButtonIcon.classList.remove("active");
        this.reportButton.classList.remove("active");

        this.resetRecordingPage()

        this.showPage(Pages.SETTINGS)
    }

    private loadRecordingPage() {
        this.recordingButtonIcon.classList.add("active");
        this.settingsButton.classList.remove("active");
        this.reportButton.classList.remove("active");

        this.showPage(Pages.RECORDING)
    }

    private loadReportPage() {
        if(this.isRecording) {
            alert("Please stop recording before changing page")
            return;
        }
        this.reportButton.classList.add("active");
        this.recordingButtonIcon.classList.remove("active");
        this.settingsButton.classList.remove("active");

        this.resetRecordingPage()
        this.reportService.generateReport()

        this.showPage(Pages.REPORT)
    }

    private showPage(index: number) {
        this.pages.forEach((page, i) => {
            if (i === index) {
                page.classList.add('active');
                page.classList.remove('out-left', 'out-right');
            } else {
                page.classList.remove('active');
                page.classList.add(i < index ? 'out-left' : 'out-right');
            }
        });
    }

    private startServiceWorker() {
        navigator.serviceWorker.register('./service-worker.js', {
            scope: './'
        });
    }

    private startSimulation() {
        setInterval(() => {
            let now = Date.now()
            this.recordingService.simulateMetricsChange(now);
            this.recordingService.simulateSpeedChange(now);
        }, 2000);
    }

}